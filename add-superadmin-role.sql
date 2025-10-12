-- Add superadmin role to ENUM and update 09198718211 to superadmin
-- This script adds the superadmin role to the user table

-- First, add superadmin to the ENUM
ALTER TABLE `user` MODIFY COLUMN `role` ENUM('superadmin', 'admin', 'teacher', 'student', 'parent') DEFAULT 'student';

-- Update the special phone number to superadmin role
UPDATE `user` SET `role` = 'superadmin' WHERE `phone` = '09198718211';

-- Optional: Update any existing admin users to superadmin if needed
-- UPDATE `user` SET `role` = 'superadmin' WHERE `phone` = '0910604709';
