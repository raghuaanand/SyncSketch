/*
  Warnings:

  - You are about to drop the column `accountId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `providerId` on the `Account` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" DROP COLUMN "accountId",
DROP COLUMN "password",
DROP COLUMN "providerId";
