-- -------------------------------------------------------------
-- SEED DATA FOR CATEGORIES AND PRODUCTS
-- -------------------------------------------------------------

-- Insert Categories
INSERT INTO public.categories (id, name) VALUES
('food', 'Món ăn'),
('drink', 'Thức uống')
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO public.products (id, name, description, price, original_price, image_url, is_combo, prep_time, status_text, tags, category_id, stock_quantity) VALUES
('combo-1', 'Combo Kịp Tiết', 'Ăn no chắc bụng, giải nhiệt tức thì, sẵn sàng cho buổi chiều năng động.', 50000, 55000, 'https://i.ibb.co/B5m2Hdrr/C-m-X-X-u-Chu-n-V.jpg', true, '7 phút', 'Sẵn sàng ngay', ARRAY['Khỏi Nghĩ', '2 Phút Có Cơm'], 'food', 999),
('combo-2', 'Combo Chống Nghèo', 'Tô bún đầy đặn kèm nước sâm lục vị giải nhiệt mát lành, tiếp sức học tập cực tiết kiệm.', 50000, 52000, 'https://i.ibb.co/ycDfgkng/B-n-Th-t-N-ng-y.jpg', true, '4 phút', 'Nấu cấp tốc', ARRAY['Cứu Đói', 'Siêu Rẻ'], 'food', 999),
('combo-3', 'Combo Bắt Trend', 'Thịt heo chiên xù giòn tan ăn cùng smoothie matcha phô mai mặn béo ngậy cực bắt trend.', 65000, 70000, 'https://i.ibb.co/BHwysVs8/C-m-Th-t-Heo-Chi-n-Gi-n.jpg', true, '6 phút', 'Giòn rụm béo ngậy', ARRAY['Ăn Vặt', 'Độc Lạ'], 'food', 999),
('combo-4', 'Combo Học Đêm', 'Học đêm no căng với đĩa cơm tấm sườn nướng chất lượng cùng trà dâu tằm chua ngọt tỉnh người.', 60000, 65000, 'https://i.ibb.co/V7c7Pzq/C-m-T-m-S-n-B-Ch.jpg', true, '8 phút', 'Đầy năng lượng', ARRAY['Tập Trung', 'Tỉnh Táo'], 'food', 999),
('food-1', 'Bún Thịt Nướng Đầy Đủ', 'Tô bún thịt nướng đầy đủ topping chả giò giòn rụm, thịt nướng thơm lừng.', 40000, 45000, 'https://i.ibb.co/ycDfgkng/B-n-Th-t-N-ng-y.jpg', false, '5 phút', 'Sẵn sàng ngay', ARRAY['Bán Chạy'], 'food', 999),
('food-2', 'Cơm Tấm Sườn Bì Chả', 'Cơm tấm sườn nướng thơm ngon chuẩn vị sài gòn kèm bì chả đầy đặn.', 40000, 45000, 'https://i.ibb.co/V7c7Pzq/C-m-T-m-S-n-B-Ch.jpg', false, '5 phút', 'Sẵn sàng ngay', ARRAY['Yêu Thích'], 'food', 999),
('food-3', 'Cơm Xá Xíu Chuẩn Vị', 'Cơm xá xíu đậm đà, thịt xá xíu mềm ngọt nước sốt đặc trưng.', 35000, 40000, 'https://i.ibb.co/B5m2Hdrr/C-m-X-X-u-Chu-n-V.jpg', false, '5 phút', 'Sẵn sàng ngay', ARRAY[]::text[], 'food', 999),
('food-4', 'Cơm Thịt Heo Chiên Xù', 'Cơm thịt heo tẩm bột chiên xù giòn tan ăn cùng sốt đặc trưng.', 35000, 40000, 'https://i.ibb.co/BHwysVs8/C-m-Th-t-Heo-Chi-n-Gi-n.jpg', false, '5 phút', 'Sẵn sàng ngay', ARRAY[]::text[], 'food', 999),
('drink-1', 'Trà Dâu Tằm', 'Nước trà dâu tằm chua ngọt, mát lạnh sảng khoái ngày hè.', 30000, 35000, 'https://i.ibb.co/zWj6d8fk/Tr-D-u-T-m.jpg', false, '3 phút', 'Sẵn sàng ngay', ARRAY[]::text[], 'drink', 999),
('drink-2', 'Sâm Lục Vị Mát Gan', 'Sâm lục vị thanh lọc giải nhiệt cơ thể cực kỳ mát gan bổ thận.', 20000, null, 'https://i.ibb.co/67Q4HTGR/S-m-L-c-V-M-t-Gan.jpg', false, '2 phút', 'Sẵn sàng ngay', ARRAY[]::text[], 'drink', 999),
('drink-3', 'Matcha Latte', 'Matcha latte béo ngậy, trà xanh nguyên chất nhập khẩu.', 35000, null, 'https://i.ibb.co/gFfdJRK3/Matcha-Latte.jpg', false, '3 phút', 'Sẵn sàng ngay', ARRAY[]::text[], 'drink', 999),
('drink-4', 'Smoothie Matcha Kem Phô Mai', 'Smoothie matcha phô mai mặn béo ngậy cực bắt trend.', 40000, 45000, 'https://i.ibb.co/wZvNDCmJ/Smoothie-Matcha-Kem-Ph-Mai.jpg', false, '3 phút', 'Sẵn sàng ngay', ARRAY[]::text[], 'drink', 999),
('drink-5', 'Trà Tắc Giải Nhiệt', 'Ly trà tắc khổng lồ mát lạnh giải nhiệt tức thì.', 25000, null, 'https://i.ibb.co/G35GkzS4/Tr-T-c.jpg', false, '2 phút', 'Sẵn sàng ngay', ARRAY['Giải Nhiệt'], 'drink', 999)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    image_url = EXCLUDED.image_url,
    is_combo = EXCLUDED.is_combo,
    prep_time = EXCLUDED.prep_time,
    status_text = EXCLUDED.status_text,
    tags = EXCLUDED.tags,
    category_id = EXCLUDED.category_id,
    stock_quantity = EXCLUDED.stock_quantity;
