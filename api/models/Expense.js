import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense',
  },
  source: {
    type: String,
    enum: ['manual', 'imported'],
    default: 'manual',
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  merchantRaw: {
    type: String,
    trim: true,
    default: '',
  },
  paidTo: {
    type: String,
    trim: true,
    default: '',
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive'],
  },
  paymentMethod: {
    type: String,
    default: 'Cash',
    trim: true,
  },
  importHash: {
    type: String,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  month: {
    type: String,
    required: [true, 'Month is required'],
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
  },
}, {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      // Ensure optional fields are present in API responses
      ret.paidTo = ret.paidTo ?? '';
      return ret;
    },
  },
  toObject: {
    transform: (_doc, ret) => {
      ret.paidTo = ret.paidTo ?? '';
      return ret;
    },
  },
});

expenseSchema.index({ userId: 1, year: 1 });
expenseSchema.index({ userId: 1, month: 1, year: 1 });
expenseSchema.index({ userId: 1, type: 1 });
expenseSchema.index({ importHash: 1 }, { sparse: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;