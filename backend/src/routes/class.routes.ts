import express from "express";
import { ClassController, } from "../controllers/class.controller.js";
import validate from "../middleware/validate.middleware.js";
import { createClassSchema, updateClassSchema } from "@school/shared";

const router = express.Router();


router.post("/", validate(createClassSchema), ClassController.create);
router.get("/", ClassController.getAll);
router.get("/:id", ClassController.getById);
router.put("/:id", validate(updateClassSchema), ClassController.update);
router.delete("/:id", ClassController.delete);

export default router;
