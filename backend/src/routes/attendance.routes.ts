import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller.js';
import validate from '../middleware/validate.middleware.js';
import { createAttendanceSchema, updateAttendanceSchema } from '@school/shared';

const router = Router();

router.post('/', validate(createAttendanceSchema), AttendanceController.markAttendance);
router.get('/session/:sessionId', AttendanceController.getAttendanceBySession);
router.get('/student/:studentId', AttendanceController.getAttendanceByStudent);
router.put('/:id', validate(updateAttendanceSchema), AttendanceController.updateAttendance);
router.delete('/:id', AttendanceController.deleteAttendance);

export default router;
