import  ExcelJS  from "exceljs"
import { startOfMonth, endOfMonth, format } from "date-fns"
import prisma from "../../db.js";


function getMonthRange(req) {
  const month = parseInt(req.query.month, 10); // 1-12
  const year = parseInt(req.query.year, 10);
 
  if (!month || !year || month < 1 || month > 12) {
    throw new Error("Invalid or missing month/year query params");
  }
 
  // JS Date months are 0-indexed, so subtract 1
  const refDate = new Date(year, month - 1, 1);
  return {
    start: startOfMonth(refDate),
    end: endOfMonth(refDate),
    label: format(refDate, "MMMM yyyy"),
  };
}
 
// Shared styling so both reports look consistent when printed/opened in Excel
function styleHeaderRow(row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F2937" },
  };
  row.alignment = { vertical: "middle", horizontal: "left" };
  row.height = 20;
}
 
function addTitleBlock(sheet, title, monthLabel, colSpan) {
  sheet.mergeCells(1, 1, 1, colSpan);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `Mehreen Dental Clinic — ${title}`;
  titleCell.font = { bold: true, size: 14 };
 
  sheet.mergeCells(2, 1, 2, colSpan);
  const subCell = sheet.getCell(2, 1);
  subCell.value = `Period: ${monthLabel}   |   Generated on: ${format(new Date(), "d MMM yyyy, h:mm a")}`;
  subCell.font = { italic: true, size: 10, color: { argb: "FF6B7280" } };
 
  sheet.addRow([]); // spacer row
}
 
// ---------------------------------------------------------------------------
// 1. Monthly Visits Report
//    GET /api/reports/visits?month=6&year=2026
// ---------------------------------------------------------------------------
export const getMonthlyVisitsReport = async (req, res) => {
  try {
    const { start, end, label } = getMonthRange(req);
 
    const visits = await prisma.visit.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      include: {
        patient: { select: { name: true, phone: true } },
      },
      orderBy: { date: "asc" },
    });
 
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Visits");
 
    const columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Patient", key: "patient", width: 24 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Visit reason", key: "reason", width: 28 },
      { header: "Notes", key: "notes", width: 30 },
      { header: "Status", key: "status", width: 14 },
    ];
 
    addTitleBlock(sheet, "Monthly Visits Report", label, columns.length);
    sheet.columns = columns;
 
    const headerRow = sheet.addRow(columns.map((c) => c.header));
    styleHeaderRow(headerRow);
 
    visits.forEach((v) => {
      sheet.addRow({
        date: format(v.date, "d MMM yyyy"),
        patient: v.patient?.name ?? "—",
        phone: v.patient?.phone ?? "—",
        reason: v.reason ?? "—",
        notes: v.notes ?? "",
        status: v.status ?? "—",
      });
    });
 
    sheet.addRow([]);
    const totalsRow = sheet.addRow(["Total visits", visits.length]);
    totalsRow.font = { bold: true };
 
    sheet.getColumn("date").alignment = { vertical: "middle" };
 
    const filename = `Visits_Report_${label.replace(" ", "_")}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
 
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Visits report error:", err);
    res.status(400).json({ error: err.message ?? "Failed to generate report" });
  }
}
 
// ---------------------------------------------------------------------------
// 2. Monthly Payments Report
//    GET /api/reports/payments?month=6&year=2026
// ---------------------------------------------------------------------------
export const getMonthlyPaymentsReport = async (req, res) => {
  try {
    const { start, end, label } = getMonthRange(req);
 
    // Payments are linked to a Visit, which is linked to a Patient.
    // Adjust field names below to match your actual Prisma schema.
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      include: {
        visit: {
          select: {
            reason: true,
            totalAmount: true,
            patient: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
 
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Payments");
 
    const columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Patient", key: "patient", width: 24 },
      { header: "Visit reason", key: "reason", width: 28 },
      { header: "Amount charged", key: "charged", width: 16 },
      { header: "Amount paid", key: "paid", width: 14 },
      { header: "Due", key: "due", width: 12 },
      { header: "Payment method", key: "method", width: 16 },
    ];
 
    addTitleBlock(sheet, "Monthly Payments Report", label, columns.length);
    sheet.columns = columns;
 
    const headerRow = sheet.addRow(columns.map((c) => c.header));
    styleHeaderRow(headerRow);
 
    let totalCharged = 0;
    let totalPaid = 0;
 
    payments.forEach((p) => {
      const charged = p.visit?.totalAmount ?? 0;
      const paid = p.amount ?? 0;
      const due = Math.max(charged - paid, 0);
 
      totalCharged += charged;
      totalPaid += paid;
 
      sheet.addRow({
        date: format(p.createdAt, "d MMM yyyy"),
        patient: p.visit?.patient?.name ?? "—",
        reason: p.visit?.reason ?? "—",
        charged,
        paid,
        due,
        method: p.method ?? "—",
      });
    });
 
    sheet.addRow([]);
    const totalsRow = sheet.addRow({
      date: "Totals",
      charged: totalCharged,
      paid: totalPaid,
      due: Math.max(totalCharged - totalPaid, 0),
    });
    totalsRow.font = { bold: true };
 
    sheet.getColumn("charged").numFmt = "#,##0";
    sheet.getColumn("paid").numFmt = "#,##0";
    sheet.getColumn("due").numFmt = "#,##0";
 
    const filename = `Payments_Report_${label.replace(" ", "_")}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
 
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Payments report error:", err);
    res.status(400).json({ error: err.message ?? "Failed to generate report" });
  }
}
 
// ---------------------------------------------------------------------------
// 3. Patients Report — full roster with lifetime stats (not month-scoped)
//    GET /api/reports/patients?activeSinceMonths=6   (optional filter)
// ---------------------------------------------------------------------------
export const getPatientsReport = async (req, res) => {
  try {
    const activeSinceMonths = parseInt(req.query.activeSinceMonths, 10) || null;
 
    const patients = await prisma.patient.findMany({
      include: {
        visits: {
          orderBy: { date: "desc" },
          include: {
            payments: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
 
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Patients");
 
    const columns = [
      { header: "Patient", key: "patient", width: 24 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Registered on", key: "registered", width: 14 },
      { header: "Total visits", key: "visitCount", width: 12 },
      { header: "Last visit", key: "lastVisit", width: 14 },
      { header: "Total billed", key: "billed", width: 14 },
      { header: "Total paid", key: "paid", width: 14 },
      { header: "Due", key: "due", width: 12 },
      { header: "Status", key: "status", width: 12 },
    ];
 
    const label = activeSinceMonths
      ? `Active in last ${activeSinceMonths} months`
      : "All patients";
 
    addTitleBlock(sheet, "Patients Report", label, columns.length);
    sheet.columns = columns;
 
    const headerRow = sheet.addRow(columns.map((c) => c.header));
    styleHeaderRow(headerRow);
 
    const now = new Date();
    const inactivityCutoff = new Date(now);
    inactivityCutoff.setMonth(inactivityCutoff.getMonth() - 6); // 6 months = inactive
 
    const activeSinceCutoff = activeSinceMonths
      ? new Date(now.setMonth(now.getMonth() - activeSinceMonths))
      : null;
 
    let totalBilled = 0;
    let totalPaid = 0;
    let rowsWritten = 0;
 
    patients.forEach((p) => {
      const visitCount = p.visits.length;
      const lastVisit = p.visits[0]?.date ?? null;
 
      if (activeSinceCutoff && (!lastVisit || lastVisit < activeSinceCutoff)) {
        return; // skip patients outside the requested activity window
      }
 
      const billed = p.visits.reduce((sum, v) => sum + (v.totalAmount ?? 0), 0);
      const paid = p.visits.reduce(
        (sum, v) => sum + v.payments.reduce((pSum, pay) => pSum + (pay.amount ?? 0), 0),
        0
      );
      const due = Math.max(billed - paid, 0);
      const status = lastVisit && lastVisit >= inactivityCutoff ? "Active" : "Inactive";
 
      totalBilled += billed;
      totalPaid += paid;
      rowsWritten += 1;
 
      sheet.addRow({
        patient: p.name,
        phone: p.phone ?? "—",
        registered: format(p.createdAt, "d MMM yyyy"),
        visitCount,
        lastVisit: lastVisit ? format(lastVisit, "d MMM yyyy") : "—",
        billed,
        paid,
        due,
        status,
      });
    });
 
    sheet.addRow([]);
    const totalsRow = sheet.addRow({
      patient: `Total patients: ${rowsWritten}`,
      billed: totalBilled,
      paid: totalPaid,
      due: Math.max(totalBilled - totalPaid, 0),
    });
    totalsRow.font = { bold: true };
 
    sheet.getColumn("billed").numFmt = "#,##0";
    sheet.getColumn("paid").numFmt = "#,##0";
    sheet.getColumn("due").numFmt = "#,##0";
 
    const filename = `Patients_Report_${format(new Date(), "d_MMM_yyyy")}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
 
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Patients report error:", err);
    res.status(400).json({ error: err.message ?? "Failed to generate report" });
  }
}


export const getMonthlyAppointmentsReport = async (req, res) => {
  try {
    const { start, end, label } = getMonthRange(req);
 
    // Adjust field/relation names below to match your actual Prisma schema.
    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      include: {
        patient: { select: { name: true, phone: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
 
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Appointments");
 
    const columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Time", key: "time", width: 10 },
      { header: "Patient", key: "patient", width: 24 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Type / reason", key: "reason", width: 28 },
      { header: "Status", key: "status", width: 14 },
    ];
 
    addTitleBlock(sheet, "Monthly Appointments Report", label, columns.length);
    sheet.columns = columns;
 
    const headerRow = sheet.addRow(columns.map((c) => c.header));
    styleHeaderRow(headerRow);
 
    const statusCounts = {};
 
    appointments.forEach((a) => {
      statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1;
 
      sheet.addRow({
        date: format(a.date, "d MMM yyyy"),
        time: a.time ?? "—",
        patient: a.patient?.name ?? "—",
        phone: a.patient?.phone ?? "—",
        reason: a.reason ?? "—",
        status: a.status ?? "—",
      });
    });
 
    sheet.addRow([]);
    const totalsRow = sheet.addRow(["Total appointments", appointments.length]);
    totalsRow.font = { bold: true };
 
    Object.entries(statusCounts).forEach(([status, count]) => {
      sheet.addRow([status, count]);
    });
 
    const filename = `Appointments_Report_${label.replace(" ", "_")}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
 
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Appointments report error:", err);
    res.status(400).json({ error: err.message ?? "Failed to generate report" });
  }
}

