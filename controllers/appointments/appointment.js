import prisma from "../../db.js";


//get all appointments
export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await prisma.appointment.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(appointments);
    } catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "An error occurred while fetching appointments." });
    }
}

//add an appointment
export const addAppointment = async (req, res) => {
    try {
        const { patientId, doctorName, date,time, reason, notes,name ,age ,phone,address,gender } = req.body;

        if(patientId){
            const patient = await prisma.patient.findUnique({
                where: { id: patientId },
            });

            if (!patient) {
                return res.status(404).json({ error: "Patient not found." });
            }
            const newAppointment = {
                patientId,
                doctorName,
                date: new Date(date),
                time,
                reason,
                notes
            };

            const appointment = await prisma.appointment.create({
                data: newAppointment,
        })
        return res.status(201).json(appointment);
    } 
    else {

        const patient = await prisma.patient.create({
            data: {
                name,
                age,
                phone,
                address,
                gender
            }
        });

        const newAppointment = {
            patientId: patient.id,
            doctorName,
            date: new Date(date),
            time,
            reason,
            notes
        };
        const appointment = await prisma.appointment.create({
            data: newAppointment,
    })
    return res.status(201).json(appointment);
}
    } catch (error) {
        console.error("Error adding appointment:", error);
        res.status(500).json({ error: "An error occurred while adding the appointment." }); 
    }

}; 

//get an appointment by id
export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await prisma.appointment.findUnique({
            where: { id: id },
        });
        if (!appointment) {
            return res.status(404).json({ error: "Appointment not found." });
        }
        res.json(appointment);
    } catch (error) {
        console.error("Error fetching appointment:", error);
        res.status(500).json({ error: "An error occurred while fetching the appointment." });
    }
};

//update an appointment
export const updateAppointment = async (req, res) => {
    try{
        const { id } = req.params;
        const {doctorName, date,time, reason, notes,status} = req.body;
        const appointment = await prisma.appointment.update({
            where: { id: id },
            data: {
                doctorName,
                date: new Date(date),
                time,
                reason,
                notes,
                status
            }
        });
        res.json(appointment);  
    } catch (error) {
        console.error("Error updating appointment:", error);
        res.status(500).json({ error: "An error occurred while updating the appointment." });
    }
}

//delete an appointment
export const deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.appointment.delete({
            where: { id: id },
        });
        res.json({ message: "Appointment deleted successfully." });
    } catch (error) {
        console.error("Error deleting appointment:", error);
        res.status(500).json({ error: "An error occurred while deleting the appointment." });
    }
}

//get appointments for today
export const getTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const appointments = await prisma.appointment.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lt: endOfDay,
                },
            },
            orderBy: { time: "asc" },
        });
        res.json({ appointments, total: appointments.length });
    } catch (error) {
        console.error("Error fetching today's appointments:", error);
        res.status(500).json({ error: "An error occurred while fetching today's appointments." });
    }
}

//get appointment for a patient
export const getAppointmentsByPatientId = async(req,res)=>{
    try{
        const {patientId} = req.params;
        const appointments = await prisma.appointment.findMany({
            where: {
                patientId: patientId
             },
             orderBy: { date: "desc", time: "desc" },
             include: {
                patient: true
             }
         });
    
        res.json({appointments, total: appointments.length});
    }
    catch(error){
        console.error("Error fetching appointments for patient:", error);
        res.status(500).json({ error: "An error occurred while fetching appointments for the patient." });
    }
}

