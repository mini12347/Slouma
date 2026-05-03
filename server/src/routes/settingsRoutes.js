import express from 'express';
import { 
  getUserSettings, 
  updateUserSettings, 
  resetUserSettings, 
  updateSettingsCategory,
  initializeAllUserSettings 
} from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/:userId', getUserSettings);

router.put('/:userId', updateUserSettings);

router.patch('/:userId/:category', updateSettingsCategory);

router.post('/:userId/reset', resetUserSettings);

router.post('/initialize-all', initializeAllUserSettings);

export default router;
