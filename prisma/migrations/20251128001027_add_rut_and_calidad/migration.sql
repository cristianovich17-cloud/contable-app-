/*
  Warnings:

  - Added the required column `rut` to the `Socio` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Socio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "rut" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "calidadJuridica" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Socio" ("createdAt", "email", "estado", "id", "nombre", "numero", "telefono", "updatedAt") SELECT "createdAt", "email", "estado", "id", "nombre", "numero", "telefono", "updatedAt" FROM "Socio";
DROP TABLE "Socio";
ALTER TABLE "new_Socio" RENAME TO "Socio";
CREATE UNIQUE INDEX "Socio_numero_key" ON "Socio"("numero");
CREATE UNIQUE INDEX "Socio_rut_key" ON "Socio"("rut");
CREATE INDEX "Socio_numero_idx" ON "Socio"("numero");
CREATE INDEX "Socio_nombre_idx" ON "Socio"("nombre");
CREATE INDEX "Socio_rut_idx" ON "Socio"("rut");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
