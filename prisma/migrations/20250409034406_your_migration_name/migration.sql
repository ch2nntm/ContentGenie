/*
  Warnings:

  - You are about to drop the column `total_posts` on the `dasboard` table. All the data in the column will be lost.
  - You are about to drop the column `total_users` on the `dasboard` table. All the data in the column will be lost.
  - Added the required column `total_posts_paiding` to the `dasboard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_posts_posted` to the `dasboard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `dasboard` DROP COLUMN `total_posts`,
    DROP COLUMN `total_users`,
    ADD COLUMN `total_posts_paiding` INTEGER NOT NULL,
    ADD COLUMN `total_posts_posted` INTEGER NOT NULL;
