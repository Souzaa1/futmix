/*
  Warnings:

  - A unique constraint covering the columns `[inviteToken]` on the table `player_stats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."player_stats" DROP CONSTRAINT "player_stats_userId_fkey";

-- AlterTable
ALTER TABLE "public"."player_stats" ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "invitedPlayerEmail" TEXT,
ADD COLUMN     "invitedPlayerName" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isInvited" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."invites" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "peladaId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invites_token_key" ON "public"."invites"("token");

-- CreateIndex
CREATE UNIQUE INDEX "player_stats_inviteToken_key" ON "public"."player_stats"("inviteToken");

-- AddForeignKey
ALTER TABLE "public"."player_stats" ADD CONSTRAINT "player_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_peladaId_fkey" FOREIGN KEY ("peladaId") REFERENCES "public"."pelada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
