/*
  Warnings:

  - You are about to drop the column `dueAmount` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Visit` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Visit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "doctorName" TEXT,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "reason" TEXT,
    "diagnosis" TEXT,
    "prescription" TEXT,
    "notes" TEXT,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Visit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Visit" ("createdAt", "date", "diagnosis", "doctorName", "id", "notes", "patientId", "prescription", "reason", "time", "totalAmount", "updatedAt") SELECT "createdAt", "date", "diagnosis", "doctorName", "id", "notes", "patientId", "prescription", "reason", "time", "totalAmount", "updatedAt" FROM "Visit";
DROP TABLE "Visit";
ALTER TABLE "new_Visit" RENAME TO "Visit";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
