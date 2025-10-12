-- SQL script to create new tables for hierarchical exam structure
-- Run this script before running the migration

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    examId BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_domains_examId (examId)
);

-- Create components table
CREATE TABLE IF NOT EXISTS components (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    domainId BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order INT DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_components_domainId (domainId)
);

-- Add componentId column to questions table
ALTER TABLE questions ADD COLUMN componentId BIGINT NULL COMMENT 'شناسه مولفه‌ای که سوال به آن تعلق دارد';
ALTER TABLE questions ADD COLUMN questionNumber INT NULL COMMENT 'شماره سوال در آزمون';

-- Add indexes for better performance
ALTER TABLE questions ADD INDEX idx_questions_componentId (componentId);
ALTER TABLE questions ADD INDEX idx_questions_questionNumber (questionNumber);

-- Add foreign key constraints
ALTER TABLE domains ADD CONSTRAINT fk_domains_examId FOREIGN KEY (examId) REFERENCES exams(id) ON DELETE CASCADE;
ALTER TABLE components ADD CONSTRAINT fk_components_domainId FOREIGN KEY (domainId) REFERENCES domains(id) ON DELETE CASCADE;
ALTER TABLE questions ADD CONSTRAINT fk_questions_componentId FOREIGN KEY (componentId) REFERENCES components(id) ON DELETE SET NULL;
