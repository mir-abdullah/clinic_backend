import express from "express";
import { getAllVisits, getVisitsByPatientId, addVisit, getVisitById, updateVisit, deleteVisit, getVisitStats } from "../../controllers/visit/visit.js";

const router =express.Router();

//get all visits
router.get("/all",getAllVisits)

//get visit of a patient
router.get("/patient/:patientId",getVisitsByPatientId)

//add a visit
router.post("/add",addVisit)

//get a visit by id
router.get("/:id",getVisitById)

//update a visit
router.put("/:id",updateVisit)

//delete a visit
router.delete("/:id",deleteVisit)

//get visit stats 
router.get("/Monthlystats",getVisitStats)

export default router;