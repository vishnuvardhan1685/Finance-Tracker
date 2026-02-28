# 🏗️ System Design for Finance Tracker
## A Practical Guide (Built While You Learn)

> **Note:** You mentioned you haven't learned system design yet.
> This document is written so that **you learn the concept first**, then see exactly how it applies to this project.
> Every concept here is directly tied to a real feature you will build.

---

## Part 0 — Why System Design Matters in This Project

Right now, your app works fine for one user. But think about this:

- What happens when 500 users upload bank statements at the same time?
- What if a CSV has 2000 rows — should the server process all of it inside one HTTP request?
- If the category detection takes 10 seconds, should the user wait on the screen?
- What if the same user imports the same statement 3 times by accident?

These are **system design problems**. They're not about code syntax — they're about **how the pieces of your system are connected and how they behave under stress**.

The good news: your project is a perfect sandbox to learn these ideas because they appear naturally as features.

---

## Part 1 — The Big Picture Architecture

### What you have now (Monolith)
```
Browser
  │
  ▼
Express Server (api/server.js)
  │
  ├── Auth routes
  ├── Expense routes
  ├── Debt routes
  └── User routes
       │
       ▼
    MongoDB
```

Everything lives in one process. This is fine. **Monoliths are not bad** — they are simple and appropriate for this scale.

### What we'll evolve to (Still a Monolith, but structured)
```
Browser
  │
  ▼
Express Server
  │
  ├── Auth routes
  ├── Expense routes      ← extends to handle income too
  ├── Debt routes
  ├── Budget routes       ← NEW
  ├── Import routes       ← NEW (file upload endpoint)
  ├── Category routes     ← NEW (user-defined + system categories)
  └── User routes
       │
       ├── MongoDB (primary data store)
       │
       └── Redis (optional later) ← for job queues and caching
```

The **key system design ideas** this introduces:

1. **Asynchronous job processing** (import pipeline)
2. **Idempotency** (deduplication)
3. **Event-driven alerts** (budget breach)
4. **Caching** (category lookups)
5. **API design** (RESTful, versioned, paginated)
6. **Data modeling** (schema design for scale)

Each is explained below with exactly how it applies to your project.

---

## Part 2 — The Import Pipeline (Async Processing)

### The Concept: Synchronous vs Asynchronous

**Synchronous** = The server does the work and the user waits. Like ordering food and standing at the counter.

**Asynchronous** = The server accepts the job, puts it in a queue, and the user comes back later to pick it up. Like ordering food and getting a buzzer.

### Why your import CANNOT be fully synchronous

A user uploads an HDFC PDF with 400 transactions. Your server has to:
1. Parse the PDF (slow — 2-3 seconds)
2. Clean each row (moderate — 0.5 seconds for 400 rows)
3. Run category detection on each row (moderate)
4. Check for duplicates against DB (400 DB queries)
5. Write to MongoDB (400 writes)

Total time: **5–15 seconds**. HTTP requests time out at 30 seconds. Edge cases push it over.

And if 20 users do this simultaneously? The server chokes.

### Solution: Job Queue Pattern

```
User uploads file
      │
      ▼
POST /api/import/upload
      │
   Save file temporarily
   Create a Job record in DB: { status: "pending", userId, filePath }
   Return jobId to user immediately (202 Accepted)
      │
      ▼
Background Worker picks up job
      │
   Parse CSV/PDF
   Detect categories
   Deduplicate
   Write expenses to MongoDB
   Update Job record: { status: "completed", summary: { added: 392, skipped: 8 } }
      │
      ▼
User polls GET /api/import/jobs/:jobId
OR WebSocket pushes "job complete" event (you already have socket.io!)
```

### Concrete Code Structure (for later)
```
api/
  services/
    importService.js       ← orchestrates the whole import
  parsers/
    hdfc.js                ← HDFC CSV/PDF format adapter
    sbi.js                 ← SBI format adapter
    axis.js                ← Axis format adapter
    generic.js             ← fallback CSV parser
  workers/
    importWorker.js        ← background job processor
  models/
    ImportJob.js           ← { userId, status, filePath, summary, createdAt }
```

### System Design Concept Learned: **Producer-Consumer Pattern**
- Producer: The HTTP endpoint that accepts the file (`POST /import`)
- Queue: MongoDB ImportJob collection (simple) or Redis Bull queue (advanced)
- Consumer: The worker that processes the job

You already have `socket.io` in your `package.json` — you can use it to push "import complete" to the browser in real time. That's system design thinking!

---

## Part 3 — Idempotency (Deduplication)

### The Concept

**Idempotency** means: doing the same operation multiple times has the same result as doing it once.

If a user imports March's statement on Monday, and imports it again on Friday (forgot they already did it), the system should not create 400 duplicate expenses. The result should be exactly the same as importing it once.

### How to implement it

For every transaction, generate a **fingerprint hash**:

```javascript
// In api/services/importService.js
import crypto from 'crypto';

function generateTransactionHash(userId, date, amount, description) {
  const raw = `${userId}|${date}|${amount}|${description.toLowerCase().trim()}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}
```

Store this hash in the Expense document:
```javascript
// In Expense model (new field)
importHash: {
  type: String,
  sparse: true,   // only required for imported transactions
  index: true,    // fast lookup during dedup check
}
```

Before inserting an imported expense, check:
```javascript
const exists = await Expense.findOne({ importHash: hash });
if (exists) skip++;  // count as duplicate, don't insert
else { /* insert */ added++; }
```

### System Design Concept Learned: **Idempotency Keys**
This is the same concept banks use when processing payments. If a payment request is sent twice (network retry), the second one is rejected because the idempotency key is already recorded.

---

## Part 4 — Category Detection Engine (Rule-Based AI)

### The Concept: Rules Engine

Before jumping to machine learning, start with a **rules engine** — a lookup table of merchant keywords → categories. This is how most finance apps start, and it's often good enough.

```
"swiggy"        → Food
"zomato"        → Food
"irctc"         → Travel
"makemytrip"    → Travel
"netflix"       → Media Subscription
"spotify"       → Media Subscription
"amazon"        → Other Expenses  ← too broad, user corrects it
"flipkart"      → Other Expenses
"ola"           → Transportation
"uber"          → Transportation
"rapido"        → Transportation
"bescom"        → Utilities
"bsnl"          → Mobile Communication
```

### Architecture

```
api/
  services/
    categoryDetector.js    ← main detection function
  data/
    merchantRules.json     ← keyword → category mapping (start with ~300 rules)
```

```javascript
// categoryDetector.js
import rules from '../data/merchantRules.json' assert { type: 'json' };

export function detectCategory(description) {
  const lower = description.toLowerCase();
  
  for (const [keyword, category] of Object.entries(rules)) {
    if (lower.includes(keyword)) return category;
  }
  
  return 'Other Expenses'; // fallback
}
```

### User Correction Loop (Learning from usage)

When a user corrects a category ("Amazon" → "Electronics"), store that correction:

```javascript
// UserCategoryOverride model
{
  userId: ObjectId,
  keyword: "amazon",      // extracted from transaction description
  category: "Electronics" // what the user set it to
}
```

Next time that user imports a transaction with "amazon", check their personal overrides first, then the global rules. This is **personalization without ML**.

### System Design Concept Learned: **Layered Fallback System**
1. User's personal override (highest priority)
2. Global merchant rules
3. Default ("Other Expenses")

This is the same pattern used in CSS specificity, permission systems, and DNS resolution.

---

## Part 5 — Budget Alert System (Event-Driven Design)

### The Concept: Event-Driven Architecture

Instead of the app checking budgets on a timer ("check every hour"), budget alerts fire **reactively when something happens** (when an expense is added).

This is called **event-driven design**: something happens → an event fires → other parts of the system react.

### How it works in your app

```
User adds expense (manual or imported)
         │
         ▼
POST /api/expense  or  Import job completes
         │
         ▼
  [Budget Check Service]
  1. Find user's budget for this category + month
  2. Calculate current total spending in category
  3. If total >= 80% of limit → create "warning" alert
  4. If total >= 100% of limit → create "exceeded" alert
         │
         ▼
  Store alert in DB: { userId, type, category, message, isRead: false }
         │
         ▼
  Push via WebSocket (socket.io) → browser shows toast notification
  OR store for next page load
```

### Data Model for Budgets and Alerts

```javascript
// Budget model
{
  userId: ObjectId,
  category: String,       // "Food", "Travel", etc.
  month: String,          // "February"
  year: Number,           // 2026
  limit: Number,          // ₹5000
  alertAt: Number,        // 0.8 = alert at 80%
}

// Alert model
{
  userId: ObjectId,
  type: String,           // "budget_warning" | "budget_exceeded"
  category: String,
  message: String,        // "You've spent 85% of your Food budget"
  isRead: Boolean,
  createdAt: Date,
}
```

### API Routes to Add
```
GET    /api/budget              ← get all budgets for user
POST   /api/budget              ← create/update budget for a category+month
DELETE /api/budget/:id          ← remove budget

GET    /api/alerts              ← get unread alerts
PATCH  /api/alerts/:id/read    ← mark alert as read
DELETE /api/alerts/clear        ← clear all alerts
```

### System Design Concept Learned: **Event-Driven vs Polling**
- **Polling**: Frontend asks "any alerts?" every 30 seconds. Wastes requests.
- **Event-driven**: Backend pushes alert via WebSocket the moment it happens. Efficient, real-time.

You already have `socket.io` installed. This is exactly its purpose.

---

## Part 6 — API Design Principles

### RESTful API Design (What you already do well)

Your current API follows REST:
- `GET /api/expense` → list expenses
- `POST /api/expense` → create expense
- `PUT /api/expense/:id` → update expense
- `DELETE /api/expense/:id` → delete expense

### What to add as you grow

**1. Pagination** — When a user has 2000 transactions, sending all of them in one response is slow:
```javascript
// Current (problematic at scale)
GET /api/expense  → returns ALL expenses

// Better
GET /api/expense?page=1&limit=20  → returns 20 expenses + metadata
// Response includes: { data, total, page, pages, hasNext, hasPrev }
```

**2. Versioning** — If you ever change an API response shape, old app versions break:
```javascript
// Add version prefix
/api/v1/expense
/api/v1/budget
/api/v1/import
```

**3. Consistent Error Responses** — You already do this well:
```json
{ "success": false, "message": "Category is required", "errors": [] }
```

**4. Rate Limiting for import endpoint** — Prevent abuse:
```javascript
import rateLimit from 'express-rate-limit';
const importLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }); // 5 imports per 15 min
app.use('/api/import', importLimiter);
```

### System Design Concept Learned: **API Contract**
An API is a contract between the server and the client. Good contracts are versioned, paginated, rate-limited, and consistently structured.

---

## Part 7 — Database Design Decisions

### Current Schema Analysis

Your current schemas are lean and correct. Here's what needs to change:

#### Expense schema — fields to add
```javascript
// New fields (all optional, backward compatible)
source: { type: String, enum: ['manual', 'imported'], default: 'manual' },
type: { type: String, enum: ['expense', 'income'], default: 'expense' },
merchantRaw: { type: String },          // original bank statement description
importHash: { type: String, sparse: true, index: true }, // for dedup
tags: [{ type: String }],              // user-defined labels
```

#### New Category model (replace hardcoded array)
```javascript
// Category model
{
  name: String,         // "Food"
  icon: String,         // emoji or icon name
  color: String,        // hex color for charts
  isSystem: Boolean,    // true = shipped with app, false = user-created
  userId: ObjectId,     // null for system categories
}
```

### Indexing Strategy (Important for performance)

MongoDB without indexes does a full collection scan for every query. As data grows, this becomes very slow.

Your most frequent queries:
```javascript
// These need indexes:
Expense.find({ userId: X, year: Y })           // add compound index on { userId, year }
Expense.find({ userId: X, month: Y, year: Z }) // add compound index on { userId, month, year }
Expense.findOne({ importHash: X })              // add index on { importHash }
Debt.find({ userId: X })                        // already covered by userId index
```

Add to Expense model:
```javascript
expenseSchema.index({ userId: 1, year: 1 });
expenseSchema.index({ userId: 1, month: 1, year: 1 });
expenseSchema.index({ importHash: 1 }, { sparse: true });
```

### System Design Concept Learned: **Database Indexing**
An index is like a book's index — instead of reading every page to find "MongoDB", you jump directly to the page. Indexes trade write performance (slightly slower inserts) for read performance (much faster queries). Add indexes on fields you `find()` or `sort()` by frequently.

---

## Part 8 — Caching (When to add Redis)

### Do you need Redis right now? No.

### When will you need it? When these become slow:

1. **Category keyword map** — loaded from DB on every import row check. If you have 300 rules and process 400 rows, that's 400 × 300 = 120,000 rule checks per import. Cache the rule map in memory (or Redis).

2. **User's monthly stats** — computed by aggregating all expenses. If you compute this on every page load for 1000 users, MongoDB works hard for nothing. Cache the result with a 5-minute TTL.

3. **Budget totals** — recalculated on every expense add. Cache per user+category+month, invalidate when a new expense is added.

### Simple in-memory cache (first step, no Redis needed)
```javascript
// api/utils/cache.js
const cache = new Map();

export function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.value;
}

export function setCache(key, value, ttlMs = 5 * 60 * 1000) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
```

### System Design Concept Learned: **Cache-Aside Pattern**
```
Request comes in
     │
     ▼
Check cache → HIT? → Return cached data (fast)
     │
    MISS
     │
     ▼
Query DB → Store result in cache → Return data
```
This is the most common caching pattern. Used by almost every web application at scale.

---

## Part 9 — Security Considerations

Since you're handling financial data, security is not optional.

| Threat | Current Status | Fix |
|---|---|---|
| Unauthorized access | ✅ JWT + httpOnly cookies | Already done |
| SQL/NoSQL injection | ✅ Mongoose sanitizes | Already done |
| Brute force login | ❌ No rate limiting | Add `express-rate-limit` to `/api/auth` |
| Malicious file uploads | ❌ No file validation | Validate MIME type + file size in multer |
| XSS | ✅ httpOnly cookies prevent token theft | Already protected |
| CSRF | ⚠️ Partially (sameSite: lax) | Fine for now, add CSRF token for prod |
| User data leakage | ✅ All queries filter by `userId` | Already done |
| Sensitive data in logs | ❌ console.error may log user data | Sanitize logs before prod |

### File Upload Security (critical for import feature)
```javascript
// In import route
const upload = multer({
  storage: multer.memoryStorage(),    // don't write to disk
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['text/csv', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only CSV and PDF files are allowed'));
  }
});
```

---

## Part 10 — System Design Concepts Summary Table

| Concept | Where It Applies in This Project | Priority |
|---|---|---|
| Asynchronous Processing | Import pipeline (CSV/PDF parsing in background) | High |
| Job Queue / Worker Pattern | ImportJob model + background worker | High |
| Idempotency | Transaction deduplication via hash | High |
| Event-Driven Architecture | Budget alerts via socket.io | Medium |
| Cache-Aside Pattern | Category rules, monthly stats | Medium |
| Database Indexing | Expense queries by userId+year+month | High |
| API Pagination | Transaction list (page + limit params) | Medium |
| API Versioning | Prefix routes with /v1/ | Low (add early) |
| Rate Limiting | Auth routes, import endpoint | Medium |
| Layered Fallback | Category detection (personal → global → default) | Medium |
| Producer-Consumer | Upload endpoint → queue → worker | High (for import) |
| RESTful API Contract | Already followed, extend consistently | Ongoing |

---

## Part 11 — Learning Path (Tied to Implementation)

This is a suggested order — you learn the concept as you implement the feature:

1. **Start coding Budget feature** → Naturally learn: Data modeling, REST API design
2. **Start coding Import feature** → Naturally learn: Async processing, Job queues, Idempotency
3. **Start coding Category Detection** → Naturally learn: Layered fallback, Rules engines
4. **Add Budget Alerts** → Naturally learn: Event-driven architecture, WebSockets
5. **Add Pagination** → Naturally learn: API design, cursor-based vs offset pagination
6. **Add Indexes** → Naturally learn: Query optimization, database indexing
7. **Add In-memory Cache** → Naturally learn: Cache-aside pattern, TTL, cache invalidation
8. **Add Rate Limiting** → Naturally learn: API security, throttling
9. **(Optional) Replace in-memory cache with Redis** → Naturally learn: Distributed caching

**Resources to read alongside building:**
- *"Designing Data-Intensive Applications"* by Martin Kleppmann (the bible of system design)
- ByteByteGo on YouTube (short, visual system design concepts)
- Your own bugs and production failures (the best teacher)

---

## Part 12 — Full Revised Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  React 19 + Vite + TailwindCSS                               │
│  Pages: Dashboard, Stats, Debts, Budget (new), Import (new)  │
│  State: Zustand + TanStack Query                             │
│  Real-time: socket.io-client (budget alerts)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS + Cookie Auth
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                             │
│  /api/auth    → AuthController                               │
│  /api/user    → UserController                               │
│  /api/expense → ExpenseController (extended)                 │
│  /api/debt    → DebtController                               │
│  /api/budget  → BudgetController          (NEW)              │
│  /api/import  → ImportController          (NEW)              │
│  /api/alerts  → AlertController           (NEW)              │
│  /api/category→ CategoryController        (NEW)              │
│                                                              │
│  Middleware: protectRoute, rateLimiter, multer               │
│  Services: importService, categoryDetector, budgetChecker    │
│  Workers: importWorker (async job processor)                 │
│  WebSocket: socket.io (real-time alert push)                 │
└──────────┬──────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                       MONGODB                                │
│  Collections:                                                │
│  users          (auth, preferences, currency)                │
│  expenses       (extended: source, type, importHash, tags)   │
│  debts          (unchanged)                                  │
│  budgets        (category, month, year, limit)    (NEW)      │
│  importjobs     (status, filePath, summary)       (NEW)      │
│  alerts         (type, message, isRead)           (NEW)      │
│  categories     (name, icon, color, isSystem)     (NEW)      │
│  useroverrides  (keyword → category per user)     (NEW)      │
└─────────────────────────────────────────────────────────────┘
           │ (future)
           ▼
┌──────────────────────┐
│        REDIS         │
│  - Category rules    │
│  - Stats cache       │
│  - Budget totals     │
│  - Import job queue  │
└──────────────────────┘
```

---

*Document created: February 2026 | Version 1.0*
*You are building a real-world system. The complexity is real. The learning is real. Ship it.*
