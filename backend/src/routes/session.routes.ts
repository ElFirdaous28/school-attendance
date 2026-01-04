import { Router } from 'express';
import { SessionController } from '../controllers/session.controller.js';
import validate from '../middleware/validate.middleware.js';
import { createSessionSchema, updateSessionSchema } from '@school/shared';

const router = Router();

router.post('/', validate(createSessionSchema), SessionController.createSession);
router.put('/:id', validate(updateSessionSchema), SessionController.updateSession);
router.get('/', SessionController.getSessions);
router.get('/:id', SessionController.getSessionById);
router.delete('/:id', SessionController.deleteSession);
router.put('/validate/:id', SessionController.validateSession);

export default router;
