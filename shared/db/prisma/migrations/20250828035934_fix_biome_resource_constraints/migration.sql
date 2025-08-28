/*
  Warnings:

  - A unique constraint covering the columns `[biomeTemplateId,resourceId]` on the table `BiomeTemplateResourceRange` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."BiomeTemplateResourceRange_biomeTemplateId_key";

-- DropIndex
DROP INDEX "public"."BiomeTemplateResourceRange_resourceId_key";

-- CreateIndex
CREATE UNIQUE INDEX "BiomeTemplateResourceRange_biomeTemplateId_resourceId_key" ON "public"."BiomeTemplateResourceRange"("biomeTemplateId", "resourceId");
