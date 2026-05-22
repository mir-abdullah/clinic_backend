import express from "express";
import { getAllVisits, getVisitsByPatientId, addVisit, getVisitById, updateVisit, deleteVisit, getVisitStats,getRecentVisits } from "../../controllers/visit/visit.js";

const router =express.Router();

//get all visits
router.get("/all",getAllVisits)

//get visit stats 
router.get("/Monthlystats",getVisitStats)

//get a visit by id
router.get("/:id",getVisitById)

//get last 5 visits
router.get("/recent/5",getRecentVisits)

//get visit of a patient
router.get("/patient/:patientId",getVisitsByPatientId)

//add a visit
router.post("/add",addVisit)

//update a visit
router.put("/:id",updateVisit)

//delete a visit
router.delete("/:id",deleteVisit)




export default router;