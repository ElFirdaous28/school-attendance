import express from 'express';
import {login, logout, refreshToken } from '../controllers/auth.controller.js';

const router = express.Router();

// Routes
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

export default router;
