/*
  Warnings:

  - A unique constraint covering the columns `[gameInstanceId]` on the table `Nation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameInstanceId` to the `Nation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Nation" ADD COLUMN     "gameInstanceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."NationResourceAmount" (
    "nationId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "NationResourceAmount_pkey" PRIMARY KEY ("nationId","resourceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Nation_gameInstanceId_key" ON "public"."Nation"("gameInstanceId");

-- AddForeignKey
ALTER TABLE "public"."Nation" ADD CONSTRAINT "Nation_gameInstanceId_fkey" FOREIGN KEY ("gameInstanceId") REFERENCES "public"."GameInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NationResourceAmount" ADD CONSTRAINT "NationResourceAmount_nationId_fkey" FOREIGN KEY ("nationId") REFERENCES "public"."Nation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NationResourceAmount" ADD CONSTRAINT "NationResourceAmount_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."NaturalResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
