import express from 'express';
import { getNewsByCategory } from '../controllers/news.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

router.get('/:category', protectRoute, getNewsByCategory);

export default router; 