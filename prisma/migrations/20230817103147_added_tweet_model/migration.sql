/*
  Warnings:

  - You are about to drop the column `image` on the `Tweet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "image",
ADD COLUMN     "imageURL" TEXT;
