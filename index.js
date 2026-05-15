import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import patientRoutes from "./routes/patient/patient.js";

dotenv.config();


const port = process.env.PORT || 4000;
const app= express();
app.use(express.json());
app.use(cors());

//routes
app.use("/api/patients",patientRoutes);

app.get("/",(req,res)=>{
    res.send("Hello World");
});

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});








