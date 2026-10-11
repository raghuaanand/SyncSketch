-- CreateEnum
CREATE TYPE "BoardKind" AS ENUM ('SKETCH', 'WHITEBOARD');

-- AlterTable
ALTER TABLE "board" ADD COLUMN     "kind" "BoardKind" NOT NULL DEFAULT 'SKETCH';
