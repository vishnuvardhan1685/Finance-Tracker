import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/stores/expenseStore';

const TransactionForm = ({ initialData, onSave, onCancel }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [dateError, setDateError] = useState('');

  const [formData, setFormData] = useState({
    date: todayStr,
    category: EXPENSE_CATEGORIES[0],
    description: '',
    amount: '',
    paymentMethod: PAYMENT_METHODS[0],
    paidTo: ''
  });
  
  useEffect(() => {
    if (initialData) {
      const initialDateStr = new Date(initialData.date).toISOString().split('T')[0];
      setFormData({
        // If somehow an old record has a future date, clamp it to today to keep the form valid
        date: initialDateStr > todayStr ? todayStr : initialDateStr,
        category: initialData.category || EXPENSE_CATEGORIES[0],
        description: initialData.description || '',
        amount: initialData.amount?.toString() || '',
        paymentMethod: initialData.paymentMethod || PAYMENT_METHODS[0],
        paidTo: initialData.paidTo || ''
      });
    }
  }, [initialData, todayStr]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'date') {
      setDateError(value > todayStr ? 'Date cannot be in the future' : '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();

    // Block future dates (UI + backend both enforce this, but we keep UI strict)
    if (formData.date > todayStr) {
      setDateError('Date cannot be in the future');
      return;
    }
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date: formData.date
    };
    
    onSave(transactionData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Date of Payment <span className="text-red-400">*</span>
          </label>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            max={todayStr}
            required
            className="w-full bg-gray-700"
          />
          {dateError ? (
            <p className="mt-1 text-sm text-red-400">{dateError}</p>
          ) : null}
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Payment Method <span className="text-red-400">*</span>
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAYMENT_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Paid To
          </label>
          <Input
            type="text"
            name="paidTo"
            value={formData.paidTo}
            onChange={handleChange}
            placeholder="e.g., Local Supplier"
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Amount (₹) <span className="text-red-400">*</span>
          </label>
          <Input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            className="w-full"
          />
        </div>
        
        <div className="col-span-2">
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            placeholder="e.g., Cleaning supplies (mops, bleach)"
            className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="text-black bg-white hover:bg-white/90">
          {initialData ? 'Update' : 'Add'} Transaction
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
