import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useExpenseStore from '@/stores/expenseStore';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import useAuthStore from '@/stores/authStore';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const StatsPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const userId = useAuthStore((state) => state.user?._id);
  
  const fetchTransactions = useExpenseStore(state => state.fetchTransactions);
  const getMonthlySummary = useExpenseStore(state => state.getMonthlySummary);
  const getCategoryBreakdown = useExpenseStore(state => state.getCategoryBreakdown);
  const getStats = useExpenseStore(state => state.getStats);

  useEffect(() => {
    // Keep the zustand store in sync with the backend so charts actually have data.
    fetchTransactions(selectedYear);
  }, [fetchTransactions, selectedYear]);
  
  const monthlyData = getMonthlySummary(selectedYear);
  const categoryData = getCategoryBreakdown(selectedYear, selectedMonth);
  const stats = getStats(selectedYear);

  // Fetch debts exactly the same way as the /debts page so stats stay in sync
  const {
    data: debts = [],
    isLoading: isDebtsLoading,
    isError: isDebtsError,
    error: debtsError,
  } = useQuery({
    queryKey: ['debts', userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/debt');
      return data.data;
    },
    enabled: Boolean(userId),
  });

  // Build a contiguous list of years based on actual debts (fallback: current year)
  const yearOptions = useMemo(() => {
    if (!debts || debts.length === 0) return [currentYear];
    const debtYears = debts
      .map((d) => {
        const date = new Date(d.date);
        return Number.isNaN(date.getTime()) ? null : date.getFullYear();
      })
      .filter((y) => typeof y === 'number');
    if (debtYears.length === 0) return [currentYear];
    const minYear = Math.min(...debtYears);
    const maxYear = Math.max(...debtYears);
    const list = [];
    for (let y = minYear; y <= maxYear; y += 1) list.push(y);
    return list;
  }, [debts, currentYear]);

  // If selectedYear isn't available (e.g., user has older data), snap to the latest available
  useEffect(() => {
    if (!yearOptions.includes(selectedYear)) {
      setSelectedYear(yearOptions[yearOptions.length - 1]);
    }
  }, [yearOptions, selectedYear]);

  // Aggregate debt totals by year and month
  const debtAggregates = useMemo(() => {
    const map = new Map();
    (debts || []).forEach((debt) => {
      const date = new Date(debt.date);
      if (Number.isNaN(date.getTime())) return;
      const year = date.getFullYear();
  const monthName = MONTHS[date.getMonth()];
      const entry = map.get(year) || { total: 0, count: 0, monthly: new Map() };
      const amt = Number(debt.amount) || 0;
      entry.total += amt;
      entry.count += 1;
      entry.monthly.set(monthName, (entry.monthly.get(monthName) || 0) + amt);
      map.set(year, entry);
    });
    return map;
  }, [debts]);

  const debtYear = useMemo(() => {
    return debtAggregates.get(selectedYear) || { total: 0, count: 0 };
  }, [debtAggregates, selectedYear]);

  const debtMonthlyData = useMemo(() => {
    const base = monthlyData.map((m) => ({ month: m.month, total: m.total, debtTotal: 0 }));
    const agg = debtAggregates.get(selectedYear);
    if (!agg) return base;
    return base.map((row) => ({
      ...row,
      debtTotal: agg.monthly?.get(row.month) || 0,
    }));
  }, [monthlyData, debtAggregates, selectedYear]);
  
  return (
    <div className="px-4 mx-auto space-y-4 md:space-y-6 max-w-7xl md:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ft-text)]">Statistics</h1>
          <p className="mt-1 text-sm md:text-base text-[color:var(--ft-muted)]">Expenses and debts — separated</p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center md:gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs md:text-sm text-[color:var(--ft-muted)] whitespace-nowrap">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 text-sm text-[color:var(--ft-text)] border border-[color:var(--ft-border)] rounded-lg shadow-sm bg-[color:var(--ft-surface-2)] hover:bg-[color:var(--ft-surface)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ft-accent)] focus:border-[color:var(--ft-accent)]"
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs md:text-sm text-[color:var(--ft-muted)] whitespace-nowrap">Month:</label>
            <select
              value={selectedMonth === null ? '' : selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value === '' ? null : parseInt(e.target.value))}
              className="px-3 py-2 text-sm text-[color:var(--ft-text)] border border-[color:var(--ft-border)] rounded-lg shadow-sm bg-[color:var(--ft-surface-2)] hover:bg-[color:var(--ft-surface)] focus:outline-none focus:ring-2 focus:ring-[color:var(--ft-accent)] focus:border-[color:var(--ft-accent)]"
            >
              <option value="">All Year</option>
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-br from-white/10 to-white/5 rounded-xl hover:border-white/20 transition-all">
          <p className="text-xs md:text-sm text-[color:var(--ft-muted)] uppercase tracking-wider">Expenses (total)</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-[color:var(--ft-text)]">₹{Number(stats.total || 0).toFixed(2)}</p>
          <p className="mt-1 text-xs text-[color:var(--ft-muted-2)]">{stats.count} transactions</p>
        </div>
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-br from-white/10 to-white/5 rounded-xl hover:border-white/20 transition-all">
          <p className="text-xs md:text-sm text-[color:var(--ft-muted)] uppercase tracking-wider">Expenses (avg)</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-[color:var(--ft-text)]">₹{Number(stats.average || 0).toFixed(2)}</p>
          <p className="mt-1 text-xs text-[color:var(--ft-muted-2)]">per transaction</p>
        </div>
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl hover:border-red-500/30 transition-all">
          <p className="text-xs md:text-sm text-[color:var(--ft-muted)] uppercase tracking-wider">Debts (total)</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-[color:var(--ft-text)]">
            {isDebtsLoading ? '…' : `₹${Number(debtYear.total || 0).toFixed(2)}`}
          </p>
            <p className="mt-1 text-xs text-[color:var(--ft-muted-2)]">{isDebtsLoading ? 'loading' : `${debtYear.count || 0} records`}</p>
        </div>
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl hover:border-red-500/30 transition-all">
          <p className="text-xs md:text-sm text-[color:var(--ft-muted)] uppercase tracking-wider">Debts (count)</p>
            <p className="mt-2 text-2xl md:text-3xl font-bold text-[color:var(--ft-text)]">{isDebtsLoading ? '…' : (debtYear.count || 0)}</p>
          <p className="mt-1 text-xs text-[color:var(--ft-muted-2)]">for {selectedYear}</p>
        </div>
      </div>
      {isDebtsError && (
        <div className="p-3 md:p-4 border border-[color:var(--ft-danger)]/30 bg-[color:var(--ft-danger)]/10 rounded-xl">
          <p className="text-xs text-red-200 md:text-sm">Debt stats failed to load.</p>
          <p className="mt-1 text-xs text-red-200/70">
            {debtsError?.response?.data?.message || debtsError?.message || 'Unknown error'}
          </p>
        </div>
      )}
      
      {/* Monthly Summary Bar Chart */}
      <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-[color:var(--ft-surface)] rounded-xl">
        <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold text-[color:var(--ft-text)]">Monthly Summary (Expenses vs Debts)</h2>
        <div className="w-full" style={{ minHeight: '320px', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={320}>
            <BarChart data={debtMonthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
              <XAxis 
                dataKey="month" 
                stroke="rgba(255, 255, 255, 0.5)"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
              />
              <YAxis stroke="rgba(255, 255, 255, 0.5)" tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--ft-surface-2)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                formatter={(value) => `₹${value.toFixed(2)}`}
              />
              <Legend wrapperStyle={{ color: 'rgba(255, 255, 255, 0.7)' }} />
              <Bar dataKey="total" fill="#ffffff" name="Total Expenses" />
              <Bar dataKey="debtTotal" fill="#ef4444" name="Total Debts" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Category Breakdown */}
      <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
        {/* Pie Chart */}
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-[color:var(--ft-surface)] rounded-xl">
          <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold text-[color:var(--ft-text)]">
            Expenses by Category {selectedMonth !== null && `- ${MONTHS[selectedMonth]}`}
          </h2>
          {categoryData.length > 0 ? (
            <div className="w-full" style={{ minHeight: '320px', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%" minHeight={320}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius="70%"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--ft-surface-2)', 
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value) => `₹${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center" style={{ minHeight: '320px' }}>
              <p className="text-[color:var(--ft-muted)]">No data available for this period</p>
            </div>
          )}
        </div>
        
        {/* Category List */}
        <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-[color:var(--ft-surface)] rounded-xl">
          <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold text-[color:var(--ft-text)]">Category Breakdown</h2>
          <div className="space-y-3 overflow-y-auto md:space-y-4" style={{ maxHeight: '350px' }}>
            {categoryData.length > 0 ? (
              categoryData
                .sort((a, b) => b.value - a.value)
                .map((category, index) => {
                  const percentage = stats.total > 0 ? (category.value / stats.total * 100).toFixed(1) : '0.0';
                  return (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-[color:var(--ft-muted)]">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[color:var(--ft-text)]">₹{category.value.toFixed(2)}</div>
                        <div className="text-sm text-[color:var(--ft-muted-2)]">{percentage}%</div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="py-8 text-center text-[color:var(--ft-muted)]">No categories to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
