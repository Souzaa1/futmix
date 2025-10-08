-- CreateEnum
CREATE TYPE "public"."DrawMethod" AS ENUM ('MANUAL', 'AUTO_RANDOM', 'AUTO_BALANCED');

-- CreateEnum
CREATE TYPE "public"."Position" AS ENUM ('GOLEIRO', 'ZAGUEIRO', 'MEIO', 'ATACANTE');

-- CreateTable
CREATE TABLE "public"."draw" (
    "id" TEXT NOT NULL,
    "peladaId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "method" "public"."DrawMethod" NOT NULL DEFAULT 'AUTO_BALANCED',
    "numberOfTeams" INTEGER NOT NULL,
    "playersPerTeam" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team" (
    "id" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_player" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "playerStatsId" TEXT NOT NULL,
    "position" "public"."Position",

    CONSTRAINT "team_player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_player_teamId_playerStatsId_key" ON "public"."team_player"("teamId", "playerStatsId");

-- AddForeignKey
ALTER TABLE "public"."draw" ADD CONSTRAINT "draw_peladaId_fkey" FOREIGN KEY ("peladaId") REFERENCES "public"."pelada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."draw" ADD CONSTRAINT "draw_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team" ADD CONSTRAINT "team_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "public"."draw"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_player" ADD CONSTRAINT "team_player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_player" ADD CONSTRAINT "team_player_playerStatsId_fkey" FOREIGN KEY ("playerStatsId") REFERENCES "public"."player_stats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
