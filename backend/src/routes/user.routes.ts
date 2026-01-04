import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import authorizeRoles from '../middleware/role-authorization.middlware.js';
import { createUserSchema, updateUserSchema } from '@school/shared';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.use(authenticate);
router.get('/profile', UserController.profile);
router.post('/', authorizeRoles(UserRole.ADMIN), validate(createUserSchema), UserController.createUser);

router.get('/', authorizeRoles(UserRole.ADMIN), UserController.getAllUsers);
router.get('/:id', authorizeRoles(UserRole.ADMIN), UserController.getUserById);
router.put('/:id', authorizeRoles(UserRole.ADMIN), validate(updateUserSchema), UserController.updateUser);


router.delete('/:id', UserController.deleteUser);

export default router;