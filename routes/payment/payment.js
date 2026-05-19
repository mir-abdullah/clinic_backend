import express from "express";
import { addPayment, getPaymentById, updatePayment, deletePayment, getPaymentsByVisitId, getPaymentDuesByPatientId } from "../../controllers/payment/payment.js";

const router = express.Router();

//add a payment
router.post("/add",addPayment)

//get a payment by id
router.get("/:id",getPaymentById)

//update a payment
router.put("/:id",updatePayment)

//delete a payment
router.delete("/:id",deletePayment)

//get payments for a visit
router.get("/visit/:visitId",getPaymentsByVisitId)  

//get payment dues for a patient
router.get("/patient/:patientId/dues",getPaymentDuesByPatientId)


export default router;
