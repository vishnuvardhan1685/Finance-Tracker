import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getDebts, createDebt, updateDebt, deleteDebt, getDebtSummary } from "../controllers/debtController.js";
import { createDebtValidation, updateDebtValidation, getDebtSummaryValidation } from "../controllers/debtController.js";
const router = express.Router();

router.use(protectRoute);
router.get("/",getDebts);
router.get("/summary",getDebtSummaryValidation,getDebtSummary);
router.post("/",createDebtValidation,createDebt);
router.put("/:id",updateDebtValidation,updateDebt);
router.delete("/:id",deleteDebt);

export default router;