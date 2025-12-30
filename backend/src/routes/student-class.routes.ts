import { Router } from 'express';
import { StudentClassController } from '../controllers/student-class.controller.js';
import validate from '../middleware/validate.middleware.js';
import { createStudentClassSchema, updateStudentClassSchema } from '@school/shared';

const router = Router();

// Enrollment
router.post('/enroll', validate(createStudentClassSchema), StudentClassController.enrollStudentInClass);
router.put('/:id', validate(updateStudentClassSchema), validate(updateStudentClassSchema), StudentClassController.updateEnrollment);
router.delete('/:id', StudentClassController.removeStudentFromClass);

// Queries
router.get('/student/:studentId/classes', StudentClassController.getClassesForStudent);
router.get('/class/:classId/students', StudentClassController.getStudentsInClass);

export default router;
