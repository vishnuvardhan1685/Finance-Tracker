import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const DebtForm = ({ onSave, onCancel, initialData }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('unpaid');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setAmount(initialData.amount);
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setStatus(initialData.status || 'unpaid');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const debtData = {
      name,
      amount: parseFloat(amount),
      date,
      status,
    };
    onSave(debtData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-muted-foreground">Debtor Name</label>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Amount</label>
        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Date</label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="text-black">Save Debt</Button>
      </div>
    </form>
  );
};

export default DebtForm;
