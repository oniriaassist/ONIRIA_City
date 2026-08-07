-- 018_brochure_delivery.sql
USE oniria_city;

CREATE TABLE IF NOT EXISTS brochure_delivery_attempts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reference_number VARCHAR(40) NOT NULL,
  enquiry_id INT NULL,
  lead_id INT NOT NULL,
  delivery_method ENUM('email', 'whatsapp') NOT NULL,
  recipient VARCHAR(254) NOT NULL,
  provider VARCHAR(60) NOT NULL,
  status ENUM('pending', 'sent', 'failed', 'skipped') NOT NULL DEFAULT 'pending',
  provider_message_id VARCHAR(190) NULL,
  error_message VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delivered_at TIMESTAMP NULL,
  INDEX idx_brochure_delivery_reference (reference_number),
  INDEX idx_brochure_delivery_status (status),
  INDEX idx_brochure_delivery_created (created_at),
  CONSTRAINT fk_brochure_delivery_enquiry FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE SET NULL,
  CONSTRAINT fk_brochure_delivery_lead FOREIGN KEY (lead_id) REFERENCES leads(id)
);

DROP PROCEDURE IF EXISTS oniria_add_brochure_column_if_missing;
DELIMITER //
CREATE PROCEDURE oniria_add_brochure_column_if_missing(
  IN column_name_value VARCHAR(64),
  IN column_definition TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'brochure_requests'
      AND COLUMN_NAME = column_name_value
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE brochure_requests ADD COLUMN `', column_name_value, '` ', column_definition);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END//
DELIMITER ;

CALL oniria_add_brochure_column_if_missing('delivery_method', 'VARCHAR(30) NULL');
CALL oniria_add_brochure_column_if_missing('delivery_status', 'VARCHAR(30) NOT NULL DEFAULT ''pending''');
CALL oniria_add_brochure_column_if_missing('delivered_at', 'TIMESTAMP NULL');
DROP PROCEDURE IF EXISTS oniria_add_brochure_column_if_missing;
