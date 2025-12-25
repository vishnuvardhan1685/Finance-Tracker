import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed data generator
const generateSeedData = async () => {
  try {
    await connectDB();

    // Get the first user from the database
    const users = await User.find();
    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    const userId = users[0]._id;
    console.log(`📝 Using user: ${users[0].name} (${users[0].email})`);

    // Clear existing expenses for this user
    const deleteResult = await Expense.deleteMany({ userId });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing expenses`);

    // Month names
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Categories with realistic expense data
    const expenseData = {
      'Food': [
        { desc: 'Groceries - Monthly shopping', vendors: ['BigBasket', 'DMart', 'Reliance Fresh', 'More Supermarket'], range: [3000, 8000] },
        { desc: 'Restaurant dinner', vendors: ['Barbeque Nation', 'Paradise Biryani', 'Dominos', 'KFC'], range: [800, 2500] },
        { desc: 'Breakfast at cafe', vendors: ['Starbucks', 'Cafe Coffee Day', 'Chai Point', 'Local Cafe'], range: [200, 600] },
        { desc: 'Lunch order', vendors: ['Swiggy', 'Zomato', 'FreshMenu', 'Local Restaurant'], range: [150, 500] },
        { desc: 'Snacks and beverages', vendors: ['Local Store', 'DMart', 'Supermarket'], range: [100, 400] },
      ],
      'Transportation': [
        { desc: 'Fuel - Petrol', vendors: ['Indian Oil', 'HP Petrol Pump', 'Bharat Petroleum', 'Shell'], range: [2000, 5000] },
        { desc: 'Uber/Ola ride', vendors: ['Uber', 'Ola', 'Rapido', 'Namma Yatri'], range: [150, 800] },
        { desc: 'Auto rickshaw', vendors: ['Local Auto', 'Auto Stand'], range: [50, 300] },
        { desc: 'Metro card recharge', vendors: ['Metro Station', 'Paytm Metro'], range: [500, 1500] },
        { desc: 'Car maintenance', vendors: ['Service Center', 'Local Mechanic', 'Car Care'], range: [1000, 4000] },
      ],
      'Entertainment': [
        { desc: 'Movie tickets', vendors: ['PVR Cinemas', 'INOX', 'Cinepolis', 'BookMyShow'], range: [400, 1200] },
        { desc: 'Gaming purchase', vendors: ['Steam', 'PlayStation Store', 'Xbox Store', 'Epic Games'], range: [500, 3000] },
        { desc: 'Concert/Event tickets', vendors: ['BookMyShow', 'Paytm Insider', 'Event Organizer'], range: [1000, 5000] },
        { desc: 'Weekend outing', vendors: ['Wonderla', 'Adventure Park', 'Fun City', 'Resort'], range: [1500, 4000] },
      ],
      'Utilities': [
        { desc: 'Electricity bill', vendors: ['BESCOM', 'State Electricity Board', 'Power Company'], range: [1500, 4000] },
        { desc: 'Water bill', vendors: ['Water Board', 'Municipal Corporation'], range: [300, 800] },
        { desc: 'Internet bill', vendors: ['Airtel Fiber', 'ACT Fibernet', 'Jio Fiber', 'BSNL'], range: [500, 1500] },
        { desc: 'Gas cylinder', vendors: ['Indane Gas', 'HP Gas', 'Bharat Gas'], range: [800, 1200] },
        { desc: 'House rent', vendors: ['Property Owner', 'Landlord'], range: [10000, 25000] },
      ],
      'Insurances': [
        { desc: 'Health insurance premium', vendors: ['Star Health', 'HDFC Ergo', 'Max Bupa', 'ICICI Lombard'], range: [3000, 8000] },
        { desc: 'Car insurance', vendors: ['ICICI Lombard', 'Bajaj Allianz', 'HDFC Ergo'], range: [5000, 15000] },
        { desc: 'Life insurance premium', vendors: ['LIC', 'HDFC Life', 'SBI Life', 'Max Life'], range: [4000, 12000] },
        { desc: 'Term insurance', vendors: ['ICICI Prudential', 'Max Life', 'HDFC Life'], range: [2000, 6000] },
      ],
      'Mobile communication': [
        { desc: 'Mobile recharge', vendors: ['Jio', 'Airtel', 'Vi', 'BSNL'], range: [300, 800] },
        { desc: 'DTH recharge', vendors: ['Tata Sky', 'Airtel Digital TV', 'Dish TV', 'Sun Direct'], range: [300, 600] },
        { desc: 'Postpaid bill', vendors: ['Airtel', 'Jio', 'Vi'], range: [500, 1500] },
      ],
      'Savings': [
        { desc: 'Fixed deposit', vendors: ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'], range: [10000, 50000] },
        { desc: 'Mutual fund SIP', vendors: ['Zerodha Coin', 'Groww', 'Paytm Money', 'ET Money'], range: [5000, 20000] },
        { desc: 'Recurring deposit', vendors: ['SBI', 'HDFC Bank', 'ICICI Bank'], range: [3000, 15000] },
        { desc: 'Emergency fund', vendors: ['Savings Account', 'Liquid Fund'], range: [5000, 25000] },
      ],
      'Loan payment': [
        { desc: 'Home loan EMI', vendors: ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank'], range: [15000, 40000] },
        { desc: 'Car loan EMI', vendors: ['HDFC Bank', 'Kotak Mahindra', 'ICICI Bank'], range: [8000, 20000] },
        { desc: 'Personal loan EMI', vendors: ['SBI', 'HDFC Bank', 'Bajaj Finserv'], range: [5000, 15000] },
        { desc: 'Credit card payment', vendors: ['HDFC Bank', 'ICICI Bank', 'SBI Card', 'Axis Bank'], range: [3000, 12000] },
      ],
      'Leisure': [
        { desc: 'Spa and wellness', vendors: ['Ozone Spa', 'Tattva Spa', 'Local Spa'], range: [1500, 4000] },
        { desc: 'Gym membership', vendors: ['Gold\'s Gym', 'Cult Fit', 'Anytime Fitness', 'Local Gym'], range: [1000, 3000] },
        { desc: 'Yoga classes', vendors: ['Yoga Studio', 'Fitness Center'], range: [500, 2000] },
        { desc: 'Hobby materials', vendors: ['Hobby Store', 'Amazon', 'Local Shop'], range: [500, 3000] },
      ],
      'Travel': [
        { desc: 'Flight tickets', vendors: ['IndiGo', 'SpiceJet', 'Air India', 'Vistara'], range: [5000, 20000] },
        { desc: 'Train tickets', vendors: ['IRCTC', 'Railway Station'], range: [800, 4000] },
        { desc: 'Hotel booking', vendors: ['OYO', 'MakeMyTrip', 'Booking.com', 'Airbnb'], range: [3000, 15000] },
        { desc: 'Travel package', vendors: ['MakeMyTrip', 'Yatra', 'Travel Agent'], range: [10000, 50000] },
      ],
      'Clothes': [
        { desc: 'Clothing shopping', vendors: ['Zara', 'H&M', 'Max', 'Pantaloons', 'Lifestyle'], range: [2000, 8000] },
        { desc: 'Footwear', vendors: ['Nike Store', 'Adidas', 'Bata', 'Relaxo'], range: [1500, 5000] },
        { desc: 'Accessories', vendors: ['Shoppers Stop', 'Lifestyle', 'Local Store'], range: [500, 3000] },
        { desc: 'Formal wear', vendors: ['Van Heusen', 'Peter England', 'Raymond'], range: [3000, 10000] },
      ],
      'Media subscription': [
        { desc: 'Netflix subscription', vendors: ['Netflix'], range: [500, 800] },
        { desc: 'Amazon Prime', vendors: ['Amazon'], range: [1500, 1500] },
        { desc: 'Disney+ Hotstar', vendors: ['Disney+'], range: [1500, 1500] },
        { desc: 'Spotify Premium', vendors: ['Spotify'], range: [119, 119] },
        { desc: 'YouTube Premium', vendors: ['YouTube'], range: [129, 129] },
      ],
      'Other Expenses': [
        { desc: 'Medical expenses', vendors: ['Apollo Pharmacy', 'MedPlus', 'Local Pharmacy'], range: [500, 3000] },
        { desc: 'Books and stationery', vendors: ['Amazon', 'Crossword', 'Local Bookstore'], range: [300, 2000] },
        { desc: 'Home maintenance', vendors: ['Urban Company', 'Local Contractor'], range: [1000, 5000] },
        { desc: 'Pet care', vendors: ['Pet Store', 'Vet Clinic'], range: [500, 3000] },
        { desc: 'Gifts and donations', vendors: ['Gift Shop', 'Online Store', 'Charity'], range: [1000, 5000] },
      ],
    };

    const paymentMethods = ['Cash', 'Credit', 'Debit', 'UPI', 'Net Banking'];
    const expenses = [];

    // Generate expenses for each month of 2025
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const month = months[monthIndex];
      const year = 2025;
      
      // Generate 3-8 transactions per category per month
      for (const [category, items] of Object.entries(expenseData)) {
        const numTransactions = Math.floor(Math.random() * 6) + 3; // 3 to 8 transactions
        
        for (let i = 0; i < numTransactions; i++) {
          const item = items[Math.floor(Math.random() * items.length)];
          const vendor = item.vendors[Math.floor(Math.random() * item.vendors.length)];
          const amount = Math.floor(Math.random() * (item.range[1] - item.range[0])) + item.range[0];
          const day = Math.floor(Math.random() * 28) + 1; // 1-28 to avoid month-end issues
          const date = new Date(year, monthIndex, day);
          const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

          expenses.push({
            userId,
            category,
            title: item.desc,
            paidTo: vendor,
            amount,
            paymentMethod,
            date,
            month,
            year,
          });
        }
      }
    }

    // Insert all expenses
    const result = await Expense.insertMany(expenses);
    console.log(`✅ Successfully seeded ${result.length} expenses across all 12 months of 2025`);
    
    // Summary by category
    const summary = {};
    for (const expense of result) {
      summary[expense.category] = (summary[expense.category] || 0) + 1;
    }
    
    console.log('\n📊 Summary by Category:');
    for (const [category, count] of Object.entries(summary)) {
      console.log(`   ${category}: ${count} transactions`);
    }
    
    const total = result.reduce((sum, exp) => sum + exp.amount, 0);
    console.log(`\n💰 Total amount: ₹${total.toFixed(2)}`);
    
    console.log('\n✨ Seed data generation complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed script
generateSeedData();
