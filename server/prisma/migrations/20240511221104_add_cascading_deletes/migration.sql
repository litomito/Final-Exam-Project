-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Booking_availabilityId_fkey`;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_availabilityId_fkey` FOREIGN KEY (`availabilityId`) REFERENCES `Availability`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
