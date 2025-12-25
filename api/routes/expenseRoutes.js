import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getExpenses, createExpense, updateExpense, deleteExpense, getExpenseSummary } from "../controllers/expenseController.js";
import { updateExpenseValidation, createExpenseValidation, getExpenseSummaryValidation } from "../controllers/expenseController.js";

const router = express.Router();

router.use(protectRoute);

router.get("/",getExpenses);
router.post("/",createExpenseValidation,createExpense);
router.put("/:id",updateExpenseValidation,updateExpense);
router.delete("/:id",deleteExpense);
router.get("/summary",getExpenseSummaryValidation,getExpenseSummary);


export default router;