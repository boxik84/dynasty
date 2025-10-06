-- Photo Contests Table
CREATE TABLE IF NOT EXISTS `photo_contests` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `start_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `end_date` TIMESTAMP NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'open',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Photo Submissions Table
CREATE TABLE IF NOT EXISTS `photo_submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `contest_id` INT NOT NULL,
    `user_id` VARCHAR(255) NOT NULL,
    `image_url` VARCHAR(2048) NOT NULL,
    `caption` TEXT,
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `contest_id_idx` (`contest_id`),
    INDEX `user_id_idx` (`user_id`),
    CONSTRAINT `fk_submissions_contest` FOREIGN KEY (`contest_id`) REFERENCES `photo_contests` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_submissions_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Photo Likes Table
CREATE TABLE IF NOT EXISTS `photo_likes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `submission_id` INT NOT NULL,
    `user_id` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `submission_id_idx` (`submission_id`),
    INDEX `user_id_idx_likes` (`user_id`),
    CONSTRAINT `fk_likes_submission` FOREIGN KEY (`submission_id`) REFERENCES `photo_submissions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_like` (`submission_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 