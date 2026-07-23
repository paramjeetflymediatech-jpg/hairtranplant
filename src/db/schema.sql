-- ============================================================
-- GraftDesk Database Schema
-- MySQL 5.7+ / MySQL 8.0+
-- Generated from Sequelize models
--
-- Usage:
--   mysql -u root -p graftdesk_db < schema.sql
--
-- Or paste directly in phpMyAdmin / MySQL Workbench / DBeaver
-- ============================================================

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `graftdesk_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `graftdesk_db`;

-- ============================================================
-- TABLE: clinics
-- (No foreign keys — must be created first)
-- ============================================================
CREATE TABLE IF NOT EXISTS `clinics` (
  `id`                 VARCHAR(36)  NOT NULL,
  `name`               VARCHAR(255) NOT NULL,
  `slug`               VARCHAR(255) NOT NULL,
  `email`              VARCHAR(255) NOT NULL,
  `phone`              VARCHAR(255) DEFAULT NULL,
  `logo`               TEXT         DEFAULT NULL,
  `backgroundImage`    TEXT         DEFAULT NULL,
  `themeColor`         VARCHAR(255) DEFAULT NULL,
  `address`            VARCHAR(255) DEFAULT NULL,
  `city`               VARCHAR(255) DEFAULT NULL,
  `state`              VARCHAR(255) DEFAULT NULL,
  `country`            VARCHAR(255) DEFAULT NULL,
  `timezone`           VARCHAR(255) DEFAULT 'UTC',
  `subscriptionPlan`   ENUM('STARTER','PROFESSIONAL','ENTERPRISE') DEFAULT 'PROFESSIONAL',
  `subscriptionStatus` ENUM('ACTIVE','TRIAL','PAST_DUE','CANCELLED') DEFAULT 'ACTIVE',
  `createdAt`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clinics_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`          VARCHAR(36)  NOT NULL,
  `clinicId`    VARCHAR(36)  DEFAULT NULL,
  `name`        VARCHAR(255) NOT NULL,
  `email`       VARCHAR(255) NOT NULL,
  `password`    VARCHAR(255) NOT NULL,
  `role`        ENUM('SUPER_ADMIN','CLINIC_ADMIN','DOCTOR','CONSULTANT','RECEPTIONIST','PATIENT') NOT NULL DEFAULT 'PATIENT',
  `avatar`      TEXT         DEFAULT NULL,
  `phone`       VARCHAR(255) DEFAULT NULL,
  `isActive`    TINYINT(1)   NOT NULL DEFAULT 1,
  `lastLoginAt` DATETIME     DEFAULT NULL,
  `createdAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_clinicId_fk` (`clinicId`),
  CONSTRAINT `users_clinicId_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: patients
-- ============================================================
CREATE TABLE IF NOT EXISTS `patients` (
  `id`            VARCHAR(36)  NOT NULL,
  `clinicId`      VARCHAR(36)  NOT NULL,
  `name`          VARCHAR(255) NOT NULL,
  `email`         VARCHAR(255) DEFAULT NULL,
  `phone`         VARCHAR(255) DEFAULT NULL,
  `dateOfBirth`   VARCHAR(255) DEFAULT NULL,
  `gender`        VARCHAR(255) DEFAULT NULL,
  `profilePhoto`  TEXT         DEFAULT NULL,
  `hairLossStage` VARCHAR(255) DEFAULT NULL,
  `source`        VARCHAR(255) DEFAULT NULL,
  `status`        ENUM('LEAD','CONSULTATION','SCHEDULED','POST_OP','COMPLETED','INACTIVE') DEFAULT 'CONSULTATION',
  `notes`         TEXT         DEFAULT NULL,
  `createdAt`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patients_clinicId_fk` (`clinicId`),
  CONSTRAINT `patients_clinicId_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: leads
-- ============================================================
CREATE TABLE IF NOT EXISTS `leads` (
  `id`             VARCHAR(36)   NOT NULL,
  `clinicId`       VARCHAR(36)   NOT NULL,
  `name`           VARCHAR(255)  NOT NULL,
  `email`          VARCHAR(255)  DEFAULT NULL,
  `phone`          VARCHAR(255)  DEFAULT NULL,
  `source`         VARCHAR(255)  DEFAULT NULL,
  `status`         ENUM('NEW','CONTACTED','CONSULTATION_BOOKED','CONSULTATION_COMPLETED','TREATMENT_RECOMMENDED','SURGERY_BOOKED','CONVERTED','LOST') DEFAULT 'NEW',
  `assignedTo`     VARCHAR(36)   DEFAULT NULL,
  `estimatedValue` DECIMAL(10,2) DEFAULT 0.00,
  `notes`          TEXT          DEFAULT NULL,
  `createdAt`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `leads_clinicId_fk` (`clinicId`),
  CONSTRAINT `leads_clinicId_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS `appointments` (
  `id`              VARCHAR(36)  NOT NULL,
  `clinicId`        VARCHAR(36)  NOT NULL,
  `patientId`       VARCHAR(36)  NOT NULL,
  `doctorId`        VARCHAR(36)  DEFAULT NULL,
  `appointmentDate` VARCHAR(255) NOT NULL,
  `startTime`       VARCHAR(255) NOT NULL,
  `endTime`         VARCHAR(255) NOT NULL,
  `type`            ENUM('CONSULTATION','FOLLOW_UP','SURGERY','REVIEW') DEFAULT 'CONSULTATION',
  `status`          ENUM('SCHEDULED','CONFIRMED','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW') DEFAULT 'SCHEDULED',
  `notes`           TEXT         DEFAULT NULL,
  `createdAt`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointments_clinicId_fk` (`clinicId`),
  KEY `appointments_patientId_fk` (`patientId`),
  KEY `appointments_doctorId_fk` (`doctorId`),
  CONSTRAINT `appointments_clinicId_fk`  FOREIGN KEY (`clinicId`)  REFERENCES `clinics`   (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `appointments_patientId_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`  (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `appointments_doctorId_fk`  FOREIGN KEY (`doctorId`)  REFERENCES `users`     (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: consultations
-- ============================================================
CREATE TABLE IF NOT EXISTS `consultations` (
  `id`                   VARCHAR(36)  NOT NULL,
  `clinicId`             VARCHAR(36)  NOT NULL,
  `patientId`            VARCHAR(36)  NOT NULL,
  `doctorId`             VARCHAR(36)  DEFAULT NULL,
  `consultationDate`     VARCHAR(255) NOT NULL,
  `hairLossStage`        VARCHAR(255) DEFAULT NULL,
  `diagnosisNotes`       TEXT         DEFAULT NULL,
  `recommendations`      TEXT         DEFAULT NULL,
  `estimatedGrafts`      INT          DEFAULT NULL,
  `recommendedProcedure` ENUM('FUE','FUT','DHI','COMBINATION') DEFAULT NULL,
  `notes`                TEXT         DEFAULT NULL,
  `createdAt`            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `consultations_clinicId_fk` (`clinicId`),
  KEY `consultations_patientId_fk` (`patientId`),
  KEY `consultations_doctorId_fk` (`doctorId`),
  CONSTRAINT `consultations_clinicId_fk`  FOREIGN KEY (`clinicId`)  REFERENCES `clinics`  (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `consultations_patientId_fk` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `consultations_doctorId_fk`  FOREIGN KEY (`doctorId`)  REFERENCES `users`    (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: hair_analyses
-- ============================================================
CREATE TABLE IF NOT EXISTS `hair_analyses` (
  `id`                  VARCHAR(36)  NOT NULL,
  `clinicId`            VARCHAR(36)  NOT NULL,
  `patientId`           VARCHAR(36)  NOT NULL,
  `frontPhoto`          TEXT         DEFAULT NULL,
  `topPhoto`            TEXT         DEFAULT NULL,
  `leftPhoto`           TEXT         DEFAULT NULL,
  `rightPhoto`          TEXT         DEFAULT NULL,
  `backPhoto`           TEXT         DEFAULT NULL,
  `hairLossStage`       VARCHAR(255) DEFAULT NULL,
  `hairDensity`         VARCHAR(255) DEFAULT NULL,
  `donorAreaQuality`    VARCHAR(255) DEFAULT NULL,
  `estimatedMinGrafts`  INT          DEFAULT NULL,
  `estimatedMaxGrafts`  INT          DEFAULT NULL,
  `aiAnalysis`          TEXT         DEFAULT NULL,
  `doctorVerified`      TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `hair_analyses_clinicId_fk` (`clinicId`),
  KEY `hair_analyses_patientId_fk` (`patientId`),
  CONSTRAINT `hair_analyses_clinicId_fk`  FOREIGN KEY (`clinicId`)  REFERENCES `clinics`  (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `hair_analyses_patientId_fk` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: treatment_plans
-- ============================================================
CREATE TABLE IF NOT EXISTS `treatment_plans` (
  `id`              VARCHAR(36)   NOT NULL,
  `clinicId`        VARCHAR(36)   NOT NULL,
  `patientId`       VARCHAR(36)   NOT NULL,
  `doctorId`        VARCHAR(36)   DEFAULT NULL,
  `procedure`       ENUM('FUE','FUT','DHI','COMBINATION') DEFAULT 'FUE',
  `estimatedGrafts` INT           NOT NULL,
  `estimatedCost`   DECIMAL(10,2) NOT NULL,
  `description`     TEXT          DEFAULT NULL,
  `status`          ENUM('PROPOSED','ACCEPTED','SCHEDULED','COMPLETED','DECLINED') DEFAULT 'PROPOSED',
  `createdAt`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `treatment_plans_clinicId_fk` (`clinicId`),
  KEY `treatment_plans_patientId_fk` (`patientId`),
  KEY `treatment_plans_doctorId_fk` (`doctorId`),
  CONSTRAINT `treatment_plans_clinicId_fk`  FOREIGN KEY (`clinicId`)  REFERENCES `clinics`  (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `treatment_plans_patientId_fk` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `treatment_plans_doctorId_fk`  FOREIGN KEY (`doctorId`)  REFERENCES `users`    (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: surgeries
-- ============================================================
CREATE TABLE IF NOT EXISTS `surgeries` (
  `id`               VARCHAR(36)  NOT NULL,
  `clinicId`         VARCHAR(36)  NOT NULL,
  `patientId`        VARCHAR(36)  NOT NULL,
  `doctorId`         VARCHAR(36)  DEFAULT NULL,
  `procedure`        ENUM('FUE','FUT','DHI','COMBINATION') DEFAULT 'FUE',
  `surgeryDate`      VARCHAR(255) NOT NULL,
  `plannedGrafts`    INT          NOT NULL,
  `extractedGrafts`  INT          NOT NULL DEFAULT 0,
  `implantedGrafts`  INT          NOT NULL DEFAULT 0,
  `surgeryDuration`  VARCHAR(255) DEFAULT NULL,
  `status`           ENUM('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'SCHEDULED',
  `notes`            TEXT         DEFAULT NULL,
  `createdAt`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `surgeries_clinicId_fk` (`clinicId`),
  KEY `surgeries_patientId_fk` (`patientId`),
  KEY `surgeries_doctorId_fk` (`doctorId`),
  CONSTRAINT `surgeries_clinicId_fk`  FOREIGN KEY (`clinicId`)  REFERENCES `clinics`  (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `surgeries_patientId_fk` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `surgeries_doctorId_fk`  FOREIGN KEY (`doctorId`)  REFERENCES `users`    (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: surgery_grafts
-- ============================================================
CREATE TABLE IF NOT EXISTS `surgery_grafts` (
  `id`        VARCHAR(36)  NOT NULL,
  `surgeryId` VARCHAR(36)  NOT NULL,
  `graftType` ENUM('SINGLE','DOUBLE','TRIPLE','MULTI') NOT NULL,
  `quantity`  INT          NOT NULL DEFAULT 0,
  `notes`     TEXT         DEFAULT NULL,
  `createdAt` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `surgery_grafts_surgeryId_fk` (`surgeryId`),
  CONSTRAINT `surgery_grafts_surgeryId_fk` FOREIGN KEY (`surgeryId`) REFERENCES `surgeries` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: patient_photos
-- ============================================================
CREATE TABLE IF NOT EXISTS `patient_photos` (
  `id`              VARCHAR(36)  NOT NULL,
  `clinicId`        VARCHAR(36)  NOT NULL,
  `patientId`       VARCHAR(36)  NOT NULL,
  `type`            ENUM('BEFORE','DAY_1','MONTH_1','MONTH_3','MONTH_6','MONTH_9','MONTH_12','AFTER') NOT NULL,
  `imageUrl`        TEXT         NOT NULL,
  `capturedAt`      VARCHAR(255) NOT NULL,
  `notes`           TEXT         DEFAULT NULL,
  `isPublicConsent` TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_photos_clinicId_fk` (`clinicId`),
  KEY `patient_photos_patientId_fk` (`patientId`),
  CONSTRAINT `patient_photos_clinicId_fk`  FOREIGN KEY (`clinicId`)  REFERENCES `clinics`  (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `patient_photos_patientId_fk` FOREIGN KEY (`patientId`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: follow_ups
-- ============================================================
CREATE TABLE IF NOT EXISTS `follow_ups` (
  `id`           VARCHAR(36)  NOT NULL,
  `clinicId`     VARCHAR(36)  NOT NULL,
  `patientId`    VARCHAR(36)  NOT NULL,
  `surgeryId`    VARCHAR(36)  DEFAULT NULL,
  `followUpDate` VARCHAR(255) NOT NULL,
  `type`         ENUM('DAY_1','DAY_7','DAY_15','MONTH_1','MONTH_3','MONTH_6','MONTH_9','MONTH_12') NOT NULL,
  `status`       ENUM('PENDING','COMPLETED','OVERDUE','SKIPPED') DEFAULT 'PENDING',
  `notes`        TEXT         DEFAULT NULL,
  `createdAt`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `follow_ups_clinicId_fk` (`clinicId`),
  KEY `follow_ups_patientId_fk` (`patientId`),
  KEY `follow_ups_surgeryId_fk` (`surgeryId`),
  CONSTRAINT `follow_ups_clinicId_fk`  FOREIGN KEY (`clinicId`)  REFERENCES `clinics`   (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `follow_ups_patientId_fk` FOREIGN KEY (`patientId`) REFERENCES `patients`  (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `follow_ups_surgeryId_fk` FOREIGN KEY (`surgeryId`) REFERENCES `surgeries` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id`               VARCHAR(36)   NOT NULL,
  `clinicId`         VARCHAR(36)   NOT NULL,
  `patientId`        VARCHAR(36)   NOT NULL,
  `treatmentPlanId`  VARCHAR(36)   DEFAULT NULL,
  `amount`           DECIMAL(10,2) NOT NULL,
  `currency`         VARCHAR(255)  NOT NULL DEFAULT 'USD',
  `status`           ENUM('PENDING','COMPLETED','FAILED','REFUNDED') DEFAULT 'COMPLETED',
  `paymentMethod`    ENUM('CREDIT_CARD','BANK_TRANSFER','CASH','FINANCING','STRIPE') DEFAULT 'CREDIT_CARD',
  `transactionId`    VARCHAR(255)  DEFAULT NULL,
  `createdAt`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `payments_clinicId_fk` (`clinicId`),
  KEY `payments_patientId_fk` (`patientId`),
  KEY `payments_treatmentPlanId_fk` (`treatmentPlanId`),
  CONSTRAINT `payments_clinicId_fk`        FOREIGN KEY (`clinicId`)        REFERENCES `clinics`         (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `payments_patientId_fk`       FOREIGN KEY (`patientId`)       REFERENCES `patients`        (`id`) ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT `payments_treatmentPlanId_fk` FOREIGN KEY (`treatmentPlanId`) REFERENCES `treatment_plans` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: subscriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id`           VARCHAR(36)   NOT NULL,
  `clinicId`     VARCHAR(36)   NOT NULL,
  `plan`         ENUM('STARTER','PROFESSIONAL','ENTERPRISE') DEFAULT 'PROFESSIONAL',
  `status`       ENUM('ACTIVE','TRIALING','PAST_DUE','CANCELED') DEFAULT 'ACTIVE',
  `startDate`    VARCHAR(255)  NOT NULL,
  `endDate`      VARCHAR(255)  NOT NULL,
  `billingCycle` ENUM('MONTHLY','ANNUAL') DEFAULT 'MONTHLY',
  `amount`       DECIMAL(10,2) NOT NULL DEFAULT 299.00,
  `createdAt`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subscriptions_clinicId_fk` (`clinicId`),
  CONSTRAINT `subscriptions_clinicId_fk` FOREIGN KEY (`clinicId`) REFERENCES `clinics` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Done! All 14 tables created.
-- ============================================================
SELECT 'GraftDesk schema created successfully!' AS status;
