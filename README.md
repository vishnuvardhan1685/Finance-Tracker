# 💰 Finance Tracker - React Application

A fully functional, modern expense tracking application built with React, featuring local storage persistence, dynamic calculations, and beautiful data visualizations.

![Finance Tracker](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-7-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-cyan)

## ✨ Features

### Core Functionality
- **📝 Transaction Management**: Add, edit, and delete expense transactions
- **💾 Local Storage**: All data persists in your browser - no backend required
- **📊 Dynamic Calculations**: Real-time totals and running balances
- **📈 Data Visualizations**: Beautiful charts showing spending patterns
- **🎨 Modern UI**: Clean, dark-themed interface with smooth animations

### What You Can Track
- **Date of Payment**: When the expense occurred
- **Category**: 13 predefined categories (Food, Transportation, Entertainment, etc.)
- **Payment Method**: Cash, Credit, Debit, Visa, or Mobile Payment
- **Paid To**: Who received the payment
- **Description**: Detailed notes about the expense
- **Amount**: Dollar amount with running totals

### Statistics & Insights
- **Monthly Bar Charts**: Visualize spending trends across the year
- **Category Pie Charts**: See where your money goes by category
- **Year/Month Filtering**: Focus on specific time periods
- **Summary Cards**: Quick overview of total expenses, transaction counts, and averages

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 How to Use

### Adding a Transaction
1. Click the **"Add Transaction"** button on the home page
2. Fill in the form:
   - Select a date
   - Choose a category
   - Pick a payment method
   - Enter who you paid
   - Add the amount
   - Write a description
3. Click **"Add Transaction"** to save

### Viewing Statistics
1. Click **"Statistics"** in the navigation
2. Use the year selector to view different years
3. Use the month filter to focus on specific months
4. View:
   - Monthly spending bar chart
   - Category breakdown pie chart
   - Detailed category list with percentages

### Managing Transactions
- **Edit**: Click the pencil icon on any transaction
- **Delete**: Click the trash icon (confirmation required)
- **Sort**: Transactions are automatically sorted by date (newest first)

## 🛠️ Technology Stack

- **React 19**: Latest version with hooks
- **Vite**: Lightning-fast build tool
- **TailwindCSS**: Utility-first CSS framework
- **Recharts**: Composable charting library
- **Zustand**: Lightweight state management
- **Lucide React**: Beautiful icon library
- **React Router**: Client-side routing

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── transactions/
│   │   │   ├── TransactionForm.jsx      # Add/Edit transaction form
│   │   │   └── TransactionList.jsx      # Transaction table with actions
│   │   └── ui/
│   │       ├── Button.jsx               # Reusable button component
│   │       ├── Input.jsx                # Styled input component
│   │       └── Dialog.jsx               # Modal dialog component
│   ├── layout/
│   │   └── MainLayout.jsx               # Main app layout with navigation
│   ├── pages/
│   │   ├── DashboardPage.jsx            # Home page with transactions
│   │   └── StatsPage.jsx                # Statistics and charts page
│   ├── stores/
│   │   └── expenseStore.js              # Zustand store with localStorage
│   ├── lib/
│   │   └── utils.js                     # Utility functions
│   ├── App.jsx                          # Main app component
│   ├── main.jsx                         # Entry point
│   └── index.css                        # Global styles
└── package.json
```

## 🎯 Key Learning Objectives

This project demonstrates:

1. **State Management**: Using Zustand for global state
2. **Data Persistence**: localStorage API for saving data
3. **Data Visualization**: Recharts for interactive charts
4. **Form Handling**: Controlled components and validation
5. **CRUD Operations**: Create, Read, Update, Delete functionality
6. **Component Composition**: Reusable UI components
7. **Dynamic Calculations**: Running totals and aggregations
8. **Responsive Design**: Mobile-friendly layouts
9. **Modern React**: Hooks, context, and best practices
10. **Clean Code**: Well-organized, maintainable architecture

## 💡 Features in Detail

### Categories Supported
- Food
- Transportation
- Entertainment
- Utilities
- Insurances
- Mobile communication
- Savings
- Loan payment
- Leisure
- Travel
- Clothes
- Media subscription
- Other Expenses

### Data Storage
All data is stored in your browser's localStorage under the key `expenseTrackerTransactions`. This means:
- ✅ No server required
- ✅ Data persists across browser sessions
- ✅ Privacy - your data never leaves your computer
- ⚠️ Clearing browser data will delete transactions
- ⚠️ Data is per-browser (not synced across devices)

## 🎨 Customization

### Adding New Categories
Edit `src/stores/expenseStore.js`:
```javascript
export const EXPENSE_CATEGORIES = [
  'Food',
  'Your New Category',
  // ... other categories
];
```

### Changing Color Scheme
Modify colors in:
- `src/index.css` - Global styles
- `tailwind.config.js` - Tailwind theme
- Component files - Inline Tailwind classes

## 📝 Sample Data

To test the app with sample data, open the browser console and run:
```javascript
// Add sample transactions
const sampleTransactions = [
  {
    id: '1',
    date: '2025-01-15',
    category: 'Food',
    description: 'Grocery shopping',
    amount: 110,
    paymentMethod: 'Cash',
    paidTo: 'Local Supplier'
  },
  {
    id: '2',
    date: '2025-01-20',
    category: 'Transportation',
    description: 'Gas for company vehicle',
    amount: 160,
    paymentMethod: 'Visa',
    paidTo: 'Gas Station'
  },
  {
    id: '3',
    date: '2025-02-05',
    category: 'Utilities',
    description: 'Office internet',
    amount: 350,
    paymentMethod: 'Credit',
    paidTo: 'Equipment Depot'
  }
];

localStorage.setItem('expenseTrackerTransactions', JSON.stringify(sampleTransactions));
location.reload();
```

## 🚧 Future Enhancements

Potential features to add:
- 📱 Progressive Web App (PWA) support
- 📤 Export to CSV/PDF
- 🔍 Search and advanced filtering
- 📅 Recurring transactions
- 💸 Budget limits and alerts
- 🌙 Multiple themes
- 🔐 Optional user authentication
- ☁️ Cloud sync capability

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Feel free to fork this project and add your own features!

---

**Built with ❤️ as a learning project for mastering React and modern web development**
