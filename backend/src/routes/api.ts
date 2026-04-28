import { Router } from 'express';
import * as tokenController from '../controllers/tokenController.js';
import * as commentController from '../controllers/commentController.js';
import * as leaderboardController from '../controllers/leaderboardController.js';
import * as userController from '../controllers/userController.js';

const router = Router();

// Tokens
router.get('/tokens', tokenController.getTokens);
router.get('/tokens/:address', tokenController.getTokenDetail);
router.get('/tokens/:address/trades', tokenController.getTokenTrades);
router.get('/tokens/:address/chart', tokenController.getChartData);
router.get('/tokens/:address/holders', tokenController.getTokenHolders);

// Comments
router.get('/tokens/:address/comments', commentController.getComments);
router.post('/tokens/:address/comments', commentController.createComment);

// Leaderboard
router.get('/leaderboard', leaderboardController.getLeaderboard);

// User
router.get('/user/:address', userController.getUserProfile);
router.post('/user/update', userController.updateProfile);
router.post('/user/sync', userController.syncUser);

export default router;
