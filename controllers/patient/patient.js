import prisma from "../../db.js";

// Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);

    const search = String(req.query.search ?? "")
      .trim()
      .replace(/^['"]+|['"]+$/g, "");

    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && {
        name: {
          contains: search,
        },
      }),
    };

    const patients = await prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        visits: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          select:{
            date:true
          }
        },
        appointments: {
          where: {
            date: {
              gte: new Date(),
            },
          },
          take: 1,
          orderBy: {
            date: "asc",
          },
          select:{
            date:true
          }
        },
        _count: {
          select: {
            visits: true,
            appointments: true,
          },
        },
      },
    });

    return res.status(200).json({
      patients,
      pagination: {
        total: patients.length,
        page,
        limit,
        totalPages: Math.ceil(patients.length / limit),
          hasNextPage: page < Math.ceil(patients.length / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to fetch patients",
      error: error.message,
    });
  }
};

//add a patient
export const addPatient = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      phone,
      address,
      guardian,
      occupation,
      medicalHistory,
    } = req.body;

    // =======================
    // VALIDATION
    // =======================

    if (!name || !phone || !gender) {
      return res.status(400).json({
        error: "Name, phone and gender are required",
      });
    }

    // =======================
    // CREATE PATIENT
    // =======================

    const patient = await prisma.patient.create({
      data: {
        name: name.trim(),
        age: age ? Number(age) : null,
        gender,
        phone: phone.trim(),
        address: address?.trim(),
        guardian: guardian?.trim(),
        occupation: occupation?.trim(),
        medicalHistory: medicalHistory?.trim(),
      },
    });

    return res.status(201).json(patient);
  } catch (error) {
    console.error("Add Patient Error:", error);

    return res.status(500).json({
      error: "Failed to create patient",
    });
  }
};

//get a patient by id
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id },
    });
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update a patient
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      gender,
      phone,
      address,
      guardian,
      occupation,
      medicalHistory,
    } = req.body;
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name,
        age,
        gender,
        phone,
        address,
        guardian,
        occupation,
        medicalHistory,
      },
    });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//delete a patient
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return res.status(404).json({
        error: "Patient not found",
      });
    }

    await prisma.patient.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      message: "Patient deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

//total patients count
export const totalPatientsCount = async (req, res) => {
  try {
    const count = await prisma.patient.count();
    res.json({ totalPatients: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//total patients this month count
export const totalPatientsThisMonthCount = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const count = await prisma.patient.count({
      where: {
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    });
    res.json({ totalPatientsThisMonth: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
