-- CreateTable
CREATE TABLE "public"."Territory" (
    "id" TEXT NOT NULL,
    "q" INTEGER NOT NULL,
    "r" INTEGER NOT NULL,
    "gameInstanceId" TEXT NOT NULL,
    "biomeId" TEXT NOT NULL,
    "claimed" BOOLEAN NOT NULL,
    "claimantId" TEXT NOT NULL,
    "maxBC" INTEGER NOT NULL,
    "currentBC" INTEGER NOT NULL,

    CONSTRAINT "Territory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TerritoryResourceAmount" (
    "id" SERIAL NOT NULL,
    "territoryId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "TerritoryResourceAmount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Territory_q_r_gameInstanceId_key" ON "public"."Territory"("q", "r", "gameInstanceId");

-- CreateIndex
CREATE UNIQUE INDEX "TerritoryResourceAmount_territoryId_resourceId_key" ON "public"."TerritoryResourceAmount"("territoryId", "resourceId");

-- AddForeignKey
ALTER TABLE "public"."Territory" ADD CONSTRAINT "Territory_gameInstanceId_fkey" FOREIGN KEY ("gameInstanceId") REFERENCES "public"."GameInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Territory" ADD CONSTRAINT "Territory_biomeId_fkey" FOREIGN KEY ("biomeId") REFERENCES "public"."Biome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Territory" ADD CONSTRAINT "Territory_claimantId_fkey" FOREIGN KEY ("claimantId") REFERENCES "public"."Nation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TerritoryResourceAmount" ADD CONSTRAINT "TerritoryResourceAmount_territoryId_fkey" FOREIGN KEY ("territoryId") REFERENCES "public"."Territory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TerritoryResourceAmount" ADD CONSTRAINT "TerritoryResourceAmount_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "public"."NaturalResource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
