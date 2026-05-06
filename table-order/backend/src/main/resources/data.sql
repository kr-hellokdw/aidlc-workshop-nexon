-- Seed Data (개발용)
-- 비밀번호: 'admin123' → BCrypt hash
-- 테이블 비밀번호: '1234' → BCrypt hash

-- 매장
INSERT IGNORE INTO store (id, name, created_at, updated_at)
VALUES (1, '맛있는 식당', NOW(), NOW());

-- 관리자 (password: admin123)
INSERT IGNORE INTO admin (id, store_id, username, password, created_at, updated_at)
VALUES (1, 1, 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', NOW(), NOW());

-- 테이블 (password: 1234)
INSERT IGNORE INTO restaurant_table (id, store_id, table_number, password, created_at, updated_at)
VALUES
(1, 1, 1, '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4M4bqpg9lJz2.Nh2Kje', NOW(), NOW()),
(2, 1, 2, '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4M4bqpg9lJz2.Nh2Kje', NOW(), NOW()),
(3, 1, 3, '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4M4bqpg9lJz2.Nh2Kje', NOW(), NOW()),
(4, 1, 4, '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4M4bqpg9lJz2.Nh2Kje', NOW(), NOW()),
(5, 1, 5, '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Zf4M4bqpg9lJz2.Nh2Kje', NOW(), NOW());

-- 카테고리
INSERT IGNORE INTO category (id, store_id, name, display_order, created_at, updated_at)
VALUES
(1, 1, '메인 메뉴', 0, NOW(), NOW()),
(2, 1, '사이드', 1, NOW(), NOW()),
(3, 1, '음료', 2, NOW(), NOW());

-- 메뉴
INSERT IGNORE INTO menu (id, store_id, category_id, name, price, description, display_order, available, created_at, updated_at)
VALUES
(1, 1, 1, '김치찌개', 9000, '돼지고기 김치찌개', 0, TRUE, NOW(), NOW()),
(2, 1, 1, '된장찌개', 8000, '두부 된장찌개', 1, TRUE, NOW(), NOW()),
(3, 1, 1, '비빔밥', 10000, '야채 비빔밥', 2, TRUE, NOW(), NOW()),
(4, 1, 1, '불고기', 13000, '소불고기 정식', 3, TRUE, NOW(), NOW()),
(5, 1, 2, '계란말이', 5000, '치즈 계란말이', 0, TRUE, NOW(), NOW()),
(6, 1, 2, '김치전', 7000, '바삭 김치전', 1, TRUE, NOW(), NOW()),
(7, 1, 3, '콜라', 2000, NULL, 0, TRUE, NOW(), NOW()),
(8, 1, 3, '사이다', 2000, NULL, 1, TRUE, NOW(), NOW()),
(9, 1, 3, '맥주', 5000, '생맥주 500ml', 2, TRUE, NOW(), NOW());
