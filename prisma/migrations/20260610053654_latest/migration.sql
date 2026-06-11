-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "gender" TEXT NOT NULL,
    "guardian" TEXT,
    "occupation" TEXT,
    "medicalHistory" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Patient" ("address", "age", "createdAt", "gender", "guardian", "id", "medicalHistory", "name", "occupation", "phone", "updatedAt") SELECT "address", "age", "createdAt", "gender", "guardian", "id", "medicalHistory", "name", "occupation", "phone", "updatedAt" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
