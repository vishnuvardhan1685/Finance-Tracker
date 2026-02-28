import Category from '../models/Category.js';

export const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const typeFilter = ['expense', 'income', 'both'].includes(type)
      ? { categoryType: { $in: [type, 'both'] } }
      : {};
    const categories = await Category.find({
      $or: [{ isSystem: true }, { userId: req.user.id }],
      ...typeFilter,
    }).sort({ isSystem: -1, name: 1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error in getCategories:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, icon, color, categoryType } = req.body;
    if (categoryType && !['expense', 'income', 'both'].includes(categoryType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category type',
      });
    }


    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Category.findOne({
      name: new RegExp(`^${escapedName}$`, 'i'),
      $or: [{ isSystem: true }, { userId: req.user.id }],
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists',
      });
    }

    const category = await Category.create({
      name: name.trim(),
      icon: typeof icon === 'string' && icon.trim() ? icon.trim() : undefined,
      color: typeof color === 'string' && color.trim() ? color.trim() : undefined,
      categoryType: categoryType || 'expense',
      userId: req.user.id,
      isSystem: false,
    });

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('Error in createCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, userId: req.user.id });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    if (category.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'System categories cannot be deleted',
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
