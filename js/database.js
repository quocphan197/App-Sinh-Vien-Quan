// Mock database for Sinh Viên Quán app

export const initialVouchers = [
    {
        id: "v1",
        title: "Giảm 5.000đ cho đơn tiếp theo",
        condition: "Đơn từ 35k",
        expiry: "30/05/2026",
        tag: "KHỎI NGHĨ",
        tagColor: "bg-status-yellow/20 text-status-brown border-status-yellow/30",
        valueText: "5K",
        type: "Giảm",
        icon: "savings",
        code: "KHOINGHI5K",
        category: "available",
        isNew: true
    },
    {
        id: "v2",
        title: "Trà tắc miễn phí",
        condition: "Đổi từ điểm",
        expiry: "31/05/2026",
        tag: "MÁT LẠNH",
        tagColor: "bg-status-green/20 text-status-green border-status-green/30",
        valueText: "FREE",
        type: "Tặng",
        icon: "local_bar",
        code: "TRATACFREE",
        category: "available",
        isNew: true
    },
    {
        id: "v3",
        title: "Voucher Giảm 50% Nước Cuối Tuần",
        condition: "Đơn từ 50k",
        expiry: "07/06/2026",
        tag: "CỰC CHÁY",
        tagColor: "bg-status-red/20 text-status-red border-status-red/30",
        valueText: "50%",
        type: "Giảm",
        icon: "confirmation_number",
        code: "CUOITUAN50",
        category: "available",
        isNew: false
    },
    {
        id: "v4",
        title: "Giảm 5.000đ cho đơn đầu tiên",
        condition: "Dành cho SV mới",
        useDetail: "Đã dùng cho đơn SVQ-024",
        usedDate: "15/02/2024",
        valueText: "5K",
        type: "Đã dùng",
        icon: "check_circle",
        code: "SVQNEW5",
        category: "used"
    }
];

export const combos = [
    {
        id: "combo-1",
        name: "Combo Kịp Tiết",
        dishName: "Cơm Xá Xíu Chuẩn Vị + Trà Tắc Giải Nhiệt",
        price: 50000,
        time: "7 phút",
        status: "Sẵn sàng ngay",
        reason: "Ăn no chắc bụng, giải nhiệt tức thì, sẵn sàng cho buổi chiều năng động.",
        tags: ["Khỏi Nghĩ", "2 Phút Có Cơm"],
        image: "https://i.ibb.co/B5m2Hdrr/C-m-X-X-u-Chu-n-V.jpg",
        imageAlt: "Combo Cơm Xá Xíu Chuẩn Vị và Trà Tắc Giải Nhiệt mát lạnh."
    },
    {
        id: "combo-2",
        name: "Combo Chống Nghèo",
        dishName: "Bún Thịt Nướng Đầy Đủ + Sâm Lục Vị Mát Gan",
        price: 50000,
        time: "4 phút",
        status: "Nấu cấp tốc",
        reason: "Tô bún đầy đặn kèm nước sâm lục vị giải nhiệt mát lành, tiếp sức học tập cực tiết kiệm.",
        tags: ["Cứu Đói", "Siêu Rẻ"],
        image: "https://i.ibb.co/ycDfgkng/B-n-Th-t-N-ng-y.jpg",
        imageAlt: "Combo Bún Thịt Nướng Đầy Đủ và Sâm Lục Vị Mát Gan giải nhiệt."
    },
    {
        id: "combo-3",
        name: "Combo Bắt Trend",
        dishName: "Cơm Thịt Heo Chiên Xù + Smoothie Matcha Kem Phô Mai",
        price: 65000,
        time: "6 phút",
        status: "Giòn rụm béo ngậy",
        reason: "Thịt heo chiên xù giòn tan ăn cùng smoothie matcha phô mai mặn béo ngậy cực bắt trend.",
        tags: ["Ăn Vặt", "Độc Lạ"],
        image: "https://i.ibb.co/BHwysVs8/C-m-Th-t-Heo-Chi-n-Gi-n.jpg",
        imageAlt: "Combo Cơm Thịt Heo Chiên Xù và Smoothie Matcha Kem Phô Mai béo ngậy."
    },
    {
        id: "combo-4",
        name: "Combo Học Đêm",
        dishName: "Cơm Tấm Sườn Bì Chả + Trà Dâu Tằm",
        price: 60000,
        time: "8 phút",
        status: "Đầy năng lượng",
        reason: "Học đêm no căng với đĩa cơm tấm sườn nướng chất lượng cùng trà dâu tằm chua ngọt tỉnh người.",
        tags: ["Tập Trung", "Tỉnh Táo"],
        image: "https://i.ibb.co/V7c7Pzq/C-m-T-m-S-n-B-Ch.jpg",
        imageAlt: "Combo Cơm Tấm Sườn Bì Chả và Trà Dâu Tằm ngọt ngào."
    }
];

export const singleItems = [
    {
        id: "food-1",
        name: "Bún Thịt Nướng Đầy Đủ",
        price: 40000,
        originalPrice: 45000,
        category: "food",
        image: "https://i.ibb.co/ycDfgkng/B-n-Th-t-N-ng-y.jpg"
    },
    {
        id: "food-2",
        name: "Cơm Tấm Sườn Bì Chả",
        price: 40000,
        originalPrice: 45000,
        category: "food",
        image: "https://i.ibb.co/V7c7Pzq/C-m-T-m-S-n-B-Ch.jpg"
    },
    {
        id: "food-3",
        name: "Cơm Xá Xíu Chuẩn Vị",
        price: 35000,
        originalPrice: 40000,
        category: "food",
        image: "https://i.ibb.co/B5m2Hdrr/C-m-X-X-u-Chu-n-V.jpg"
    },
    {
        id: "food-4",
        name: "Cơm Thịt Heo Chiên Xù",
        price: 35000,
        originalPrice: 40000,
        category: "food",
        image: "https://i.ibb.co/BHwysVs8/C-m-Th-t-Heo-Chi-n-Gi-n.jpg"
    },
    {
        id: "drink-1",
        name: "Trà Dâu Tằm",
        price: 30000,
        originalPrice: 35000,
        category: "drink",
        image: "https://i.ibb.co/zWj6d8fk/Tr-D-u-T-m.jpg"
    },
    {
        id: "drink-2",
        name: "Sâm Lục Vị Mát Gan",
        price: 20000,
        originalPrice: null,
        category: "drink",
        image: "https://i.ibb.co/67Q4HTGR/S-m-L-c-V-M-t-Gan.jpg"
    },
    {
        id: "drink-3",
        name: "Matcha Latte",
        price: 35000,
        originalPrice: null,
        category: "drink",
        image: "https://i.ibb.co/gFfdJRK3/Matcha-Latte.jpg"
    },
    {
        id: "drink-4",
        name: "Smoothie Matcha Kem Phô Mai",
        price: 40000,
        originalPrice: 45000,
        category: "drink",
        image: "https://i.ibb.co/wZvNDCmJ/Smoothie-Matcha-Kem-Ph-Mai.jpg"
    },
    {
        id: "drink-5",
        name: "Trà Tắc Giải Nhiệt",
        price: 25000,
        originalPrice: null,
        category: "drink",
        image: "https://i.ibb.co/G35GkzS4/Tr-T-c.jpg"
    }
];

export const initialNotifications = [
    {
        id: "n1",
        title: "Món của bạn đã sẵn sàng",
        desc: "Đơn SVQ-024 đang chờ bạn tại quầy nhận món số 3.",
        time: "Vừa xong",
        type: "hoat-dong",
        icon: "restaurant",
        iconBg: "bg-primary-fixed",
        iconColor: "text-primary",
        actionText: "Xem đơn",
        actionHash: "#/orders",
        unread: true
    },
    {
        id: "n2",
        title: "Bạn có voucher mới",
        desc: "Mã giảm 5.000đ đã được thêm vào ví điểm thưởng của bạn.",
        time: "10:00",
        type: "hoat-dong",
        icon: "confirmation_number",
        iconBg: "bg-status-yellow/20",
        iconColor: "text-status-brown",
        actionText: "Xem voucher",
        actionHash: "#/vouchers",
        unread: true
    },
    {
        id: "n3",
        title: "Giờ vàng chống đói",
        desc: "Từ 14h–15h hôm nay, giảm giá trà tắc khổng lồ chỉ còn 9.000đ.",
        time: "Hôm nay",
        type: "hoat-dong",
        icon: "flash_on",
        iconBg: "bg-tertiary-fixed",
        iconColor: "text-tertiary",
        actionText: "Đặt ngay",
        actionHash: "#/menu",
        unread: false
    },
    {
        id: "n4",
        title: "Voucher Giảm 50% Cuối Tuần",
        desc: "Săn ngay mã \"CUOITUAN50\" giảm nửa giá cho tất cả các món nước. Áp dụng cho đơn từ 50k.",
        time: "2 giờ trước",
        type: "uu-dai",
        icon: "coupon_image", // Handled with image render
        image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=150",
        actionText: "Nhận voucher",
        actionHash: "#/vouchers",
        unread: true
    },
    {
        id: "n5",
        title: "Khuyến mãi \"Đi Nhóm\"",
        desc: "Đi 4 tính tiền 3 khi gọi Combo Sinh Viên Đặc Biệt. Rủ ngay hội bạn thân qua Sinh Viên Quán nhé!",
        time: "Thứ 3",
        type: "uu-dai",
        icon: "confirmation_number",
        iconBg: "bg-status-yellow/20",
        iconColor: "text-status-brown",
        unread: false
    },
    {
        id: "n6",
        title: "Check-in Thứ 5: Nhận Flang Béo Ngậy",
        desc: "Nhận ngay bánh Flan trứng sữa thơm lừng khi check-in tại quán vào thứ 5 hàng tuần.",
        time: "2 ngày trước",
        type: "uu-dai",
        icon: "cake",
        iconBg: "bg-primary-fixed",
        iconColor: "text-primary",
        unread: false
    }
];

export const VOUCHER_RULES = {
    KHOINGHI5K: { type: 'fixed', amount: 5000, minOrder: 35000, label: 'Giảm 5.000đ' },
    TRATACFREE: { type: 'free_drink', amount: 25000, drinkIds: ['drink-5'], label: 'Trà tắc miễn phí' },
    CUOITUAN50: { type: 'percent_category', percent: 50, category: 'drink', minOrder: 50000, label: 'Giảm 50% nước' },
    GIAM10: { type: 'fixed', amount: 10000, minOrder: 50000, label: 'Giảm 10.000đ' },
    SINHVIEN15: { type: 'percent', percent: 15, minOrder: 0, label: 'Giảm 15%' }
};

export const PREP_FEE = 3000;
export const STATE_STORAGE_KEY = 'svq_app_state';

export const initialOrders = [
    {
        id: "SVQ-024",
        itemName: "Combo Kịp Tiết (Cơm Xá Xíu + Trà Tắc)",
        items: [{ id: "combo-1", qty: 1 }],
        price: 53000,
        time: "15:20 Hôm nay",
        status: "pending",
        step: 3
    },
    {
        id: "SVQ-023",
        itemName: "Combo Học Đêm (Cơm Tấm Sườn + Trà Dâu Tằm)",
        items: [{ id: "combo-4", qty: 1 }],
        price: 63000,
        time: "Hôm qua",
        status: "completed"
    }
];

export const VOUCHER_RULES = {
    KHOINGHI5K: { type: 'fixed', amount: 5000, minOrder: 35000, label: 'Giảm 5.000đ' },
    TRATACFREE: { type: 'free_drink', amount: 25000, drinkIds: ['drink-5'], label: 'Trà tắc miễn phí' },
    CUOITUAN50: { type: 'percent_category', percent: 50, category: 'drink', minOrder: 50000, label: 'Giảm 50% nước' },
    GIAM10: { type: 'fixed', amount: 10000, minOrder: 50000, label: 'Giảm 10.000đ' },
    SINHVIEN15: { type: 'percent', percent: 15, minOrder: 0, label: 'Giảm 15%' }
};

export const PREP_FEE = 3000;
export const STATE_STORAGE_KEY = 'svq_app_state';

export const initialOrders = [
    {
        id: "SVQ-024",
        itemName: "Combo Kịp Tiết (Cơm Xá Xíu + Trà Tắc)",
        items: [{ id: "combo-1", qty: 1 }],
        price: 53000,
        time: "15:20 Hôm nay",
        status: "pending",
        step: 3
    },
    {
        id: "SVQ-023",
        itemName: "Combo Học Đêm (Cơm Tấm Sườn + Trà Dâu Tằm)",
        items: [{ id: "combo-4", qty: 1 }],
        price: 63000,
        time: "Hôm qua",
        status: "completed"
    }
];
