import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SummaryChart = ({ expenseData = [], debtData = [] }) => {
  const chartData = months.map(month => {
    const expense = expenseData.find(e => e.month === month);
    const debt = debtData.find(d => d.month === month);
    return {
      name: month.substring(0, 3),
      Expenses: expense ? expense.total : 0,
      Debts: debt ? debt.total : 0,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
        <XAxis dataKey="name" stroke="#888888" />
        <YAxis stroke="#888888" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(30, 41, 59, 0.9)', 
            borderColor: 'rgba(255, 255, 255, 0.2)' 
          }}
        />
        <Legend wrapperStyle={{ color: '#FFFFFF' }}/>
        <Bar dataKey="Expenses" fill="#8884d8" />
        <Bar dataKey="Debts" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SummaryChart;