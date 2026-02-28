import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  icon: {
    type: String,
    trim: true,
    default: 'Tag',
  },
  color: {
    type: String,
    trim: true,
    default: '#94A3B8',
  },
  categoryType: {
    type: String,
    enum: ['expense', 'income', 'both'],
    default: 'expense',
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

categorySchema.index({ name: 1, userId: 1 }, { unique: true, sparse: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
