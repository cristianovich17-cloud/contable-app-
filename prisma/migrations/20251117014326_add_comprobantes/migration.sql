-- CreateTable
CREATE TABLE "Comprobante" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transaccionId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "tipoMIME" TEXT NOT NULL,
    "tamaño" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comprobante_transaccionId_fkey" FOREIGN KEY ("transaccionId") REFERENCES "Transaccion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Comprobante_transaccionId_idx" ON "Comprobante"("transaccionId");
