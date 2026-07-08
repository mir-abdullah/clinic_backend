import { getMonthlyVisitsReport, getMonthlyPaymentsReport ,getPatientsReport,getMonthlyAppointmentsReport } from "../../controllers/reports/reports.js";
import express from "express";


const router = express.Router();
router.get("/visits", getMonthlyVisitsReport);

router.get("/payments", getMonthlyPaymentsReport);

router.get("/appointments", getMonthlyAppointmentsReport);


router.get("/patients", getPatientsReport);





export default router;