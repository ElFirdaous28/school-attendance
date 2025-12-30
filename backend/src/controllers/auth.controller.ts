// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/db.js';

const ACCESS_TOKEN_EXP = '1d';
const REFRESH_TOKEN_EXP = '7d';

interface TokenPayload {
    id: string;
    role?: UserRole;
    fullname?: string;
    email?: string;
    jti?: string;
}

// Generate access + refresh tokens
const generateTokens = (user: { id: string; role: UserRole; firstName: string; lastName: string; email: string }) => {
    const accessToken = jwt.sign(
        {
            id: user.id,
            role: user.role,
            fullname: `${user.firstName} ${user.lastName}`,
            email: user.email,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: ACCESS_TOKEN_EXP }
    );

    const refreshToken = jwt.sign(
        {
            id: user.id,
            jti: crypto.randomUUID(),
        },
        process.env.JWT_REFRESH_SECRET as string,
        { expiresIn: REFRESH_TOKEN_EXP }
    );

    return { accessToken, refreshToken };
};

// Set refresh token in cookie
const setRefreshCookie = (res: Response, refreshToken: string) => {
    res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// Send user + access token response
const sendUserResponse = (
    res: Response,
    user: { id: string; firstName: string; lastName: string; email: string; role: UserRole },
    accessToken: string
) => {
    res.status(200).json({
        message: 'Success',
        accessToken,
        user: {
            id: user.id,
            fullname: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
        },
    });
};

// LOGIN
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const { accessToken, refreshToken } = generateTokens(user);
        const decoded = jwt.decode(refreshToken) as { exp: number };

        // Store refresh token in DB
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(decoded.exp * 1000),
            },
        });

        setRefreshCookie(res, refreshToken);
        sendUserResponse(res, user, accessToken);
    } catch (error) {
        next(error);
    }
};

// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies?.refresh_token;
    if (!token) return res.status(401).json({ message: 'No refresh token found' });

    try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload;

        const storedToken = await prisma.refreshToken.findFirst({
            where: { userId: payload.id, token },
        });
        if (!storedToken) return res.status(401).json({ message: 'Refresh token revoked' });

        const user = await prisma.user.findUnique({ where: { id: payload.id } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate new tokens
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user);
        const decodedNew = jwt.decode(newRefreshToken) as { exp: number };

        await prisma.refreshToken.delete({ where: { id: storedToken.id } });

        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: newRefreshToken,
                expiresAt: new Date(decodedNew.exp * 1000),
            },
        });

        setRefreshCookie(res, newRefreshToken);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
    const token = req.cookies?.refresh_token;

    if (token) {
        await prisma.refreshToken.deleteMany({ where: { token } });
    }

    res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    res.status(200).json({ message: 'Logged out successfully' });
};
