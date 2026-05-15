import express from "express";
import { getAllPatients } from "../../controllers/patient/patient.js";

const router = express.Router();

//get all patients
router.get("/",getAllPatients);



export default router;


