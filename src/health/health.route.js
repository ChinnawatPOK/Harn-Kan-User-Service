import { Router } from "express";

import { health, liveness, readiness } from "./health.controller.js";

const router = Router();

router.get("/", health);
router.get("/live", liveness);
router.get("/ready", readiness);

export default router;
