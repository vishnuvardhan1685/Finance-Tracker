import { check, validationResult } from 'express-validator';
import Debt from '../models/Debt.js';

// Validation middleware for createDebt
export const createDebtValidation = [
  check('name')
    .notEmpty()
    .withMessage('Debtor name is required')
    .trim(),
  check('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  check('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => new Date(value) <= new Date())
    .withMessage('Date cannot be in the future'),
  check('status')
    .optional()
    .isIn(['unpaid', 'paid'])
    .withMessage('Status must be unpaid or paid'),
];

// Validation middleware for updateDebt
export const updateDebtValidation = [
  check('name')
    .optional()
    .notEmpty()
    .withMessage('Debtor name cannot be empty')
    .trim(),
  check('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  check('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => new Date(value) <= new Date())
    .withMessage('Date cannot be in the future'),
  check('status')
    .optional()
    .isIn(['unpaid', 'paid'])
    .withMessage('Status must be unpaid or paid'),
];

// Validation middleware for getDebtSummary
export const getDebtSummaryValidation = [
  check('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Invalid year'),
];

// Get all debts for the authenticated user
export const getDebts = async (req, res) => {
  try {
    const debts = await Debt.find({ userId: req.user.id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: debts,
    });
  } catch (error) {
    console.error('Error in getDebts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Create a new debt
export const createDebt = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  try {
    const { name, amount, date, status } = req.body;

    const debt = new Debt({
      userId: req.user.id,
      name,
      amount,
      date,
      status: status === 'paid' ? 'paid' : 'unpaid',
    });

    await debt.save();

    res.status(201).json({
      success: true,
      message: 'Debt created successfully',
      data: debt,
    });
  } catch (error) {
    console.error('Error in createDebt:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Update a debt
export const updateDebt = async (req, res) => {
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
  const { name, amount, date, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (amount) updateData.amount = amount;
    if (date) updateData.date = date;
  if (status) updateData.status = status === 'paid' ? 'paid' : 'unpaid';

    const debt = await Debt.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found or not authorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Debt updated successfully',
      data: debt,
    });
  } catch (error) {
    console.error('Error in updateDebt:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Delete a debt
export const deleteDebt = async (req, res) => {
  try {
    const { id } = req.params;
    const debt = await Debt.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!debt) {
      return res.status(404).json({
        success: false,
        message: 'Debt not found or not authorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Debt deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteDebt:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Get debt summary
export const getDebtSummary = async (req, res) => {
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

    if (year) {
      query.date = {
        $gte: new Date(parseInt(year), 0, 1),
        $lte: new Date(parseInt(year), 11, 31, 23, 59, 59, 999),
      };
    }

    // Monthly summary
    const monthlySummary = await Debt.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
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
          month: {
            $arrayElemAt: [
              ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
              { $subtract: ['$_id.month', 1] },
            ],
          },
          total: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Yearly summary
    const yearlySummary = await Debt.aggregate([
      { $match: query },
      {
        $group: {
          _id: { $year: '$date' },
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
    console.error('Error in getDebtSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};