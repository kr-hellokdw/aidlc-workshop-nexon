-- Table Order Service - DDL

CREATE TABLE IF NOT EXISTS store (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    username VARCHAR(30) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_admin_store_username (store_id, username),
    FOREIGN KEY (store_id) REFERENCES store(id)
);

CREATE TABLE IF NOT EXISTS restaurant_table (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    table_number INT NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_table_store_number (store_id, table_number),
    FOREIGN KEY (store_id) REFERENCES store(id)
);

CREATE TABLE IF NOT EXISTS table_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_id BIGINT NOT NULL,
    store_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    started_at DATETIME(6) NOT NULL,
    completed_at DATETIME(6),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_session_table_status (table_id, status),
    FOREIGN KEY (table_id) REFERENCES restaurant_table(id)
);

CREATE TABLE IF NOT EXISTS category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    name VARCHAR(30) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_category_store_name (store_id, name),
    INDEX idx_category_store (store_id, display_order),
    FOREIGN KEY (store_id) REFERENCES store(id)
);

CREATE TABLE IF NOT EXISTS menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    price INT NOT NULL,
    description VARCHAR(200),
    image_url VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_menu_store_category (store_id, category_id, display_order),
    FOREIGN KEY (store_id) REFERENCES store(id),
    FOREIGN KEY (category_id) REFERENCES category(id)
);

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT NOT NULL,
    table_id BIGINT NOT NULL,
    session_id BIGINT NOT NULL,
    order_number INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount INT NOT NULL,
    ordered_at DATETIME(6) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_orders_store_session (store_id, session_id),
    INDEX idx_orders_store_ordered_at (store_id, ordered_at),
    FOREIGN KEY (store_id) REFERENCES store(id),
    FOREIGN KEY (table_id) REFERENCES restaurant_table(id),
    FOREIGN KEY (session_id) REFERENCES table_session(id)
);

CREATE TABLE IF NOT EXISTS order_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    menu_id BIGINT,
    menu_name VARCHAR(50) NOT NULL,
    menu_price INT NOT NULL,
    quantity INT NOT NULL,
    subtotal INT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE SET NULL
);
