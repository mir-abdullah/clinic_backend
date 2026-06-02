import prisma from "../../db.js";

//get all visits
export const getAllVisits = async (req, res) => {
  try {
    const visits = await prisma.visit.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(visits);
  } catch (error) {
    console.error("Error fetching visits:", error);
    res.status(500).json({ error: "An error occurred while fetching visits." });
  }
};

//add a visit
export const addVisit = async (req, res) => {
  try {
    const { patientId, doctorName, date, time, reason, diagnosis,prescription,notes ,totalAmount,paidAmount,dueAmount    } = req.body;

    if (patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        return res.status(404).json({ error: "Patient not found." });
      }
      const newVisit = {
        patientId,
        doctorName,
        date: new Date(date),
        time,
        reason,
        notes,
        diagnosis,
        prescription,
        totalAmount,
        paidAmount,
        dueAmount
      };

      const visit = await prisma.visit.create({
        data: newVisit,
      });
      return res.status(201).json(visit);
    } else {
      return res.status(400).json({ error: "Patient ID is required." });
    }
  } catch (error) {
    console.error("Add Visit Error:", error);
    return res.status(500).json({
      error: "Failed to create visit",
    });
  }
};

//get a visit by id
export const getVisitById = async (req, res) => {
  try {
    const { id } = req.params;
    const visit = await prisma.visit.findUnique({
      where: {
        id: id
      },
    });
    if (!visit) {
      return res.status(404).json({ error: "Visit not found" });
    }
    res.json(visit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update a visit
export const updateVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorName, date, time, reason, diagnosis,prescription,notes ,totalAmount,paidAmount,dueAmount   } = req.body;
    const visit = await prisma.visit.update({
      where: {
        id: id,
      },
      data: {
        doctorName,
        date: new Date(date),
        time,
        reason,
        diagnosis,
        prescription,
        notes,
        totalAmount,
        paidAmount,
        dueAmount
      },
    });
    res.json(visit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete a visit
export const deleteVisit = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.visit.delete({
      where: {
        id: id,
      },
    });
    res.json({ message: "Visit deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

//get visit monthly stats
export const getVisitStats = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
        const currentYear = currentDate.getFullYear();
        // i want visits this month ,total revenue , revenue collected and due amount
        const visits = await prisma.visit.findMany({
            where: {
                date: {
                    gte: new Date(currentYear, currentMonth - 1, 1),
                    lt: new Date(currentYear, currentMonth, 1),
                },
            },
        });
        const totalRevenue = visits.reduce((sum, visit) => sum + visit.totalAmount, 0);
        const revenueCollected = visits.reduce((sum, visit) => sum + visit.paidAmount, 0);
        const dueAmount = visits.reduce((sum, visit) => sum + visit.dueAmount, 0);
        res.json({
            totalVisits: visits.length,
            totalRevenue,
            revenueCollected,
            dueAmount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//get visits by patient id
export const getVisitsByPatientId = async (req, res) => {
    try {
        const { patientId } = req.params;
    const visits = await prisma.visit.findMany({
            where: {
                patientId: patientId,
             },
             orderBy: { date: "desc", time: "desc" },
             include: {
                payments: true
             }
         });
    return res.json(visits);
  } catch (error) {  res.status(500).json({ error: error.message });
    return; 
    }
}

//get recent 5 visits
export const getRecentVisits = async (req, res) => {
    try {
    const visits = await prisma.visit.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                patient: true
            }
    });

    return res.json(visits);
  } catch (error) {  res.status(500).json({ error: error.message });
    return;
  }
}


//get monthly revenue
export const getMonthlyRevenueStats = async (req, res) => {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // Months are zero-based
        const currentYear = currentDate.getFullYear();
        
        const visits = await prisma.visit.findMany({
            where: {
                date: {
                    gte: new Date(currentYear, currentMonth - 1, 1),
                    lt: new Date(currentYear, currentMonth, 1),
                },
            },
        });
        const totalRevenue = visits.reduce((sum, visit) => sum + visit.totalAmount, 0);
        const pendingRevenue = visits.reduce((sum, visit) => sum + visit.dueAmount, 0);
        
        res.json({ totalRevenue, pendingRevenue });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

  }


    

