# 🛠️ Feature Implementation Plan
## Personal Finance Manager — Full Build Roadmap

> **How to use this doc:**  
> This is your implementation bible. Every feature is broken into exactly what needs to be built on the backend, frontend, and database. Read `PROJECT_EVOLUTION.md` for the *why*. Read `SYSTEM_DESIGN.md` for the *architecture*. Read **this doc** when you sit down to code.

---

## Table of Contents

1. [Phase 1 — Foundation Upgrades](#phase-1--foundation-upgrades)
2. [Phase 2 — Income Tracking](#phase-2--income-tracking)
3. [Phase 3 — Budget System](#phase-3--budget-system)
4. [Phase 4 — Statement Import Pipeline](#phase-4--statement-import-pipeline)
5. [Phase 5 — Category Detection Engine](#phase-5--category-detection-engine)
6. [Phase 6 — Alerts & Notifications](#phase-6--alerts--notifications)
7. [Phase 7 — Analytics Upgrade](#phase-7--analytics-upgrade)
8. [Phase 8 — Settings & Profile](#phase-8--settings--profile)
9. [🤖 AI Feature Layer — Special Additions](#-ai-feature-layer--special-additions)
10. [File & Folder Map After Full Build](#file--folder-map-after-full-build)
11. [Implementation Order Cheatsheet](#implementation-order-cheatsheet)

---

## Phase 1 — Foundation Upgrades

> These are **not new features** — they are changes to existing code that everything else depends on. Do these first before building anything new.

### 1.1 — Extend the Expense Model

**File:** `api/models/Expense.js`

Add these fields to the existing schema. All are optional so existing data is not broken.

| New Field | Type | Values | Purpose |
|---|---|---|---|
| `type` | String | `'expense'` / `'income'` | Distinguish income from expenses |
| `source` | String | `'manual'` / `'imported'` | Was this typed or imported from a statement? |
| `merchantRaw` | String | any | Original description from bank statement (e.g., `"SWIGGY*9812-BLORE"`) |
| `importHash` | String | SHA-256 hex | Deduplication fingerprint for imported rows |
| `tags` | [String] | user-defined | Labels like `"business"`, `"personal"`, `"tax-deductible"` |
| `isRecurring` | Boolean | true/false | Detected or user-marked recurring transaction |
| `notes` | String | any | User's own note on the transaction |

**What to do on frontend:**
- `expenseStore.js`: Map the new `type` field when converting API response
- `TransactionForm.jsx`: Add a `type` toggle (Income / Expense) at the top of the form
- `EXPENSE_CATEGORIES` array: Keep for now, will be DB-driven in Phase 5

---

### 1.2 — Extend the User Model

**File:** `api/models/User.js`

Add these fields:

| New Field | Type | Default | Purpose |
|---|---|---|---|
| `currency` | String | `'INR'` | User's preferred currency |
| `avatar` | String | `null` | URL or emoji for profile display |
| `preferences` | Object | `{}` | App settings (theme, default year, etc.) |
| `onboardingDone` | Boolean | `false` | Has the user completed the setup wizard? |

---

### 1.3 — Make Categories DB-Driven

**Current problem:** Categories are a hardcoded array in `expenseStore.js`. You can't add, rename, or assign colors/icons to them.

**What to build:**

**Backend:**
- New model: `api/models/Category.js`
  ```
  { name, icon, color, isSystem, userId }
  ```
- New route file: `api/routes/categoryRoutes.js`
- New controller: `api/controllers/categoryController.js`
- New API endpoints:
  - `GET /api/category` → returns system categories + user's custom ones
  - `POST /api/category` → create a custom category
  - `DELETE /api/category/:id` → delete a custom (non-system) category

**Backend utility:**
- `api/scripts/seedCategories.js` → Seeds the 13 existing categories as system categories into MongoDB on first run

**Frontend:**
- Remove the hardcoded `EXPENSE_CATEGORIES` array from `expenseStore.js`
- Replace with a TanStack Query fetch: `useQuery(['categories'], () => axiosInstance.get('/category'))`
- `TransactionForm.jsx`: Populate category dropdown from this query instead of the static array
- Add a "Manage Categories" section inside the future Settings page

---

### 1.4 — Add Compound DB Indexes

**File:** `api/models/Expense.js`

Add after schema definition (before `mongoose.model()`):

```javascript
expenseSchema.index({ userId: 1, year: 1 });
expenseSchema.index({ userId: 1, month: 1, year: 1 });
expenseSchema.index({ userId: 1, type: 1 });
expenseSchema.index({ importHash: 1 }, { sparse: true });
```

This is a **one-time addition** that makes all existing and future queries faster. No migration needed.

---

## Phase 2 — Income Tracking

> Once `type: 'expense' | 'income'` exists on the Expense model, income tracking is mostly UI work.

### What to build

**Backend:**
- No new model or routes needed — income is just an Expense with `type: 'income'`
- `expenseController.js`: The existing `GET /api/expense` already supports filtering — no change needed
- Optional: add `GET /api/expense/summary` endpoint that returns `{ totalIncome, totalExpenses, netBalance }` for a given month/year

**Frontend:**
- `TransactionForm.jsx`: Add a type toggle at the top — **Income** or **Expense**. When Income is selected, show an "Income Source" field (Salary, Freelance, Business, etc.) instead of `paidTo`
- `DashboardPage.jsx`: Add two new stat cards — **Total Income** and **Net Balance** (Income − Expenses) alongside existing Total Expenses card
- `expenseStore.js`:
  - `getStats()` function: extend to return `{ totalExpenses, totalIncome, netBalance, count }`
  - Keep `transactions` array as is — it already holds everything
- `StatsPage.jsx`: Update the bar chart to show Income vs Expense per month side by side

### New Income Categories to seed
```
Salary, Freelance, Business Income, Investment Returns,
Rental Income, Gift / Bonus, Other Income
```

---

## Phase 3 — Budget System

> The most self-contained new feature. Has its own model, routes, and page. Can be built independently.

### 3.1 — Budget Model

**New file:** `api/models/Budget.js`

```
Fields:
  userId      → ObjectId (ref User)
  category    → String  (must match a valid category name)
  month       → String  ('January' … 'December')
  year        → Number
  limit       → Number  (monthly spending cap in user's currency)
  alertAt     → Number  (default: 0.8 → alert at 80% spent)
  createdAt   → Date (auto)
```

**Unique constraint:** One budget per `{ userId, category, month, year }` combination.

---

### 3.2 — Budget Routes & Controller

**New files:**
- `api/routes/budgetRoutes.js`
- `api/controllers/budgetController.js`

**Endpoints:**

| Method | Route | What it does |
|---|---|---|
| `GET` | `/api/budget` | Get all budgets for current user (optionally filter by `?month=&year=`) |
| `POST` | `/api/budget` | Create a new budget |
| `PUT` | `/api/budget/:id` | Update limit or alertAt |
| `DELETE` | `/api/budget/:id` | Remove a budget |
| `GET` | `/api/budget/summary` | Return all budgets with current spending % for given month/year |

The `GET /api/budget/summary` is the most important — it aggregates expenses per category and compares against the budget limit to return a progress value. This powers the UI cards.

---

### 3.3 — Budget Page (Frontend)

**New file:** `frontend/src/pages/BudgetPage.jsx`

**What it shows:**
- A list of budget cards per category — each card shows:
  - Category name + icon
  - Progress bar: `spent / limit` (color: green < 60%, yellow 60–90%, red > 90%)
  - Amount spent vs limit in text (e.g., "₹3,200 / ₹5,000")
  - Month/Year selector at the top
- A "Set Budget" button that opens a dialog to create/edit a budget
- Empty state message if no budgets are set yet

**New component:** `frontend/src/components/budget/BudgetCard.jsx`
**New component:** `frontend/src/components/budget/BudgetForm.jsx`

**Add to navigation:**
- `MainLayout.jsx`: Add "Budget" link with `PiggyBank` icon from lucide-react
- `App.jsx`: Add `<Route path="/budget" element={<BudgetPage />} />`

---

### 3.4 — Budget Breach Check (Backend Hook)

Every time an expense is **created** (manual or imported), check if the user's budget for that category+month+year is now at or above the alert threshold.

**Where to add it:** Inside `expenseController.js` → `createExpense()`, after the expense is saved:

```
after expense.save()
  → call checkBudgetBreach(userId, category, month, year)
  → if breach: create an Alert document (Phase 6)
```

This function lives in `api/services/budgetService.js` — a new file.

---

## Phase 4 — Statement Import Pipeline

> The biggest new feature. Read `SYSTEM_DESIGN.md` Part 2 for the architecture before coding this.

### 4.1 — What files to create

```
api/
  models/
    ImportJob.js          ← tracks status of each import
  routes/
    importRoutes.js
  controllers/
    importController.js
  services/
    importService.js      ← orchestrates parse → detect → dedup → save
  parsers/
    index.js              ← selects the right parser based on user's bank choice
    hdfc.js               ← HDFC CSV column mapper
    sbi.js                ← SBI CSV column mapper
    axis.js               ← Axis Bank CSV column mapper
    generic.js            ← fallback: tries common column names
  utils/
    hashTransaction.js    ← generates SHA-256 importHash
```

---

### 4.2 — ImportJob Model

```
Fields:
  userId       → ObjectId
  status       → String: 'pending' | 'processing' | 'completed' | 'failed'
  bank         → String: 'hdfc' | 'sbi' | 'axis' | 'generic'
  fileName     → String (original upload filename)
  summary      → Object: { total, added, skipped, failed }
  errorMessage → String (if status is 'failed')
  createdAt    → Date
```

---

### 4.3 — Import API Endpoints

| Method | Route | What it does |
|---|---|---|
| `POST` | `/api/import/upload` | Accept file + bank name, create ImportJob, return `jobId` |
| `GET` | `/api/import/jobs` | List user's past import jobs |
| `GET` | `/api/import/jobs/:jobId` | Get status + summary of one job |
| `GET` | `/api/import/preview/:jobId` | Return parsed rows before user confirms |
| `POST` | `/api/import/confirm/:jobId` | User confirms — trigger actual DB write |

**Key design decision:** The import is a **2-step flow**: Upload → Preview → Confirm. The user sees parsed rows before anything is written to the database. This prevents surprises.

---

### 4.4 — Import Page (Frontend)

**New file:** `frontend/src/pages/ImportPage.jsx`

**3-step wizard UI:**

**Step 1 — Upload**
- Bank selector dropdown (HDFC / SBI / Axis / Generic)
- Drag-and-drop or click-to-upload area (`react-dropzone`)
- File type restriction: CSV only for v1, PDF in v2
- "Upload & Preview" button

**Step 2 — Preview**
- Table showing parsed rows: Date | Description | Amount | Detected Category
- Each row's category is editable (dropdown) before confirming
- Shows "X rows found, Y possible duplicates"
- "Confirm Import" button and "Cancel" button

**Step 3 — Result**
- Summary card: "✅ 312 transactions added, ⏭️ 88 duplicates skipped"
- "Go to Dashboard" button

**New components:**
- `frontend/src/components/import/UploadStep.jsx`
- `frontend/src/components/import/PreviewStep.jsx`
- `frontend/src/components/import/ImportResult.jsx`

**Add to navigation:**
- `MainLayout.jsx`: Add "Import" link with `Upload` icon from lucide-react
- `App.jsx`: Add `<Route path="/import" element={<ImportPage />} />`

---

### 4.5 — Which Banks to Support First

| Bank | Format | Priority | Notes |
|---|---|---|---|
| HDFC | CSV | ✅ First | Clean format, most popular |
| Axis Bank | CSV | ✅ First | Clean format |
| SBI | CSV / XLS | Second | XLS needs `xlsx` library |
| ICICI | CSV | Second | |
| Kotak | CSV | Third | |
| GPay (Google Pay) | CSV | Third | UPI transactions |
| PhonePe | CSV | Third | UPI transactions |

---

## Phase 5 — Category Detection Engine

> Can be built alongside or after Phase 4. The detection runs on every new transaction regardless of source (manual or imported).

### 5.1 — What to build

**New files:**
```
api/
  services/
    categoryDetector.js      ← main detection function
  data/
    merchantRules.json       ← keyword → category map (~300 rules)
  models/
    UserCategoryOverride.js  ← stores user's personal corrections
```

---

### 5.2 — How Detection Works (3 layers)

```
Input: merchantRaw description string (e.g., "SWIGGY*ORD-9812-BLORE")

Layer 1: Check UserCategoryOverride for this userId
         → Did this user ever correct "swiggy" to something? Use that.

Layer 2: Check merchantRules.json
         → Does the description contain any known keyword?
         → "swiggy" → "Food" ✅

Layer 3: Fallback → "Other Expenses"
```

---

### 5.3 — Starting Merchant Rules (sample)

The full `merchantRules.json` should have ~300 entries at launch. Key ones:

```
Food:                swiggy, zomato, dunzo, blinkit, bigbasket, zepto, instamart
Transportation:      ola, uber, rapido, redbus, ixigo, irctc
Travel:              makemytrip, goibibo, cleartrip, airasia, indigo, spicejet, oyo
Utilities:           bescom, tneb, msedcl, bses, tata power, adani electricity
Mobile:              airtel, jio, vi, vodafone, bsnl
Entertainment:       bookmyshow, pvr, inox
Media Subscription:  netflix, hotstar, spotify, youtube, amazon prime, zee5, sonyliv
Education:           udemy, coursera, unacademy, byju, skill india
Healthcare:          apollo, medplus, 1mg, pharmeasy, fortis, manipal
Insurance:           lic, star health, hdfc ergo, bajaj allianz, new india
Savings:             ppf, fd, rd, nps, ssy, elss
Shopping:            amazon, flipkart, myntra, ajio, nykaa, meesho
Loan payment:        emi, loan, repayment
```

---

### 5.4 — UserCategoryOverride Model

```
Fields:
  userId    → ObjectId
  keyword   → String (lowercased, trimmed fragment extracted from merchantRaw)
  category  → String
  updatedAt → Date
```

**How it gets populated:**
When a user edits the category of any transaction in the Transaction List, a POST request to `POST /api/category/override` stores their correction. Future imports or manual entries with the same keyword auto-apply their preference.

---

### 5.5 — Where Detection Runs

1. **On manual entry:** After `POST /api/expense`, if `merchantRaw` or `paidTo` is provided and category is `"Other Expenses"`, run detection and update the saved expense's category.
2. **During import preview (Phase 4):** Run detection on every parsed row to pre-fill the category column in the preview table. User can correct before confirming.
3. **Batch re-categorize:** `POST /api/category/recategorize` — lets a user re-run detection on all their "Other Expenses" transactions after they've added overrides.

---

## Phase 6 — Alerts & Notifications

### 6.1 — Alert Model

**New file:** `api/models/Alert.js`

```
Fields:
  userId    → ObjectId
  type      → String: 'budget_warning' | 'budget_exceeded' | 'import_complete' | 'import_failed'
  title     → String  (short heading)
  message   → String  (full message)
  metadata  → Object  (category, jobId, amount — varies by type)
  isRead    → Boolean (default: false)
  createdAt → Date
```

---

### 6.2 — Alert Routes

**New files:** `api/routes/alertRoutes.js`, `api/controllers/alertController.js`

| Method | Route | What it does |
|---|---|---|
| `GET` | `/api/alerts` | Get all unread alerts for user |
| `PATCH` | `/api/alerts/:id/read` | Mark one alert as read |
| `PATCH` | `/api/alerts/read-all` | Mark all alerts as read |
| `DELETE` | `/api/alerts/:id` | Dismiss/delete an alert |

---

### 6.3 — Real-time Push via socket.io

You already have `socket.io` installed on the backend. Use it.

**Backend:** When an alert is created, emit to the user's socket room:
```javascript
// In budgetService.js or importService.js
io.to(`user_${userId}`).emit('new_alert', alertData);
```

**Frontend:** Connect socket.io-client on app load. Listen for `'new_alert'` events and show a toast notification + increment the alert badge count on the navbar.

**New frontend packages to install:**
- `socket.io-client` (for the frontend)
- `sonner` (modern toast notifications — replaces the current `react-toast`/`react-toaster` mix)

---

### 6.4 — Alert Bell UI

**In `MainLayout.jsx` (navbar):**
- Add a bell icon (`Bell` from lucide-react) with an unread count badge
- Clicking it opens a dropdown panel showing recent alerts
- Each alert has a "Mark as read" button and a link to the relevant page

---

## Phase 7 — Analytics Upgrade

> The StatsPage gets significantly more powerful once income, budgets, and import data exist.

### What to add to `StatsPage.jsx`

| New Chart / Widget | What it shows |
|---|---|
| Net Balance card | Income − Expenses for selected month/year |
| Budget vs Actual bar chart | Per-category bars: budget limit vs actual spent |
| Savings Rate gauge | `(income - expenses) / income × 100` as a % |
| Month-over-month trend | Expenses this month vs same month last year |
| Top 5 spending categories | Ranked list with amounts |
| Recurring expenses detected | List of transactions flagged as recurring |

### Backend support needed

New endpoint: `GET /api/expense/analytics`

Returns a combined object:
```json
{
  "netBalance": 12400,
  "savingsRate": 28.5,
  "topCategories": [...],
  "monthOverMonth": { "change": -8.2, "previousMonth": 15200, "currentMonth": 13950 },
  "budgetComparison": [...]
}
```

This avoids 5 separate API calls from the frontend to build the stats page.

---

## Phase 8 — Settings & Profile

> Small but important. Gives users control over their experience.

### New page: `frontend/src/pages/SettingsPage.jsx`

**Sections:**

**1. Profile**
- Edit name, email
- Upload or choose avatar (emoji picker for simplicity)

**2. Preferences**
- Currency selector (INR selected by default, others: USD, EUR, GBP, AED)
- Default year on dashboard
- Theme (dark only for now, light mode in future)

**3. Categories**
- List of user's custom categories
- "Add Category" button — with color + icon picker
- Delete custom categories (system categories cannot be deleted)

**4. Data Management**
- "Export my data as CSV" button → `GET /api/user/export`
- "Delete all transactions" → dangerous action with confirmation dialog
- "Delete account" → with re-enter password confirmation

**Backend endpoints to add in `userController.js`:**
- `PUT /api/user/profile` → update name, avatar, preferences
- `GET /api/user/export` → stream all expenses as CSV download

---

---

## 🤖 AI Feature Layer — Special Additions

> This section is about **AI as a smart assistant**, not as a dependency. Every AI feature described below has a non-AI fallback. If the AI call fails, the app still works perfectly. AI here is a **quality-of-life upgrade**, not a critical path.

---

### AI Feature 1 — Smart Category Suggestions (The Core AI Use Case)

**What it does:**
When a user adds a transaction manually and types a description like "Paid rent to Mr. Sharma for March", the AI reads that sentence and suggests the most appropriate category from the user's category list.

**Why it's better than the rules engine:**
- The rules engine works on keywords (`"swiggy"` → Food). It fails on natural language descriptions.
- AI understands context: "paid gym subscription" → Fitness/Health even without a specific keyword.
- Handles typos, abbreviations, mixed language.

**How to implement:**
- Backend: `POST /api/ai/suggest-category`
- Input: `{ description: string, categories: string[] }`
- Calls OpenAI API (`gpt-4o-mini` — cheapest, fast, sufficient for this)
- Returns: `{ suggestedCategory: string, confidence: number }`

**Frontend behavior:**
- In `TransactionForm.jsx`, when the user finishes typing in the `description` field (on blur), a small API call fires
- The category dropdown shows the suggestion with a ✨ icon next to it: `✨ Food (AI suggestion)`
- User can accept or override it — their choice is always final
- If the API call takes > 2 seconds or fails, the field just stays as the default (no error, no disruption)

**Cost estimate:** `gpt-4o-mini` costs $0.15 per million input tokens. A category suggestion prompt is ~100 tokens. 10,000 suggestions = $0.15. Negligible.

**Rate limiting (important):** Limit this endpoint to 30 requests/minute per user. Not every keystroke should call AI — debounce on the frontend, rate limit on the backend.

---

### AI Feature 2 — Monthly Spending Summary (Conversational Insight)

**What it does:**
At the end of each month (or when the user clicks "Analyse"), the AI reads the user's category totals and writes a short, plain-English paragraph summarizing their financial month.

**Example output:**
> "This month you spent ₹14,200 in total — 22% more than last month. Your Food spending was your biggest category at ₹4,800, driven largely by frequent restaurant visits. You stayed within your Transport and Utilities budgets. Your biggest surprise was ₹2,100 in Shopping, which is new compared to previous months. Savings rate this month: 18%."

**Where it appears:** A card on the StatsPage — "AI Summary" — with a "Generate" button. It's not auto-generated on every load. User explicitly clicks to get it.

**How to implement:**
- Backend: `POST /api/ai/monthly-summary`
- Input: The analytics object from `GET /api/expense/analytics` — no raw transaction data, only aggregated numbers (privacy-conscious)
- Calls OpenAI with a structured prompt including the stats
- Caches the result in MongoDB for the given user + month + year (so re-clicking doesn't re-call the API)

**Frontend:**
- `StatsPage.jsx`: Add an "AI Insights" card with a "✨ Generate Summary" button
- Shows a skeleton loader while generating
- Displays the paragraph with a small "Regenerate" button

---

### AI Feature 3 — Anomaly Detection Alert (Background Analysis)

**What it does:**
After a user imports a statement or crosses 20+ transactions in a month, a background job runs that looks for unusual spending patterns and creates a plain-English alert.

**Examples:**
- "You spent ₹6,200 on Food this month — 3x your usual amount. Is everything okay?"
- "We noticed 3 transactions to 'UNKNOWN MERCHANT' totaling ₹4,500. You may want to review these."
- "Your spending this month (₹22,000) is 40% higher than your 3-month average (₹15,700)."

**How to implement:**
- Backend: `api/services/anomalyDetector.js`
- Triggered after: import confirm, or when a budget is exceeded by >30%
- Computes 3-month average per category from DB — no AI needed for the numbers
- Feeds the anomalies to OpenAI to write a human-friendly message
- Creates an Alert document (Phase 6) with `type: 'ai_anomaly'`

**This is the most impressive AI feature in the project** — it feels like a personal finance advisor noticing things on your behalf.

---

### AI Feature 4 — Natural Language Transaction Search

**What it does:**
Instead of filtering by category or month dropdowns, the user can type:
- "Show me all food expenses from last month"
- "Find transactions above ₹500 in Travel"
- "What did I spend on subscriptions in January?"

And the app translates this to a MongoDB query and returns the matching transactions.

**How to implement:**
- Frontend: A search bar on DashboardPage with a "🔍 Ask anything" placeholder
- Backend: `POST /api/ai/search`
- Input: `{ query: "food expenses from last month" }`
- AI converts this to a structured filter: `{ category: "Food", month: "January", year: 2026 }`
- Server runs `Expense.find(structuredFilter)` and returns results

**Safety:** The AI output is treated as filter parameters only — never as raw MongoDB query strings. This prevents prompt injection from becoming a database attack.

**Fallback:** If AI parsing fails, fall back to a regular keyword search through transaction descriptions.

---

### AI Feature 5 — Budget Recommendation

**What it does:**
When a user is setting up budgets for the first time, instead of asking them to guess their limits, a button "Let AI suggest budgets" analyzes their last 2–3 months of spending and recommends budget limits per category.

**Example:**
> "Based on your last 3 months, here are suggested budget limits:
> Food: ₹4,500 · Transport: ₹1,200 · Utilities: ₹1,800 · Entertainment: ₹800"

The user can accept all, adjust individual amounts, or ignore entirely.

**How to implement:**
- Backend: `POST /api/ai/suggest-budgets`
- Aggregates last 3 months of expenses per category for the user (pure DB query, no AI yet)
- Adds a 10% buffer on top of the average per category
- Optionally passes the averages to OpenAI to generate the friendly recommendation message
- The actual numbers come from math, not AI guessing — AI only writes the message

**This is a great onboarding feature** — new users don't stare at empty budget forms.

---

### AI Summary Table

| Feature | Endpoint | AI Model | Fallback if AI fails |
|---|---|---|---|
| Smart category suggestion | `POST /api/ai/suggest-category` | `gpt-4o-mini` | Default category dropdown unchanged |
| Monthly spending summary | `POST /api/ai/monthly-summary` | `gpt-4o-mini` | No card shown, user sees regular stats |
| Anomaly detection alert | Background job | `gpt-4o-mini` | Alert not sent, no disruption |
| NL transaction search | `POST /api/ai/search` | `gpt-4o-mini` | Falls back to keyword search |
| Budget recommendation | `POST /api/ai/suggest-budgets` | `gpt-4o-mini` (optional) | Shows math-based suggestions without narrative |

### What NOT to use AI for (in this project)
- Authenticating users — never
- Writing to the database — only safe filtered parameters
- Any real-time, blocking action where failure breaks a page
- Replacing the rules engine entirely — AI is expensive at scale, rules are free

### OpenAI Setup
- Install: `npm install openai`
- Create: `api/services/aiService.js` — one wrapper module for all AI calls
- Store key: `OPENAI_API_KEY` in `.env`
- The `aiService.js` module should catch all errors silently and return `null` — callers always check for null and use fallback behavior

---

## File & Folder Map After Full Build

```
api/
  controllers/
    authController.js        (existing)
    expenseController.js     (extended: income type, budget check hook)
    debtController.js        (existing)
    userController.js        (extended: export, profile update)
    budgetController.js      ← NEW
    categoryController.js    ← NEW
    importController.js      ← NEW
    alertController.js       ← NEW
    aiController.js          ← NEW
  models/
    User.js                  (extended)
    Expense.js               (extended)
    Debt.js                  (existing)
    Budget.js                ← NEW
    Category.js              ← NEW
    ImportJob.js             ← NEW
    Alert.js                 ← NEW
    UserCategoryOverride.js  ← NEW
  routes/
    authRoutes.js            (existing)
    expenseRoutes.js         (existing)
    debtRoutes.js            (existing)
    userRoutes.js            (existing)
    budgetRoutes.js          ← NEW
    categoryRoutes.js        ← NEW
    importRoutes.js          ← NEW
    alertRoutes.js           ← NEW
    aiRoutes.js              ← NEW
  services/
    budgetService.js         ← NEW (breach check logic)
    importService.js         ← NEW (orchestrates import pipeline)
    categoryDetector.js      ← NEW (rule-based + override lookup)
    anomalyDetector.js       ← NEW (spending anomaly analysis)
    aiService.js             ← NEW (OpenAI wrapper with fallback)
  parsers/
    index.js                 ← NEW
    hdfc.js                  ← NEW
    sbi.js                   ← NEW
    axis.js                  ← NEW
    generic.js               ← NEW
  data/
    merchantRules.json       ← NEW (~300 keyword rules)
  scripts/
    seedCategories.js        ← NEW
    seedExpenses2025.js      (existing)
  middleware/
    auth.js                  (existing)
    rateLimiter.js           ← NEW
  utils/
    asyncHandler.js          (existing)
    hashTransaction.js       ← NEW
    normalizeDebtDates.js    (existing)

frontend/src/
  pages/
    DashboardPage.jsx        (extended: income cards, net balance)
    StatsPage.jsx            (extended: new charts, AI summary card)
    DebtsPage.jsx            (existing)
    BudgetPage.jsx           ← NEW
    ImportPage.jsx           ← NEW
    SettingsPage.jsx         ← NEW
  components/
    transactions/
      TransactionForm.jsx    (extended: type toggle, AI suggestion)
      TransactionList.jsx    (extended: tags, notes column)
    budget/
      BudgetCard.jsx         ← NEW
      BudgetForm.jsx         ← NEW
    import/
      UploadStep.jsx         ← NEW
      PreviewStep.jsx        ← NEW
      ImportResult.jsx       ← NEW
    alerts/
      AlertBell.jsx          ← NEW
      AlertPanel.jsx         ← NEW
    stats/
      SummaryChart.jsx       (existing)
      BudgetVsActualChart.jsx ← NEW
      AiInsightCard.jsx      ← NEW
    ui/                      (existing components unchanged)
  stores/
    expenseStore.js          (extended)
    authStore.js             (existing)
    alertStore.js            ← NEW (unread count, alert list)
  lib/
    axios.js                 (existing)
    socket.js                ← NEW (socket.io-client connection)
    utils.js                 (existing)
```

---

## Implementation Order Cheatsheet

Work in this order. Each phase builds on the previous one.

```
Week 1–2  │ Phase 1: Foundation upgrades (models, indexes, categories to DB)
Week 2–3  │ Phase 2: Income tracking (type field + UI toggle + net balance cards)
Week 3–4  │ Phase 3: Budget system (model + routes + BudgetPage + breach check)
Week 5–6  │ Phase 4: Import pipeline (HDFC + Axis CSV parsers + wizard UI)
Week 6–7  │ Phase 5: Category detection (merchantRules.json + detector service)
Week 7–8  │ Phase 6: Alerts (Alert model + socket.io push + AlertBell in navbar)
Week 8    │ Phase 7: Analytics upgrade (new charts + /analytics endpoint)
Week 9    │ Phase 8: Settings page (profile, currency, categories, data export)
Week 10+  │ 🤖 AI layer: Start with Feature 1 (category suggestion), then 2, 3, 4, 5
```

> **Rule:** Never start a new phase until all endpoints of the current phase are tested with a REST client (like Thunder Client or Postman) AND the frontend for that phase renders correctly. Ship each phase as a working increment.

---

*Document created: March 2026 | Version 1.0*
*Cross-reference: `PROJECT_EVOLUTION.md` (why) · `SYSTEM_DESIGN.md` (architecture) · This doc (what to build)*
