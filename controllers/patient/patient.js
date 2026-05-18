import prisma from "../../db.js";


//get all patients
export const getAllPatients = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
        const search = String(req.query.search ?? "")
            .trim()
            .replace(/^['"]+|['"]+$/g, "");
        const skip = (page - 1) * limit;

        let totalPatients;
        let patients;

        if (search) {
            const where = {
                name: {
                    contains: search,
                },
            };

            const [count, list] = await Promise.all([
                prisma.patient.count({ where }),
                prisma.patient.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
            ]);

            totalPatients = count;
            patients = list;
        } else {
            const [count, list] = await Promise.all([
                prisma.patient.count(),
                prisma.patient.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
            ]);

            totalPatients = count;
            patients = list;
        }

        if (totalPatients === 0) {
            return res.json({
                patients: [],
                pagination: {
                    totalPatients: 0,
                    page,
                    limit,
                    totalPages: 0,
                },
            });
        }

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

//add a patient

export const addPatient= async(req,res)=>{
    try{
        const {name,age,gender,phone,address,guardian,occupation,medicalHistory}= req.body;
        const patient = await prisma.patient.create({
            data: {
                name,
                age,
                gender,
                phone,
                address,
                guardian,
                occupation,
                medicalHistory
            }
        });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


//get a patient by id

export const getPatientById= async(req,res)=>{
    try {
        const {id} = req.params;
        const patient = await prisma.patient.findUnique({
            where: {
                id: parseInt(id,10)
            }
        });
        if(!patient){
            return res.status(404).json({error:"Patient not found"});
        }
        res.json(patient);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

//update a patient

export const updatePatient= async(req,res)=>{
    try{
        const {id} = req.params;
        const {name,age,gender,phone,address,guardian,occupation,medicalHistory}= req.body;
        const patient = await prisma.patient.update({
            where: {
                id: parseInt(id,10)
            },
            data: {
                name,
                age,
                gender,
                phone,
                address,
                guardian,
                occupation,
                medicalHistory
            }
        });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//delete a patient

export const deletePatient= async(req,res)=>{
    try{
        const {id} = req.params;
        await prisma.patient.delete({
            where: {
                id: parseInt(id,10)
            }
        });
        res.json({message:"Patient deleted successfully"});
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}

//total patients count
export const totalPatientsCount = async(req,res)=>{
    try{
        const count = await prisma.patient.count();
        res.json({totalPatients: count});
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}


//total patients this month count
export const totalPatientsThisMonthCount = async(req,res)=>{
    try{
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const endOfMonth = new Date(startOfMonth);
        endOfMonth.setMonth(endOfMonth.getMonth() + 1);


        
        const count = await prisma.patient.count({
            where: {
                createdAt: {
                    gte: startOfMonth,
                    lt: endOfMonth
                }
            }
        });
        res.json({totalPatientsThisMonth: count});
    }
    catch(error){
        res.status(500).json({ error: error.message });
    }
}





