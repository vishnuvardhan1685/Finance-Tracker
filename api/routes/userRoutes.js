import express from 'express';
const router = express.Router();
import { protectRoute } from '../middleware/auth.js';
import { updateProfileValidation, updateProfile } from '../controllers/userController.js';

// Get user profile
router.get('/profile', protectRoute, (req, res) => {
    res.json({
        success: true,
        user: req.user,
    });
});

// Update user profile
router.put('/profile', protectRoute, updateProfileValidation, updateProfile);

export default router;