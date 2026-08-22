CREATE TABLE IF NOT EXISTS customers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL UNIQUE,
  email VARCHAR(190) NULL,
  source VARCHAR(80) NOT NULL DEFAULT 'website',
  status ENUM('lead','contacting','customer','inactive') NOT NULL DEFAULT 'lead',
  note TEXT NULL,
  first_booking_at TIMESTAMP NULL,
  last_booking_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_customers_status (status),
  KEY idx_customers_last_booking_at (last_booking_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(32) NOT NULL UNIQUE,
  kind VARCHAR(50) NOT NULL,
  product VARCHAR(255) NOT NULL,
  customer_name VARCHAR(160) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(190) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  adults INT NOT NULL DEFAULT 1,
  children INT NOT NULL DEFAULT 0,
  rooms INT NOT NULL DEFAULT 1,
  note TEXT NULL,
  source VARCHAR(80) NOT NULL DEFAULT 'website',
  status ENUM('new','contacting','confirmed','completed','cancelled') NOT NULL DEFAULT 'new',
  admin_note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bookings_phone (phone),
  KEY idx_bookings_status (status),
  KEY idx_bookings_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  setting_key VARCHAR(120) NOT NULL,
  setting_value JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
