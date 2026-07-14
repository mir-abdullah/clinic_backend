import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import patientRoutes from "./routes/patient/patient.js";
import appointmentRoutes from "./routes/appointments/appointment.js"
import visitRoutes from "./routes/visits/visit.js"
import paymentRoutes from "./routes/payment/payment.js"
import reportsRoutes from "./routes/reports/reports.js"

dotenv.config();


const port = process.env.PORT || 5000;
const app= express();
app.use(express.json());
app.use(cors([])); // Enable CORS for all routes

//routes
app.use("/api/patients",patientRoutes);
app.use("/api/appointments",appointmentRoutes);
app.use("/api/visits",visitRoutes);
app.use("/api/payments",paymentRoutes);
app.use("/api/reports",reportsRoutes);

app.get("/",(req,res)=>{
    res.send("Hello World");
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});








