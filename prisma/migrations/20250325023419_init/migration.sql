-- CreateTable
CREATE TABLE `account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `role` INTEGER NOT NULL DEFAULT 0,
    `credits` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `account_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(1000) NULL,
    `image` VARCHAR(500) NULL,
    `posttime` DATETIME(3) NULL,
    `user_id` INTEGER NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `status` BOOLEAN NOT NULL,
    `audience` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `credits` (
    `user_id` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `credit_use` INTEGER NOT NULL,

    PRIMARY KEY (`user_id`, `date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dasboard` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `time` DATETIME(3) NULL,
    `total_users` INTEGER NOT NULL,
    `total_posts` INTEGER NOT NULL,
    `total_credits` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
