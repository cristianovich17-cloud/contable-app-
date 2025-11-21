-- CreateTable
CREATE TABLE "Socio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CuotaConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mes" INTEGER NOT NULL,
    "año" INTEGER NOT NULL,
    "cuotaBienestar" REAL NOT NULL,
    "cuotaOrdinaria" REAL NOT NULL,
    "cuotaSocioAFUT" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Descuento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socioId" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "año" INTEGER NOT NULL,
    "monto" REAL NOT NULL,
    "concepto" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Descuento_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Credito" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socioId" INTEGER NOT NULL,
    "monto" REAL NOT NULL,
    "concepto" TEXT,
    "cuotasPagadas" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Credito_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socioId" INTEGER NOT NULL,
    "creditoId" INTEGER,
    "monto" REAL NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pago_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Pago_creditoId_fkey" FOREIGN KEY ("creditoId") REFERENCES "Credito" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recibo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socioId" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "año" INTEGER NOT NULL,
    "monto" REAL NOT NULL,
    "concepto" TEXT,
    "pdfPath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recibo_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaccion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "año" INTEGER NOT NULL,
    "monto" REAL NOT NULL,
    "concepto" TEXT,
    "referencia" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SentEmail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "socioId" INTEGER,
    "email" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "año" INTEGER NOT NULL,
    "asunto" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedOk" BOOLEAN NOT NULL DEFAULT false,
    "lastError" TEXT,
    "processedDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SentEmail_socioId_fkey" FOREIGN KEY ("socioId") REFERENCES "Socio" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Socio_numero_key" ON "Socio"("numero");

-- CreateIndex
CREATE INDEX "Socio_numero_idx" ON "Socio"("numero");

-- CreateIndex
CREATE INDEX "Socio_nombre_idx" ON "Socio"("nombre");

-- CreateIndex
CREATE INDEX "CuotaConfig_mes_año_idx" ON "CuotaConfig"("mes", "año");

-- CreateIndex
CREATE UNIQUE INDEX "CuotaConfig_mes_año_key" ON "CuotaConfig"("mes", "año");

-- CreateIndex
CREATE INDEX "Descuento_socioId_idx" ON "Descuento"("socioId");

-- CreateIndex
CREATE INDEX "Descuento_mes_año_idx" ON "Descuento"("mes", "año");

-- CreateIndex
CREATE INDEX "Descuento_socioId_mes_año_idx" ON "Descuento"("socioId", "mes", "año");

-- CreateIndex
CREATE INDEX "Credito_socioId_idx" ON "Credito"("socioId");

-- CreateIndex
CREATE INDEX "Credito_estado_idx" ON "Credito"("estado");

-- CreateIndex
CREATE INDEX "Pago_socioId_idx" ON "Pago"("socioId");

-- CreateIndex
CREATE INDEX "Pago_creditoId_idx" ON "Pago"("creditoId");

-- CreateIndex
CREATE INDEX "Recibo_socioId_idx" ON "Recibo"("socioId");

-- CreateIndex
CREATE INDEX "Recibo_mes_año_idx" ON "Recibo"("mes", "año");

-- CreateIndex
CREATE INDEX "Transaccion_tipo_idx" ON "Transaccion"("tipo");

-- CreateIndex
CREATE INDEX "Transaccion_categoria_idx" ON "Transaccion"("categoria");

-- CreateIndex
CREATE INDEX "Transaccion_mes_año_idx" ON "Transaccion"("mes", "año");

-- CreateIndex
CREATE INDEX "Transaccion_tipo_mes_año_idx" ON "Transaccion"("tipo", "mes", "año");

-- CreateIndex
CREATE INDEX "SentEmail_socioId_idx" ON "SentEmail"("socioId");

-- CreateIndex
CREATE INDEX "SentEmail_processed_idx" ON "SentEmail"("processed");

-- CreateIndex
CREATE INDEX "SentEmail_mes_año_idx" ON "SentEmail"("mes", "año");

-- CreateIndex
CREATE INDEX "SentEmail_email_idx" ON "SentEmail"("email");
