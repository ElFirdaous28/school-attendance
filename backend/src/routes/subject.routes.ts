import express from "express";
import { SubjectController, } from "../controllers/subject.controller.js";
import validate from "../middleware/validate.middleware.js";
import { createSubjectSchema, updateSubjectSchema } from "@school/shared";

const router = express.Router();

router.post("/", validate(createSubjectSchema), SubjectController.create);
router.get("/", SubjectController.getAll);
router.get("/:id", SubjectController.getById);
router.put("/:id", validate(updateSubjectSchema), SubjectController.update);
router.delete("/:id", SubjectController.delete);

export default router;
