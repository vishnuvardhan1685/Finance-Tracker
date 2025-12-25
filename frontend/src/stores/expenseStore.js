import { create } from 'zustand';
import axiosInstance from '@/lib/axios';

const dedupeById = (items) => {
  const map = new Map();
  for (const item of items || []) {
    if (!item) continue;
    const key = item.id;
    if (!key) continue;
    map.set(key, item);
  }
  return Array.from(map.values());
};

// Categories for expenses
export const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Insurances',
  'Mobile communication',
  'Savings',
  'Loan payment',
  'Leisure',
  'Travel',
  'Clothes',
  'Media subscription',
  'Other Expenses'
];

// Payment methods
export const PAYMENT_METHODS = ['Cash', 'Credit', 'Debit', 'Visa', 'Mobile Payment'];

const useExpenseStore = create((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  
  // Fetch transactions from backend
  fetchTransactions: async (year, month) => {
    try {
      set({ isLoading: true, error: null });
      const params = {};
      if (year) params.year = year;
      if (month) params.month = month;
      
  const response = await axiosInstance.get('/expense', { params });
      
      // Convert backend format to frontend format
      const transactions = response.data.data.map(exp => ({
        id: exp._id,
        date: exp.date,
        category: exp.category,
        description: exp.title,
        amount: exp.amount,
        paymentMethod: exp.paymentMethod || 'Cash',
        paidTo: typeof exp.paidTo === 'string' ? exp.paidTo : '',
        createdAt: exp.createdAt
      }));

      set({ transactions: dedupeById(transactions), isLoading: false });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch transactions', isLoading: false });
    }
  },
  
  // Add a transaction
  addTransaction: async (transaction) => {
    try {
      set({ isLoading: true, error: null });
      
      // Convert frontend format to backend format
      const date = new Date(transaction.date);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const backendData = {
        category: transaction.category,
        title: transaction.description,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        paidTo: typeof transaction.paidTo === 'string' ? transaction.paidTo : '',
        date: transaction.date,
        month: months[date.getMonth()],
        year: date.getFullYear()
      };
      
  const response = await axiosInstance.post('/expense', backendData);
      
      // Add to local state
      const newTransaction = {
        id: response.data.data._id,
        ...transaction,
        paidTo: typeof transaction.paidTo === 'string' ? transaction.paidTo : '',
        createdAt: response.data.data.createdAt
      };

      set({ transactions: dedupeById([...get().transactions, newTransaction]), isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Error adding transaction:', error);
      const message = error.response?.data?.message || 'Failed to add transaction';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },
  
  // Update a transaction
  updateTransaction: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      // Convert frontend format to backend format if needed
      const date = updates.date ? new Date(updates.date) : null;
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const backendData = {};
      if (updates.category) backendData.category = updates.category;
      if (updates.description) backendData.title = updates.description;
      if (updates.amount) backendData.amount = updates.amount;
      if (updates.paymentMethod) backendData.paymentMethod = updates.paymentMethod;
      if (updates.paidTo !== undefined) backendData.paidTo = updates.paidTo;
      if (updates.date) {
        backendData.date = updates.date;
        backendData.month = months[date.getMonth()];
        backendData.year = date.getFullYear();
      }
      
  await axiosInstance.put(`/expense/${id}`, backendData);
      
      // Update local state
      const updatedTransactions = get().transactions.map(t => 
        t.id === id ? { ...t, ...updates } : t
      );
      set({ transactions: updatedTransactions, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Error updating transaction:', error);
      const message = error.response?.data?.message || 'Failed to update transaction';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },
  
  // Delete a transaction
  deleteTransaction: async (id) => {
    try {
      set({ isLoading: true, error: null });
  await axiosInstance.delete(`/expense/${id}`);
      
      // Remove from local state
      const updatedTransactions = get().transactions.filter(t => t.id !== id);
      set({ transactions: updatedTransactions, isLoading: false });
      return { success: true };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      const message = error.response?.data?.message || 'Failed to delete transaction';
      set({ error: message, isLoading: false });
      return { success: false, message };
    }
  },
  
  // Get monthly summary (calculated from local state)
  getMonthlySummary: (year) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return months.map((month, index) => {
      const monthTransactions = get().transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() === index;
      });
      
      const total = monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      return {
        month,
        total,
        count: monthTransactions.length
      };
    });
  },
  
  // Get category breakdown
  getCategoryBreakdown: (year, month = null) => {
    let filteredTransactions = get().transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year;
    });
    
    if (month !== null) {
      filteredTransactions = filteredTransactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === month;
      });
    }
    
    const breakdown = {};
    filteredTransactions.forEach(t => {
      const category = t.category || 'Other';
      breakdown[category] = (breakdown[category] || 0) + (t.amount || 0);
    });
    
    return Object.entries(breakdown).map(([name, value]) => ({
      name,
      value
    }));
  },
  
  // Get year total
  getYearTotal: (year) => {
    return get().transactions
      .filter(t => new Date(t.date).getFullYear() === year)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  },
  
  // Get statistics
  getStats: (year) => {
    const yearTransactions = get().transactions.filter(t => 
      new Date(t.date).getFullYear() === year
    );
    
    const total = yearTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const count = yearTransactions.length;
    
    // Get earliest and latest transaction dates for the year
    const dates = yearTransactions.map(t => new Date(t.date));
    const earliestDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
    const latestDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;
    
    return {
      total,
      count,
      average: count > 0 ? total / count : 0,
      earliestDate,
      latestDate
    };
  },
  
  // Clear error
  clearError: () => set({ error: null }),
}));

export default useExpenseStore;
