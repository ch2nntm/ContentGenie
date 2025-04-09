/*
  Warnings:

  - You are about to drop the column `time` on the `dasboard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `dasboard` DROP COLUMN `time`,
    ADD COLUMN `month` INTEGER NULL,
    ADD COLUMN `year` INTEGER NULL;
