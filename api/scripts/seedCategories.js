import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Category from '../models/Category.js';

dotenv.config();

const defaultCategories = [
  { name: 'Food', icon: 'Utensils', color: '#F97316', categoryType: 'expense' },
  { name: 'Transportation', icon: 'Car', color: '#3B82F6', categoryType: 'expense' },
  { name: 'Entertainment', icon: 'Popcorn', color: '#EC4899', categoryType: 'expense' },
  { name: 'Utilities', icon: 'Lightbulb', color: '#F59E0B', categoryType: 'expense' },
  { name: 'Insurances', icon: 'Shield', color: '#6366F1', categoryType: 'expense' },
  { name: 'Mobile communication', icon: 'Smartphone', color: '#14B8A6', categoryType: 'expense' },
  { name: 'Savings', icon: 'PiggyBank', color: '#10B981', categoryType: 'expense' },
  { name: 'Loan payment', icon: 'HandCoins', color: '#A855F7', categoryType: 'expense' },
  { name: 'Leisure', icon: 'Umbrella', color: '#E11D48', categoryType: 'expense' },
  { name: 'Travel', icon: 'Plane', color: '#0EA5E9', categoryType: 'expense' },
  { name: 'Clothes', icon: 'Shirt', color: '#8B5CF6', categoryType: 'expense' },
  { name: 'Media subscription', icon: 'Tv', color: '#22C55E', categoryType: 'expense' },
  { name: 'Other Expenses', icon: 'Tag', color: '#94A3B8', categoryType: 'expense' },
  { name: 'Salary', icon: 'Wallet', color: '#22C55E', categoryType: 'income' },
  { name: 'Freelance', icon: 'Briefcase', color: '#14B8A6', categoryType: 'income' },
  { name: 'Business Income', icon: 'Building2', color: '#3B82F6', categoryType: 'income' },
  { name: 'Investment Returns', icon: 'TrendingUp', color: '#F59E0B', categoryType: 'income' },
  { name: 'Rental Income', icon: 'Home', color: '#8B5CF6', categoryType: 'income' },
  { name: 'Gift / Bonus', icon: 'Gift', color: '#EC4899', categoryType: 'income' },
  { name: 'Other Income', icon: 'Tag', color: '#10B981', categoryType: 'income' },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCategories = async () => {
  try {
    await connectDB();

    const categoriesToInsert = defaultCategories.map((category) => ({
      ...category,
      isSystem: true,
      userId: null,
    }));

    const operations = categoriesToInsert.map((category) => ({
      updateOne: {
        filter: { name: category.name, isSystem: true },
        update: { $set: category },
        upsert: true,
      },
    }));

    const result = await Category.bulkWrite(operations);
    const inserted = result.upsertedCount || 0;
    console.log(`✅ Seeded/updated ${operations.length} system categories (new: ${inserted})`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed categories:', error);
    process.exit(1);
  }
};

seedCategories();
