import { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, DollarSign, Receipt, IndianRupee } from 'lucide-react';
import useExpenseStore from '@/stores/expenseStore';
import useAuthStore from '@/stores/authStore';
import Dialog from '@/components/ui/Dialog';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import { Button } from '@/components/ui/Button';

const DashboardPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const user = useAuthStore(state => state.user);
  const transactions = useExpenseStore(state => state.transactions);
  const addTransaction = useExpenseStore(state => state.addTransaction);
  const updateTransaction = useExpenseStore(state => state.updateTransaction);
  const deleteTransaction = useExpenseStore(state => state.deleteTransaction);
  const fetchTransactions = useExpenseStore(state => state.fetchTransactions);
  const getStats = useExpenseStore(state => state.getStats);
  const isLoading = useExpenseStore(state => state.isLoading);
  
  // Fetch all transactions on mount so year filter can cover every year present
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, fetchTransactions]);
  
  const yearOptions = useMemo(() => {
    const allYears = (transactions || [])
      .map(t => {
        const d = new Date(t.date);
        return Number.isNaN(d.getTime()) ? null : d.getFullYear();
      })
      .filter((y) => typeof y === 'number');

    const currentYear = new Date().getFullYear();
    if (allYears.length === 0) return [currentYear];

    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);
    const safeMin = Number.isFinite(minYear) ? minYear : currentYear;
    const safeMax = Number.isFinite(maxYear) ? maxYear : currentYear;

    const list = [];
    for (let y = safeMin; y <= safeMax; y += 1) list.push(y);
    return list;
  }, [transactions]);

  const stats = getStats(selectedYear) || {
    total: 0,
    count: 0,
    average: 0,
    earliestDate: null,
    latestDate: null,
  };

  // Keep selectedYear valid even when new years appear after adding data
  useEffect(() => {
    if (yearOptions.length === 0) return;
    if (!yearOptions.includes(selectedYear)) {
      setSelectedYear(yearOptions[yearOptions.length - 1]);
    }
  }, [yearOptions, selectedYear]);
  
  // Get current year transactions
  const yearTransactions = transactions.filter(t => 
    new Date(t.date).getFullYear() === selectedYear
  ).sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsDialogOpen(true);
  };
  
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsDialogOpen(true);
  };
  
  const handleSaveTransaction = async (data) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await addTransaction(data);
    }
    setIsDialogOpen(false);
    setEditingTransaction(null);
    // Refresh transactions
    fetchTransactions();
  };
  
  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
      // Refresh transactions
      fetchTransactions();
    }
  };
  
  return (
    <div className="px-4 mx-auto space-y-4 md:space-y-6 max-w-7xl md:px-0">
      {/* Header with User Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-r from-[color:var(--ft-surface)] to-[color:var(--ft-surface-2)] rounded-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ft-text)] mb-1">
            Welcome back, <span className="text-white">{user?.name || 'User'}</span>!
          </h1>
          <p className="text-sm md:text-base text-[color:var(--ft-muted)]">Track your daily expenses and manage your budget efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddTransaction} className="gap-2 px-4 py-2 text-sm text-black bg-white hover:bg-white/90 md:text-base">
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            Add Transaction
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-br from-white/10 to-white/5 rounded-xl hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg md:p-3 bg-white/10">
              <Calendar className="w-5 h-5 text-white md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xs font-medium text-[color:var(--ft-muted)] uppercase tracking-wider mb-1">Earliest Date</p>
          <p className="text-lg md:text-xl font-bold text-[color:var(--ft-text)]">
            {stats.earliestDate ? new Date(stats.earliestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
          </p>
        </div>
        
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-br from-white/10 to-white/5 rounded-xl hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg md:p-3 bg-white/10">
              <Calendar className="w-5 h-5 text-white md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xs font-medium text-[color:var(--ft-muted)] uppercase tracking-wider mb-1">Latest Date</p>
          <p className="text-lg md:text-xl font-bold text-[color:var(--ft-text)]">
            {stats.latestDate ? new Date(stats.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
          </p>
        </div>
        
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-br from-white/10 to-white/5 rounded-xl hover:border-white/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg md:p-3 bg-white/10">
              <Receipt className="w-5 h-5 text-white md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xs font-medium text-[color:var(--ft-muted)] uppercase tracking-wider mb-1">Total Transactions</p>
          <p className="text-lg md:text-xl font-bold text-[color:var(--ft-text)]">{stats.count}</p>
        </div>
        
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 rounded-lg md:p-3 bg-red-500/20">
              <IndianRupee className="w-5 h-5 text-red-400 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-xs font-medium text-[color:var(--ft-muted)] uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-lg md:text-xl font-bold text-[color:var(--ft-text)]">
            ₹{stats.total.toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Year Selector & Transaction List */}
      <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-[color:var(--ft-surface)] rounded-xl backdrop-blur-sm">
        <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between md:mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[color:var(--ft-text)]">Transaction History</h2>
            <p className="text-xs md:text-sm text-[color:var(--ft-muted)] mt-1">{yearTransactions.length} transactions found</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs md:text-sm font-medium text-[color:var(--ft-muted)] whitespace-nowrap">Filter by Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 md:px-4 py-2 text-sm text-[color:var(--ft-text)] bg-[color:var(--ft-surface-2)] border border-[color:var(--ft-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[color:var(--ft-accent)] focus:border-transparent"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-b-2 border-white rounded-full animate-spin"></div>
          </div>
        ) : (
          <TransactionList 
            transactions={yearTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
        )}
      </div>
      
      {/* Transaction Dialog */}
      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTransaction(null);
        }}
        title={editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      >
        <TransactionForm
          initialData={editingTransaction}
          onSave={handleSaveTransaction}
          onCancel={() => {
            setIsDialogOpen(false);
            setEditingTransaction(null);
          }}
        />
      </Dialog>
    </div>
  );
};

export default DashboardPage;
