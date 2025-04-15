-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `post_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `credits` ADD CONSTRAINT `credits_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
