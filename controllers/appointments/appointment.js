import prisma from "../../db.js";


//get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const { date, status, search, page, pageSize } = req.query;

    // ── Date filter (day range) ──────────────────────────────────────────
    let dateFilter = {};
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      dateFilter = { date: { gte: start, lte: end } };
    }

    // ── Status filter (comma-separated e.g. "SCHEDULED,CHECKED_IN") ─────
    const statusFilter =
      status
        ? { status: { in: status.split(",").filter(Boolean) } }
        : {};

    // ── Search filter (patient name or phone) ────────────────────────────
    const searchFilter =
      search
        ? {
            patient: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
              ],
            },
          }
        : {};

    const where = { ...dateFilter, ...statusFilter, ...searchFilter };

    // ── Paginated (list view) vs unpaginated (day/week view) ─────────────
    if (page && pageSize) {
      const take = parseInt(pageSize);
      const skip = (parseInt(page) - 1) * take;

      const [appointments, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          include: { patient: true },
          orderBy: [{ date: "desc" }, { time: "asc" }],
          skip,
          take,
        }),
        prisma.appointment.count({ where }),
      ]);

      return res.json({
        appointments,
        total,
        totalPages: Math.ceil(total / take),
        page: parseInt(page),
      });
    }

    // ── No pagination — day/week view ────────────────────────────────────
    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: true },
      orderBy: { time: "asc" },
    });

    res.json(appointments);

  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "An error occurred while fetching appointments." });
  }
};

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
            include: { 
                patient: {
                    select: {
                        name: true,
                        phone: true
                    }
                }
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
             orderBy: { createdAt: "desc"},
             
         });
    
        res.json({appointments});
    }
    catch(error){
        console.error("Error fetching appointments for patient:", error);
        res.status(500).json({ error: "An error occurred while fetching appointments for the patient." });
    }
}
