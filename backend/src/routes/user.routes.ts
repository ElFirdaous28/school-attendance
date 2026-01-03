import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import authorizeRoles from '../middleware/role-authorization.middlware.js';
import { createUserSchema, updateUserSchema } from '@school/shared';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get('/profile', authenticate, UserController.profile);
router.post('/', validate(createUserSchema), UserController.createUser);

router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', validate(updateUserSchema), UserController.updateUser);


router.delete('/:id', UserController.deleteUser);

export default router;