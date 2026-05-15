import prisma from "../../db.js";

export const getAllPatients = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
        const search = (req.query.search || "").trim();
        const skip = (page - 1) * limit;

        const where = search
            ? {
                  OR: [
                      { name: { contains: search } },
                      { phone: { contains: search } },
                      { address: { contains: search } },
                      { guardian: { contains: search } },
                      { occupation: { contains: search } },
                      { medicalHistory: { contains: search } },
                  ],
              }
            : {};

        const [totalPatients, patients] = await Promise.all([
            prisma.patient.count({ where }),
            prisma.patient.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
        ]);

        res.json({
            patients,
            pagination: {
                totalPatients,
                page,
                limit,
                totalPages: Math.ceil(totalPatients / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};