/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nationId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_nationId_key";

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "nationId",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "public"."Nation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Nation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NaturalResource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "NaturalResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Biome" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Biome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BiomeTemplateResourceRange" (
    "id" TEXT NOT NULL,
    "biomeTemplateId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "maxAmount" INTEGER NOT NULL,
    "minAmount" INTEGER NOT NULL,

    CONSTRAINT "BiomeTemplateResourceRange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BiomeTemplate" (
    "id" TEXT NOT NULL,
    "biomeId" TEXT NOT NULL,
    "maxBPRange" INTEGER NOT NULL,
    "minBPRange" INTEGER NOT NULL,
    "npcOwnershipRate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BiomeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nation_name_key" ON "public"."Nation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Nation_code_key" ON "public"."Nation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Nation_ownerId_key" ON "public"."Nation"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "NaturalResource_name_key" ON "public"."NaturalResource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Biome_name_key" ON "public"."Biome"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BiomeTemplateResourceRange_biomeTemplateId_key" ON "public"."BiomeTemplateResourceRange"("biomeTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomeTemplateResourceRange_resourceId_key" ON "public"."BiomeTemplateResourceRange"("resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "BiomeTemplate_biomeId_key" ON "public"."BiomeTemplate"("biomeId");

-- AddForeignKey
ALTER TABLE "public"."Nation" ADD CONSTRAINT "Nation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BiomeTemplateResourceRange" ADD CONSTRAINT "BiomeTemplateResourceRange_biomeTemplateId_fkey" FOREIGN KEY ("biomeTemplateId") REFERENCES "public"."BiomeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BiomeTemplateResourceRange" ADD CONSTRAINT "BiomeTemplateResourceRange_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."NaturalResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BiomeTemplate" ADD CONSTRAINT "BiomeTemplate_biomeId_fkey" FOREIGN KEY ("biomeId") REFERENCES "public"."Biome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
