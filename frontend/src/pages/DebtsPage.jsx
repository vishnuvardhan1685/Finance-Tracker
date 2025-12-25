import { useState } from 'react';
import { Plus, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import Dialog from '@/components/ui/Dialog';
import DebtForm from '@/components/debts/DebtsForm';
import { Button } from '@/components/ui/Button';
import useAuthStore from '@/stores/authStore';

const DebtsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?._id);

  // Fetch all debts
  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['debts', userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/debt');
      return data.data;
    },
    enabled: Boolean(userId),
  });

  // Create debt mutation
  const createDebtMutation = useMutation({
    mutationFn: (newDebt) => axiosInstance.post('/debt', newDebt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', userId] });
      queryClient.invalidateQueries({ queryKey: ['debtSummary', userId] });
      setIsDialogOpen(false);
      setEditingDebt(null);
    },
  });

  // Update debt mutation
  const updateDebtMutation = useMutation({
    mutationFn: ({ id, data }) => axiosInstance.put(`/debt/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', userId] });
      queryClient.invalidateQueries({ queryKey: ['debtSummary', userId] });
      setIsDialogOpen(false);
      setEditingDebt(null);
    },
  });

  // Delete debt mutation
  const deleteDebtMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/debt/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', userId] });
      queryClient.invalidateQueries({ queryKey: ['debtSummary', userId] });
    },
  });

  const handleAddDebt = () => {
    setEditingDebt(null);
    setIsDialogOpen(true);
  };

  const handleEditDebt = (debt) => {
    setEditingDebt(debt);
    setIsDialogOpen(true);
  };

  const handleSaveDebt = (data) => {
    if (editingDebt) {
      updateDebtMutation.mutate({ id: editingDebt._id, data });
    } else {
      createDebtMutation.mutate(data);
    }
  };

  const handleDeleteDebt = (id) => {
    if (window.confirm('Are you sure you want to delete this debt?')) {
      deleteDebtMutation.mutate(id);
    }
  };
  const handleMarkPaid = (debt) => {
    updateDebtMutation.mutate({ id: debt._id, data: { status: 'paid' } });
  };

  const unpaidDebts = debts.filter(d => (d.status || 'unpaid') === 'unpaid');
  const paidDebts = debts.filter(d => d.status === 'paid');
  const totalOutstanding = unpaidDebts.reduce((sum, debt) => sum + (debt.amount || 0), 0);

  return (
    <div className="px-4 mx-auto space-y-4 md:space-y-6 max-w-7xl md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-r from-[color:var(--ft-surface)] to-[color:var(--ft-surface-2)] rounded-xl">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[color:var(--ft-text)] mb-1">
            Debt Management
          </h1>
          <p className="text-sm md:text-base text-[color:var(--ft-muted)]">Track who owes you money - completely separate from expenses</p>
        </div>
        <Button onClick={handleAddDebt} className="gap-2 px-4 py-2 text-sm text-black bg-white hover:bg-white/90 md:text-base whitespace-nowrap">
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Add Debt
        </Button>
      </div>

      {/* Summary Card */}
      <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl hover:border-red-500/30 transition-all">
        <p className="text-xs md:text-sm text-[color:var(--ft-muted)] uppercase tracking-wider mb-2">Total Outstanding Debt</p>
        <p className="text-3xl md:text-4xl font-bold text-[color:var(--ft-text)]">₹{totalOutstanding.toFixed(2)}</p>
        <p className="text-xs md:text-sm text-[color:var(--ft-muted)] mt-2">{unpaidDebts.length} unpaid record{unpaidDebts.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Debts List */}
      <div className="p-4 md:p-6 border border-[color:var(--ft-border)] bg-[color:var(--ft-surface)] rounded-xl">
        <h2 className="text-xl md:text-2xl font-bold text-[color:var(--ft-text)] mb-4 md:mb-6">Debt Records</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-b-2 border-white rounded-full animate-spin"></div>
          </div>
        ) : debts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[color:var(--ft-muted)] text-base md:text-lg">No debts recorded yet</p>
            <p className="text-[color:var(--ft-muted-2)] text-xs md:text-sm mt-2">Click "Add Debt" to track money owed to you</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Unpaid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[color:var(--ft-text)]">Unpaid</h3>
                <span className="text-sm text-[color:var(--ft-muted)]">₹{totalOutstanding.toFixed(2)}</span>
              </div>
              {unpaidDebts.length === 0 ? (
                <p className="text-sm text-[color:var(--ft-muted-2)]">All caught up — no unpaid debts.</p>
              ) : (
                unpaidDebts
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((debt) => (
                    <div
                      key={debt._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 border border-[color:var(--ft-border)] bg-[color:var(--ft-surface-2)] rounded-lg hover:border-white/20 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <h3 className="text-base md:text-lg font-semibold text-[color:var(--ft-text)]">{debt.name}</h3>
                          <span className="px-2 py-1 text-xs font-medium text-red-300 rounded-full md:px-3 bg-red-500/20">
                            ₹{debt.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-[color:var(--ft-muted)] mt-1">
                          {new Date(debt.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex self-end gap-2 sm:self-auto">
                        <Button
                          onClick={() => handleMarkPaid(debt)}
                          variant="ghost"
                          size="sm"
                          className="text-green-300 hover:bg-green-500/10 px-3 py-2"
                        >
                          <CheckCircle2 className="w-4 h-4 md:w-4 md:h-4 mr-1" />
                          Paid
                        </Button>
                        <Button
                          onClick={() => handleEditDebt(debt)}
                          variant="ghost"
                          size="sm"
                          className="px-3 py-2 text-white hover:bg-white/10"
                        >
                          <Edit className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteDebt(debt._id)}
                          variant="ghost"
                          size="sm"
                          className="text-[color:var(--ft-danger)] hover:bg-[color:var(--ft-danger)]/10 px-3 py-2"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Paid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[color:var(--ft-text)]">Paid</h3>
                <span className="text-sm text-[color:var(--ft-muted)]">
                  ₹{paidDebts.reduce((s, d) => s + (d.amount || 0), 0).toFixed(2)}
                </span>
              </div>
              {paidDebts.length === 0 ? (
                <p className="text-sm text-[color:var(--ft-muted-2)]">No paid debts yet.</p>
              ) : (
                paidDebts
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((debt) => (
                    <div
                      key={debt._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 md:p-4 border border-[color:var(--ft-border)] bg-[color:var(--ft-surface-2)] rounded-lg hover:border-white/20 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <h3 className="text-base md:text-lg font-semibold text-[color:var(--ft-text)]">{debt.name}</h3>
                          <span className="px-2 py-1 text-xs font-medium text-green-200 rounded-full md:px-3 bg-green-500/20">
                            ₹{debt.amount.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-[color:var(--ft-muted)] mt-1">
                          {new Date(debt.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex self-end gap-2 sm:self-auto">
                        <span className="text-xs md:text-sm text-green-300 bg-green-500/10 px-3 py-1 rounded-lg">Paid</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Debt Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingDebt(null);
        }}
        title={editingDebt ? 'Edit Debt' : 'Add New Debt'}
      >
        <DebtForm
          initialData={editingDebt}
          onSave={handleSaveDebt}
          onCancel={() => {
            setIsDialogOpen(false);
            setEditingDebt(null);
          }}
        />
      </Dialog>
    </div>
  );
};

export default DebtsPage;
