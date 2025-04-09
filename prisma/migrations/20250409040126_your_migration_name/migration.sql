/*
  Warnings:

  - You are about to drop the `dasboard` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `dasboard`;

-- CreateTable
CREATE TABLE `dashboard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NULL,
    `month` INTEGER NULL,
    `total_posts_paiding` INTEGER NOT NULL,
    `total_posts_posted` INTEGER NOT NULL,
    `total_credits` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
