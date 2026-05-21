import express from "express";
import { getAllAppointments, addAppointment, getAppointmentById, updateAppointment, deleteAppointment, getTodayAppointments, getAppointmentsByPatientId } from "../../controllers/appointments/appointment.js";

const router = express.Router();

//get all appointments
router.get("/all",getAllAppointments)

//get appointments for  today
router.get("/today",getTodayAppointments)

//get appointments for a patient
router.get("/patient/:patientId",getAppointmentsByPatientId)

//add an appointment
router.post("/add",addAppointment)

//get an appointment by id
router.get("/:id",getAppointmentById)

//update an appointment
router.put("/:id",updateAppointment)

//delete an appointment
router.delete("/:id",deleteAppointment)


// ///get appointments for this week
// router.get("/week",getThisWeekAppointments)


export default router;