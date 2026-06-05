import prisma from "../../db.js";

//add a payment
export const addPayment = async (req, res) => {
  try {
    const { visitId, amount, method,  notes } = req.body;

    if (visitId) {
      const visit = await prisma.visit.findUnique({
        where: { id: visitId },
      });

      if (!visit) {
        return res.status(404).json({ error: "Visit not found." });
      }
    

      const newTotalPaid = visit.paidAmount + amount;
      if (newTotalPaid > visit.totalAmount) {
        return res.status(400).json({ error: "Payment exceeds total amount due." });
      }

      const newPayment = {
        visitId,
        amount,
        method,
        notes
      };

      const payment = await prisma.payment.create({
        data: newPayment,
      });
      const dueAmount = visit.totalAmount - newTotalPaid;

      //await payment status
      let status = "UNPAID";
      if(dueAmount === 0){
        status = "PAID";
      }
      else if(dueAmount > 0 && visit.paidAmount > 0){
        status = "PARTIAL";
      }
      else if(visit.totalAmount == newTotalPaid){
        status = "UNPAID";
      }
      await prisma.visit.update({
        where: { id: visitId },
        data: {
          paidAmount: visit.paidAmount + amount,
          dueAmount: visit.totalAmount - newTotalPaid,
          paymentStatus: status
        }
      });
    
      return res.status(201).json(payment);
    } else {
      return res.status(400).json({ error: "Visit ID is required." });
    }
  } catch (error) {
    console.error("Add Payment Error:", error);
    return res.status(500).json({
      error: "Failed to create payment",
    });
  }
}

//get a payment by id
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await prisma.payment.findUnique({
      where: {
        id: id,
      },
    });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//update a payment
export const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method, date, notes } = req.body;
    const payment = await prisma.payment.update({
      where: {
        id: id,
      },
      data: {
        amount,
        method,
        date: new Date(date),
        notes
      },
    });
    res.json(payment);
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ error: "An error occurred while updating the payment." });
  }
}

//delete a payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.payment.delete({
      where: {
        id: id,
      },
    });
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ error: "An error occurred while deleting the payment." });
  }
}

//get payments for a visit
export const getPaymentsByVisitId = async (req, res) => {
  try {
    const { visitId } = req.params;
    const payments = await prisma.payment.findMany({
      where: {
        visitId: visitId,
      },
    });
    res.json({payments ,count : payments.length});
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "An error occurred while fetching payments." });
  }
}

//get payment dues for a patient
export const getPaymentDuesByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;
    const visits = await prisma.visit.findMany({
      where: {
        patientId: patientId,
      },
      include: {
        payments: true,
      },
    });

    const dues = visits.map((visit) => {
        const totalPaid = visit.payments.reduce((sum, payment) => sum + payment.amount, 0);
        const dueAmount = visit.totalAmount - totalPaid;
        return {
            visitId: visit.id,
            date: visit.date,
            totalAmount: visit.totalAmount,
            paidAmount: totalPaid,
            dueAmount
        }
    }).filter(visit => visit.dueAmount > 0);

    res.json(dues);
  } catch (error) {
    console.error("Error fetching payment dues:", error);
    res.status(500).json({ error: "An error occurred while fetching payment dues." });
  }
}