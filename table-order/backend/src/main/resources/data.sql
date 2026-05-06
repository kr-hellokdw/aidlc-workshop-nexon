-- Seed Data (개발용)
-- 비밀번호: 'admin123' → BCrypt hash
-- 테이블 비밀번호: '1234' → BCrypt hash

-- 매장
INSERT IGNORE INTO store (id, name, created_at, updated_at)
VALUES (1, '맛있는 식당', NOW(), NOW());

-- 관리자 (password: admin123)
INSERT IGNORE INTO admin (id, store_id, username, password, created_at, updated_at)
VALUES (1, 1, 'admin', '$2a$10$R3bNVEL5k4X0zpgsmR6f2.MB85afBqDysUee9IMVJEf4iCS026lm.', NOW(), NOW());

-- 테이블 (password: 1234)
INSERT IGNORE INTO restaurant_table (id, store_id, table_number, password, created_at, updated_at)
VALUES
(1, 1, 1, '$2a$10$JKRHlO3Pm5NPpRLryahOuu6I6Rj1o4A28sCfsqWFc2DR0WSQvDjQW', NOW(), NOW()),
(2, 1, 2, '$2a$10$JKRHlO3Pm5NPpRLryahOuu6I6Rj1o4A28sCfsqWFc2DR0WSQvDjQW', NOW(), NOW()),
(3, 1, 3, '$2a$10$JKRHlO3Pm5NPpRLryahOuu6I6Rj1o4A28sCfsqWFc2DR0WSQvDjQW', NOW(), NOW()),
(4, 1, 4, '$2a$10$JKRHlO3Pm5NPpRLryahOuu6I6Rj1o4A28sCfsqWFc2DR0WSQvDjQW', NOW(), NOW()),
(5, 1, 5, '$2a$10$JKRHlO3Pm5NPpRLryahOuu6I6Rj1o4A28sCfsqWFc2DR0WSQvDjQW', NOW(), NOW());

-- 카테고리
INSERT IGNORE INTO category (id, store_id, name, display_order, created_at, updated_at)
VALUES
(1, 1, '메인 메뉴', 0, NOW(), NOW()),
(2, 1, '사이드', 1, NOW(), NOW()),
(3, 1, '음료', 2, NOW(), NOW());

-- 메뉴
INSERT IGNORE INTO menu (id, store_id, category_id, name, price, description, image_url, display_order, available, created_at, updated_at)
VALUES
(1, 1, 1, '김치찌개', 9000, '돼지고기 김치찌개', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=300&fit=crop', 0, TRUE, NOW(), NOW()),
(2, 1, 1, '된장찌개', 8000, '두부 된장찌개', 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&h=300&fit=crop', 1, TRUE, NOW(), NOW()),
(3, 1, 1, '비빔밥', 10000, '야채 비빔밥', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop', 2, TRUE, NOW(), NOW()),
(4, 1, 1, '불고기', 13000, '소불고기 정식', 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop', 3, TRUE, NOW(), NOW()),
(5, 1, 2, '계란말이', 5000, '치즈 계란말이', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop', 0, TRUE, NOW(), NOW()),
(6, 1, 2, '김치전', 7000, '바삭 김치전', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', 1, TRUE, NOW(), NOW()),
(7, 1, 3, '콜라', 2000, NULL, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop', 0, TRUE, NOW(), NOW()),
(8, 1, 3, '사이다', 2000, NULL, 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&h=300&fit=crop', 1, TRUE, NOW(), NOW()),
(9, 1, 3, '맥주', 5000, '생맥주 500ml', 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&h=300&fit=crop', 2, TRUE, NOW(), NOW());
