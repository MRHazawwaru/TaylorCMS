-- AlterTable
ALTER TABLE `user` ADD COLUMN `isTwoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `twoFactorSecret` VARCHAR(191) NULL;
