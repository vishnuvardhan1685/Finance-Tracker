import { check, validationResult } from 'express-validator';
import Expense from '../models/Expense.js';

// Validation middleware for createExpense
export const createExpenseValidation = [
  check('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim(),
  check('title')
    .notEmpty()
    .withMessage('Title is required')
    .trim(),
  check('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  check('paymentMethod')
    .optional()
    .isString()
    .trim(),
  check('paidTo')
    .optional()
    .isString()
    .trim(),
  check('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => new Date(value) <= new Date())
    .withMessage('Date cannot be in the future'),
  check('month')
    .isIn(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
    .withMessage('Invalid month'),
  check('year')
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Invalid year'),
];

// Validation middleware for updateExpense
export const updateExpenseValidation = [
  check('category')
    .optional()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .trim(),
  check('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .trim(),
  check('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  check('paymentMethod')
    .optional()
    .isString()
    .trim(),
  check('paidTo')
    .optional()
    .isString()
    .trim(),
  check('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => new Date(value) <= new Date())
    .withMessage('Date cannot be in the future'),
  check('month')
    .optional()
    .isIn(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
    .withMessage('Invalid month'),
  check('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Invalid year'),
];

// Validation middleware for getExpenseSummary
export const getExpenseSummaryValidation = [
  check('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Invalid year'),
];

// Get all expenses for the authenticated user
export const getExpenses = async (req, res) => {
  try {
    const { year, month } = req.query;
    const query = { userId: req.user.id };

    if (year) query.year = parseInt(year);
    if (month) query.month = month;

    const expenses = await Expense.find(query).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    console.error('Error in getExpenses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Create a new expense
export const createExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const { category, title, amount, paymentMethod, paidTo, date, month, year } = req.body;

    // Validate date matches month and year
    const expenseDate = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (months[expenseDate.getMonth()] !== month || expenseDate.getFullYear() !== year) {
      return res.status(400).json({
        success: false,
        message: 'Date does not match provided month or year',
      });
    }

    const expense = new Expense({
      userId: req.user.id,
      category,
      title,
      paidTo: typeof paidTo === 'string' ? paidTo.trim() : '',
      amount,
      paymentMethod: paymentMethod || 'Cash',
      date,
      month,
      year,
    });

    await expense.save();

    // Fallback: explicitly persist paidTo and re-fetch the saved document.
    // This guards against unexpected field omission during save/serialization.
    const paidToValue = typeof paidTo === 'string' ? paidTo.trim() : '';
    await Expense.updateOne(
      { _id: expense._id, userId: req.user.id },
      { $set: { paidTo: paidToValue } }
    );
    const savedExpense = await Expense.findOne({ _id: expense._id, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: savedExpense,
    });
  } catch (error) {
    console.error('Error in createExpense:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update an expense
export const updateExpense = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const { id } = req.params;
    const { category, title, amount, paymentMethod, paidTo, date, month, year } = req.body;

    // Validate date matches month and year if provided
    if (date && month && year) {
      const expenseDate = new Date(date);
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      if (months[expenseDate.getMonth()] !== month || expenseDate.getFullYear() !== year) {
        return res.status(400).json({
          success: false,
          message: 'Date does not match provided month or year',
        });
      }
    }

    const updateData = {};
  if (category) updateData.category = category;
    if (title) updateData.title = title;
    if (amount) updateData.amount = amount;
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  if (paidTo !== undefined) updateData.paidTo = typeof paidTo === 'string' ? paidTo.trim() : '';
    if (date) updateData.date = date;
    if (month) updateData.month = month;
    if (year) updateData.year = year;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or not authorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: { ...expense.toObject({ getters: true, virtuals: false }), paidTo: expense.paidTo ?? '' },
    });
  } catch (error) {
    console.error('Error in updateExpense:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete an expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or not authorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get expense summary
export const getExpenseSummary = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const { year } = req.query;
    const query = { userId: req.user.id };

    if (year) query.year = parseInt(year);

    // Monthly summary
    const monthlySummary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: { year: '$year', month: '$month' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': -1, '_id.month': 1 },
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          total: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Yearly summary
    const yearlySummary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$year',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $project: {
          year: '$_id',
          total: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthly: monthlySummary,
        yearly: yearlySummary,
      },
    });
  } catch (error) {
    console.error('Error in getExpenseSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};