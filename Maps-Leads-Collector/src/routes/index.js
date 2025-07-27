import express from 'express';
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => res.json({
  status: 'UP',
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
}));

export default router;
