// Sample data generator for testing Finance Tracker

export const generateSampleData = () => {
  const categories = [
    'Food', 'Transportation', 'Entertainment', 'Utilities', 'Insurances',
    'Mobile communication', 'Savings', 'Loan payment', 'Leisure', 'Travel',
    'Clothes', 'Media subscription', 'Other Expenses'
  ];
  
  const paymentMethods = ['Cash', 'Credit', 'Debit', 'Visa', 'Mobile Payment'];
  
  const paidToOptions = [
    'Local Supplier', 'Gas Station', 'Equipment Depot', 'Restaurant',
    'Grocery Store', 'Online Store', 'Service Provider', 'Utility Company',
    'Insurance Company', 'Bank', 'Mall', 'Pharmacy'
  ];
  
  const descriptions = {
    'Food': ['Grocery shopping', 'Restaurant dinner', 'Coffee shop', 'Lunch break'],
    'Transportation': ['Gas for vehicle', 'Public transport pass', 'Taxi fare', 'Car maintenance'],
    'Entertainment': ['Movie tickets', 'Concert', 'Streaming service', 'Gaming'],
    'Utilities': ['Electricity bill', 'Water bill', 'Internet service', 'Phone bill'],
    'Insurances': ['Car insurance', 'Health insurance', 'Life insurance', 'Home insurance'],
    'Mobile communication': ['Phone bill', 'Mobile data', 'International call', 'Phone repair'],
    'Savings': ['Monthly savings', 'Emergency fund', 'Investment', 'Retirement fund'],
    'Loan payment': ['Mortgage payment', 'Car loan', 'Personal loan', 'Student loan'],
    'Leisure': ['Gym membership', 'Spa day', 'Hobby supplies', 'Books'],
    'Travel': ['Flight tickets', 'Hotel booking', 'Vacation expenses', 'Travel insurance'],
    'Clothes': ['New outfit', 'Shoes', 'Accessories', 'Dry cleaning'],
    'Media subscription': ['Netflix', 'Spotify', 'Magazine subscription', 'News app'],
    'Other Expenses': ['Miscellaneous', 'Unexpected expense', 'General purchase', 'Other']
  };
  
  const transactions = [];
  const currentYear = new Date().getFullYear();
  
  // Generate 20-30 random transactions for the current year
  const numTransactions = 20 + Math.floor(Math.random() * 11);
  
  for (let i = 0; i < numTransactions; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const month = Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    const date = new Date(currentYear, month, day);
    
    const transaction = {
      id: Date.now().toString() + i,
      date: date.toISOString().split('T')[0],
      category,
      description: descriptions[category][Math.floor(Math.random() * descriptions[category].length)],
      amount: parseFloat((10 + Math.random() * 990).toFixed(2)),
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paidTo: paidToOptions[Math.floor(Math.random() * paidToOptions.length)],
      createdAt: new Date().toISOString()
    };
    
    transactions.push(transaction);
  }
  
  // Sort by date
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  return transactions;
};

export const loadSampleData = () => {
  const sampleData = generateSampleData();
  localStorage.setItem('expenseTrackerTransactions', JSON.stringify(sampleData));
  return sampleData;
};

export const clearAllData = () => {
  localStorage.removeItem('expenseTrackerTransactions');
};
