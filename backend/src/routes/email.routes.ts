import { Router } from "express";
import { sendTestEmailController } from "../controllers/email.controller";

const router = Router();

router.post("/test", sendTestEmailController);

export default router;
