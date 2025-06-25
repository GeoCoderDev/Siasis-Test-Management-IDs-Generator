-- CreateTable
CREATE TABLE "T_Contadores" (
    "Id_Contador" SERIAL NOT NULL,
    "Nombre_Contador" VARCHAR(60) NOT NULL,
    "Contador" INTEGER NOT NULL,

    CONSTRAINT "T_Contadores_pkey" PRIMARY KEY ("Id_Contador")
);
