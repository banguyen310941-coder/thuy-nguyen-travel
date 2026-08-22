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

CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_type ENUM('tour','villa','hotel','cruise') NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  status ENUM('draft','published','hidden') NOT NULL DEFAULT 'draft',
  place VARCHAR(255) NULL,
  price_text VARCHAR(120) NULL,
  sale_price_text VARCHAR(120) NULL,
  cover_url TEXT NULL,
  summary TEXT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_products_type_status (product_type,status),
  KEY idx_products_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_units (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id BIGINT UNSIGNED NOT NULL,
  unit_code VARCHAR(120) NULL,
  unit_name VARCHAR(255) NOT NULL,
  unit_kind ENUM('villa','room','cabin','option') NOT NULL DEFAULT 'room',
  bedrooms VARCHAR(80) NULL,
  beds VARCHAR(160) NULL,
  capacity VARCHAR(160) NULL,
  area VARCHAR(80) NULL,
  view_name VARCHAR(160) NULL,
  meal_plan VARCHAR(160) NULL,
  weekday_price VARCHAR(120) NULL,
  weekend_price VARCHAR(120) NULL,
  holiday_price VARCHAR(120) NULL,
  extra_adult VARCHAR(120) NULL,
  extra_child VARCHAR(120) NULL,
  amenities TEXT NULL,
  images JSON NULL,
  status ENUM('available','hold','soldout','hidden') NOT NULL DEFAULT 'available',
  note TEXT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_product_units_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product_units_product (product_id),
  KEY idx_product_units_status (status),
  KEY idx_product_units_code (unit_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
