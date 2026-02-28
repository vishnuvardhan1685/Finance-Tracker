import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import useExpenseStore, { PAYMENT_METHODS } from '@/stores/expenseStore';

const TransactionForm = ({ initialData, onSave, onCancel }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const categories = useExpenseStore((state) => state.categories);
  const fetchCategories = useExpenseStore((state) => state.fetchCategories);
  const isCategoriesLoading = useExpenseStore((state) => state.isCategoriesLoading);

  const [dateError, setDateError] = useState('');

  const [formData, setFormData] = useState({
    date: todayStr,
    category: '',
    description: '',
    amount: '',
    type: 'expense',
    paymentMethod: PAYMENT_METHODS[0],
    paidTo: ''
  });

  const filteredCategories = categories.filter((cat) => {
    const catType = cat.categoryType || 'expense';
    if (formData.type === 'income') {
      return ['income', 'both'].includes(catType);
    }
    return ['expense', 'both'].includes(catType);
  });

  useEffect(() => {
    if (categories.length === 0) {
      fetchCategories();
    }
  }, [categories.length, fetchCategories]);
  
  useEffect(() => {
    if (initialData) {
      const initialDateStr = new Date(initialData.date).toISOString().split('T')[0];
      setFormData({
        // If somehow an old record has a future date, clamp it to today to keep the form valid
        date: initialDateStr > todayStr ? todayStr : initialDateStr,
        category: initialData.category || categories[0]?.name || '',
        description: initialData.description || '',
        amount: initialData.amount?.toString() || '',
        type: initialData.type || 'expense',
        paymentMethod: initialData.paymentMethod || PAYMENT_METHODS[0],
        paidTo: initialData.paidTo || ''
      });
    }
  }, [initialData, todayStr, categories]);

  useEffect(() => {
    if (filteredCategories.length === 0) return;
    if (!formData.category || !filteredCategories.some((cat) => cat.name === formData.category)) {
      setFormData((prev) => ({ ...prev, category: filteredCategories[0].name }));
    }
  }, [filteredCategories, initialData, formData.category]);
  
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
            Transaction Type <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'expense' }))}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                formData.type === 'expense'
                  ? 'bg-white text-black border-white'
                  : 'bg-gray-700 text-white border-gray-600 hover:border-gray-500'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, type: 'income' }))}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                formData.type === 'income'
                  ? 'bg-white text-black border-white'
                  : 'bg-gray-700 text-white border-gray-600 hover:border-gray-500'
              }`}
            >
              Income
            </button>
          </div>
        </div>
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
            disabled={isCategoriesLoading || filteredCategories.length === 0}
            className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {filteredCategories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              filteredCategories.map((cat) => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))
            )}
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
            {formData.type === 'income' ? 'Income Source' : 'Paid To'}
          </label>
          <Input
            type="text"
            name="paidTo"
            value={formData.paidTo}
            onChange={handleChange}
            placeholder={formData.type === 'income' ? 'e.g., Salary, Client, Rental' : 'e.g., Local Supplier'}
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
