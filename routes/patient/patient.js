import express from "express";
import { getAllPatients ,addPatient,getPatientById,updatePatient,deletePatient, totalPatientsThisMonthCount,totalPatientsCount} from "../../controllers/patient/patient.js";

const router = express.Router();

//get all patients
router.get("/all",getAllPatients);

//add a patient
router.post("/add",addPatient)

//get a patient by id
router.get("/:id",getPatientById)

//update a patient
router.put("/:id",updatePatient)

//delete a patient
router.patch("/:id",deletePatient)

//total patients count 
router.get("/total/count",totalPatientsCount)

//number of patents this month
router.get("/total/count/month",totalPatientsThisMonthCount)



export default router;


