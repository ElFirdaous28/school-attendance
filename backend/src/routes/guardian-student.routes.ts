import express from "express";
import {
    GuardianStudentController
} from "../controllers/guardian-student.controller.js";
import validate from "../middleware/validate.middleware.js";
import { createGuardianStudentSchema } from '@school/shared';


const router = express.Router();

router.post("/", validate(createGuardianStudentSchema), GuardianStudentController.create);
router.get("/", GuardianStudentController.getAll);
router.get("/:id", GuardianStudentController.getById);
router.delete("/:id", GuardianStudentController.delete);

export default router;
