import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Dialog from '@/components/ui/Dialog';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [activeDescription, setActiveDescription] = useState('');

  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-400">No transactions found</p>
        <p className="mt-2 text-sm text-gray-500">Start by adding your first expense!</p>
      </div>
    );
  }
  
  // Calculate running total
  let runningTotal = 0;

  const openDescription = (description) => {
    setActiveDescription(description || '-');
    setIsDescOpen(true);
  };
  
  return (
    <div className="overflow-x-auto">
      <Dialog
        isOpen={isDescOpen}
        onClose={() => setIsDescOpen(false)}
        title="Description"
      >
        <p className="text-[color:var(--ft-text)] whitespace-pre-wrap break-words">{activeDescription}</p>
      </Dialog>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-400">Date</th>
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-400">Payment Method</th>
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-400">Paid To</th>
            <th className="px-4 py-3 text-sm font-medium text-left text-gray-400">Description</th>
            <th className="px-4 py-3 text-sm font-medium text-right text-gray-400">Amount (₹)</th>
            <th className="px-4 py-3 text-sm font-medium text-right text-gray-400">Running Total (₹)</th>
            <th className="px-4 py-3 text-sm font-medium text-center text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            runningTotal += transaction.amount;
            
            return (
              <tr key={transaction.id} className="transition-colors border-b border-gray-700/50 hover:bg-gray-700/30">
                <td className="px-4 py-3 text-white">
                  {new Date(transaction.date).toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-4 py-3 text-gray-300">{transaction.paymentMethod}</td>
                <td className="px-4 py-3 text-gray-300">{(transaction.paidTo || '').trim() || '-'}</td>
                <td className="max-w-xs px-4 py-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openDescription(transaction.description)}
                    className="text-gray-300 hover:bg-white/10 hover:text-white"
                  >
                    Show description
                  </Button>
                </td>
                <td className="px-4 py-3 font-medium text-right text-white">
                  ₹{transaction.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 font-semibold text-right text-green-400">
                  ₹{runningTotal.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(transaction)}
                      className="hover:bg-white/10 hover:text-white"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(transaction.id)}
                      className="hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-600 bg-gray-700/50">
            <td colSpan="4" className="px-4 py-3 font-semibold text-right text-white">
              Total to Date:
            </td>
            <td className="px-4 py-3 text-lg font-bold text-right text-white">
              ₹{runningTotal.toFixed(2)}
            </td>
            <td colSpan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default TransactionList;
