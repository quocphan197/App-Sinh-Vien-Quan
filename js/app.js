// --- Sinh Viên Quán - Unified High-Fidelity SPA Controller ---
// This file merges database, utilities, components, and routing to bypass CORS issues on local file:/// protocols.

// Initialize Supabase Client
let supabaseClient;
try {
    if (!window.CONFIG || !window.CONFIG.SUPABASE_URL || !window.CONFIG.SUPABASE_ANON_KEY) {
        throw new Error("Missing Supabase credentials in config.js");
    }
    supabaseClient = supabase.createClient(window.CONFIG.SUPABASE_URL, window.CONFIG.SUPABASE_ANON_KEY);
} catch (e) {
    console.error("Supabase client initialization failed:", e);
    // Graceful proxy-based fallback to support chaining and prevent crashes
    const makeDummySupabase = (errorMsg) => {
        const dummyPromise = Promise.resolve({ data: null, error: new Error(errorMsg) });
        const handler = {
            get(target, prop) {
                if (prop === 'then') {
                    return (onFulfilled) => dummyPromise.then(onFulfilled);
                }
                if (prop === 'auth') {
                    return {
                        getSession: async () => ({ data: { session: null }, error: new Error(errorMsg) }),
                        signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error(errorMsg) }),
                        signUp: async () => ({ data: { user: null, session: null }, error: new Error(errorMsg) }),
                        signOut: async () => ({ error: new Error(errorMsg) }),
                        onAuthStateChange: (cb) => {
                            setTimeout(() => cb('SIGNED_OUT', null), 0);
                            return { data: { subscription: { unsubscribe: () => {} } } };
                        }
                    };
                }
                return () => new Proxy(() => {}, handler);
            },
            apply() {
                return new Proxy(() => {}, handler);
            }
        };
        return new Proxy(() => {}, handler);
    };
    supabaseClient = makeDummySupabase(e.message);
}

// ==========================================
// 1. DATABASE STATE & SEED DATA
// ==========================================
let combos = [
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

let singleItems = [
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

const initialVouchers = [
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

const initialNotifications = [
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
        icon: "coupon_image", 
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
        title: "Check-in Thứ 5: Nhận Flan Béo Ngậy",
        desc: "Nhận ngay bánh Flan trứng sữa thơm lừng khi check-in tại quán vào thứ 5 hàng tuần.",
        time: "2 ngày trước",
        type: "uu-dai",
        icon: "cake",
        iconBg: "bg-primary-fixed",
        iconColor: "text-primary",
        unread: false
    }
];

// ==========================================
// PRICING & VOUCHER RULES (single source of truth)
// ==========================================
const VOUCHER_RULES = {
    KHOINGHI5K: { type: 'fixed', amount: 5000, minOrder: 35000, label: 'Giảm 5.000đ' },
    TRATACFREE: { type: 'free_drink', amount: 25000, drinkIds: ['drink-5'], label: 'Trà tắc miễn phí' },
    CUOITUAN50: { type: 'percent_category', percent: 50, category: 'drink', minOrder: 50000, label: 'Giảm 50% nước' },
    GIAM10: { type: 'fixed', amount: 10000, minOrder: 50000, label: 'Giảm 10.000đ' },
    SINHVIEN15: { type: 'percent', percent: 15, minOrder: 0, label: 'Giảm 15%' }
};

const PREP_FEE = 3000;
const STATE_STORAGE_KEY = 'svq_app_state';

function findProduct(itemId) {
    return combos.find(c => c.id === itemId) || singleItems.find(i => i.id === itemId) || null;
}

function getCartLines(cart) {
    return Object.entries(cart || {})
        .map(([id, qty]) => {
            const product = findProduct(id);
            if (!product || qty <= 0) return null;
            return { id, qty, product, lineTotal: product.price * qty };
        })
        .filter(Boolean);
}

function calcCartSubtotal(cart) {
    return getCartLines(cart).reduce((sum, line) => sum + line.lineTotal, 0);
}

function getDrinkSubtotal(cart) {
    return getCartLines(cart)
        .filter((line) => {
            const single = singleItems.find((i) => i.id === line.id);
            return single && single.category === 'drink';
        })
        .reduce((sum, line) => sum + line.lineTotal, 0);
}

function calcVoucherDiscount(cart, code) {
    if (!code) return { discount: 0, error: null };

    const rule = VOUCHER_RULES[code];
    if (!rule) return { discount: 0, error: 'Mã không khả dụng' };

    const subtotal = calcCartSubtotal(cart);
    if (rule.minOrder && subtotal < rule.minOrder) {
        return {
            discount: 0,
            error: `Đơn tối thiểu ${rule.minOrder.toLocaleString('vi-VN')}đ`
        };
    }

    if (rule.type === 'fixed') {
        return { discount: Math.min(rule.amount, subtotal), error: null };
    }

    if (rule.type === 'percent') {
        return { discount: Math.round(subtotal * rule.percent / 100), error: null };
    }

    if (rule.type === 'percent_category') {
        const drinkTotal = getDrinkSubtotal(cart);
        if (drinkTotal <= 0) {
            return { discount: 0, error: 'Thêm món nước để dùng voucher này' };
        }
        return { discount: Math.round(drinkTotal * rule.percent / 100), error: null };
    }

    if (rule.type === 'free_drink') {
        const lines = getCartLines(cart);
        const target = lines.find((l) => rule.drinkIds.includes(l.id));
        if (target) {
            return { discount: Math.min(rule.amount, target.lineTotal), error: null };
        }
        const anyDrink = lines.find((l) => {
            const s = singleItems.find((i) => i.id === l.id);
            return s && s.category === 'drink';
        });
        if (anyDrink) {
            return { discount: Math.min(rule.amount, anyDrink.lineTotal), error: null };
        }
        return { discount: 0, error: 'Thêm trà tắc (hoặc nước) vào giỏ để dùng voucher' };
    }

    return { discount: 0, error: 'Mã không khả dụng' };
}

function calcOrderTotals(cart, voucherCode) {
    const cartTotal = calcCartSubtotal(cart);
    const { discount, error } = calcVoucherDiscount(cart, voucherCode);
    const finalTotal = Math.max(0, cartTotal + PREP_FEE - discount);
    return { cartTotal, prepFee: PREP_FEE, discount, finalTotal, error };
}

function formatCartItemNames(cart) {
    return getCartLines(cart)
        .map((line) => `${line.product.name || line.product.dishName} x${line.qty}`)
        .join(', ');
}

function getVoucherLabel(code, discount) {
    if (!code || !discount) return 'Chọn ưu đãi';
    return `<span class="bg-status-red/10 text-status-red border border-status-red/20 px-2 py-0.5 rounded text-[10px] font-bold">-${discount.toLocaleString('vi-VN')}đ (${code})</span>`;
}

function persistAppState() {
    try {
        localStorage.setItem(
            STATE_STORAGE_KEY,
            JSON.stringify({
                cart: state.cart,
                orders: state.orders,
                vouchers: state.vouchers,
                notifications: state.notifications,
                appliedVoucherCode: state.appliedVoucherCode,
                appliedVoucherId: state.appliedVoucherId,
                dineOption: state.dineOption,
                cartNote: state.cartNote,
                paymentMethod: state.paymentMethod
            })
        );
    } catch (e) {
        console.warn('Could not persist app state', e);
    }
}

function loadPersistedAppState() {
    try {
        const raw = localStorage.getItem(STATE_STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (saved.cart && typeof saved.cart === 'object') state.cart = saved.cart;
        if (Array.isArray(saved.orders)) state.orders = saved.orders;
        if (Array.isArray(saved.vouchers)) state.vouchers = saved.vouchers;
        if (Array.isArray(saved.notifications)) state.notifications = saved.notifications;
        if (saved.appliedVoucherCode !== undefined) state.appliedVoucherCode = saved.appliedVoucherCode;
        if (saved.appliedVoucherId !== undefined) state.appliedVoucherId = saved.appliedVoucherId;
        if (saved.dineOption) state.dineOption = saved.dineOption;
        if (typeof saved.cartNote === 'string') state.cartNote = saved.cartNote;
        if (saved.paymentMethod) state.paymentMethod = saved.paymentMethod;
    } catch (e) {
        console.warn('Could not load app state', e);
    }
}

// ==========================================
// 1.5 SUPABASE PRODUCTS & CART ENGINE
// ==========================================
async function fetchProductsFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*');
        if (error) {
            console.error("Error fetching products", error);
            showToast("Không thể tải danh sách món ăn từ database", "error");
            return;
        }
        
        if (data && data.length > 0) {
            // Keep copies of the original hardcoded items for fallback properties (like dishName, image, category, etc.)
            const defaultCombos = [...combos];
            const defaultSingleItems = [...singleItems];

            const mapped = data.map(p => {
                const defaultProd = p.is_combo 
                    ? defaultCombos.find(c => c.id === p.id)
                    : defaultSingleItems.find(i => i.id === p.id);

                return {
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                    // Combos require dishName and reason
                    dishName: p.is_combo 
                        ? (defaultProd?.dishName || p.name) 
                        : (p.description || ''),
                    reason: p.is_combo 
                        ? (p.description || defaultProd?.reason || '') 
                        : (p.description || ''),
                    price: Number(p.price),
                    originalPrice: p.original_price ? Number(p.original_price) : null,
                    image: p.image_url || defaultProd?.image || '',
                    isCombo: p.is_combo,
                    time: p.prep_time || defaultProd?.time || '5 phút',
                    status: p.status_text || defaultProd?.status || 'Sẵn sàng ngay',
                    tags: p.tags || defaultProd?.tags || [],
                    category: p.category_id || defaultProd?.category || 'food',
                    stock_quantity: p.stock_quantity
                };
            });

            combos = mapped.filter(p => p.isCombo);
            singleItems = mapped.filter(p => !p.isCombo);
            
            if (combos.length > 0) {
                state.selectedCombo = combos[0];
            }
        }
    } catch (e) {
        console.error("Error loading products", e);
    }
}

async function syncCartFromSupabase() {
    if (!state.user) return;
    try {
        const { data, error } = await supabaseClient
            .from('cart_items')
            .select('product_id, quantity')
            .eq('user_id', state.user.id);
        if (error) {
            console.error("Error fetching cart", error);
            return;
        }
        
        const cartObj = {};
        data.forEach(item => {
            cartObj[item.product_id] = item.quantity;
        });
        state.cart = cartObj;
    } catch (e) {
        console.error("Error syncing cart", e);
    }
}

async function updateSupabaseCartItem(productId, quantity) {
    if (!state.user) return false;
    
    try {
        if (quantity <= 0) {
            const { error } = await supabaseClient
                .from('cart_items')
                .delete()
                .eq('user_id', state.user.id)
                .eq('product_id', productId);
            if (error) {
                console.error("Error deleting cart item", error);
                return false;
            }
        } else {
            // Check stock
            const { data: product } = await supabaseClient
                .from('products')
                .select('stock_quantity')
                .eq('id', productId)
                .single();
            if (product && product.stock_quantity < quantity) {
                showToast(`Chỉ còn ${product.stock_quantity} phần trong kho!`, "warning");
                return false;
            }

            const { error } = await supabaseClient
                .from('cart_items')
                .upsert({
                    user_id: state.user.id,
                    product_id: productId,
                    quantity: quantity
                }, { onConflict: 'user_id,product_id' });
            if (error) {
                console.error("Error updating cart item", error);
                return false;
            }
        }
        return true;
    } catch (e) {
        console.error("Error writing cart to Supabase", e);
        return false;
    }
}

async function fetchOrdersFromSupabase() {
    if (!state.user) return;
    try {
        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select(`
                *,
                order_items (
                    product_id,
                    quantity,
                    price_at_purchase,
                    products (
                        name,
                        image_url
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching orders", error);
            return;
        }

        const oldOrdersMap = {};
        if (Array.isArray(state.orders)) {
            state.orders.forEach(o => { oldOrdersMap[o.id] = o.step; });
        }

        // Map database orders to frontend state.orders format
        state.orders = orders.map(order => {
            const itemNames = order.order_items.map(oi => {
                const prodName = oi.products ? oi.products.name : 'Món ăn';
                return `${prodName} x${oi.quantity}`;
            }).join(', ');

            let step = 1;
            let status = 'preparing';
            if (order.order_status === 'PENDING') {
                step = 1;
                status = 'preparing';
            } else if (order.order_status === 'PREPARING') {
                step = 2;
                status = 'preparing';
            } else if (order.order_status === 'READY') {
                step = 3;
                status = 'pending'; // 'pending' in the UI indicates ready to collect
            } else if (order.order_status === 'COMPLETED') {
                step = 4;
                status = 'completed';
            } else if (order.order_status === 'CANCELLED') {
                step = 0;
                status = 'cancelled';
            }

            const now = new Date(order.created_at);
            const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.toLocaleDateString('vi-VN')}`;

            // Check step changes to trigger notifications & toast
            const oldStep = oldOrdersMap[order.id];
            if (oldStep !== undefined && step > oldStep) {
                if (step === 2) {
                    state.notifications.unshift({
                        id: `n-step2-${order.id}-${Date.now()}`,
                        title: "Món ăn đang nấu chín",
                        desc: `Đơn ${order.id} đang được chế biến trên bếp. Sắp có rồi bạn ơi!`,
                        time: "Vừa xong",
                        type: "hoat-dong",
                        icon: "skillet",
                        iconBg: "bg-tertiary-fixed",
                        iconColor: "text-tertiary",
                        actionText: "Xem đơn",
                        actionHash: "#/orders",
                        unread: true
                    });
                    showToast(`Đơn ${order.id} đang được chế biến trên bếp!`, "info");
                } else if (step === 3) {
                    state.notifications.unshift({
                        id: `n-step3-${order.id}-${Date.now()}`,
                        title: "Món ăn đã sẵn sàng!",
                        desc: `Đơn ${order.id} đang chờ bạn tại Quầy nhận món số 3. Mời bạn qua lấy!`,
                        time: "Vừa xong",
                        type: "hoat-dong",
                        icon: "restaurant",
                        iconBg: "bg-primary-fixed",
                        iconColor: "text-primary",
                        actionText: "Xem đơn",
                        actionHash: "#/orders",
                        unread: true
                    });
                    showToast(`Món của đơn ${order.id} đã chuẩn bị xong! Mời nhận tại quầy số 3.`, "success");
                    playSuccessSound();
                } else if (step === 4) {
                    showToast(`Đơn ${order.id} đã hoàn thành và nhận món!`, "success");
                }
            }

            return {
                id: order.id,
                itemName: itemNames,
                items: order.order_items.map(oi => ({ id: oi.product_id, qty: oi.quantity })),
                price: order.final_amount,
                time: timeFormatted,
                status: status,
                step: step
            };
        });
    } catch (e) {
        console.error("Error loading orders", e);
    }
}

async function fetchAdminData() {
    if (!state.user || !state.profile || state.profile.role !== 'admin') return;
    try {
        // Fetch all orders
        const { data: orders, error: ordersErr } = await supabaseClient
            .from('orders')
            .select(`
                *,
                order_items (
                    product_id,
                    quantity,
                    price_at_purchase,
                    products (
                        name
                    )
                ),
                profiles (
                    name,
                    mssv
                )
            `)
            .order('created_at', { ascending: false });
        if (ordersErr) {
            console.error("Admin orders fetch error", ordersErr);
            showToast("Lỗi tải danh sách đơn hàng", "error");
        } else {
            state.adminOrders = orders;
        }

        // Fetch products
        const { data: products, error: prodErr } = await supabaseClient
            .from('products')
            .select('*')
            .order('name', { ascending: true });
        if (prodErr) {
            console.error("Admin products fetch error", prodErr);
        } else {
            state.adminProducts = products;
        }
    } catch (e) {
        console.error("Admin data load error", e);
    }
}

let menuSearchDebounceTimer = null;

// ==========================================
// 2. STATE MANAGER
// ==========================================
const state = {
    theme: localStorage.getItem('theme') || 'light',
    currentRoute: window.location.hash || '#/home',
    vouchers: [...initialVouchers],
    notifications: [...initialNotifications],
    cart: {}, 
    orders: [],
    selectedCombo: combos[0], 
    adminOrders: [],
    adminProducts: [],
    adminTab: 'orders', 
    isSpinning: false,
    appliedVoucherId: null,
    menuFilter: 'all',
    menuSearch: '',
    notificationTab: 'hoat-dong',
    dineOption: 'eat-in',
    cartNote: '',
    appliedVoucherCode: null,
    paymentMethod: 'cash',
    addedItemSheet: null
};

loadPersistedAppState();

// ==========================================
// 3. UTILITIES ENGINE
// ==========================================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playClickSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.05);
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
        console.warn("Audio Context blocked or not supported", e);
    }
}

function playSuccessSound() {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        
        const playNote = (freq, delay, duration) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
            gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + duration);
        };
        
        playNote(523.25, 0, 0.15); 
        playNote(659.25, 0.08, 0.25); 
    } catch (e) {
        console.warn("Audio Context blocked", e);
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-enter flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-semibold pointer-events-auto backdrop-blur-md transition-all duration-300`;
    
    if (type === 'success') {
        toast.className += ' bg-status-green/90 text-white border-status-green/20';
    } else if (type === 'info') {
        toast.className += ' bg-primary-container/90 text-white border-primary/20';
    } else {
        toast.className += ' bg-surface-container-high/90 text-on-surface border-outline-variant/30';
    }

    let iconName = 'check_circle';
    if (type === 'info') iconName = 'info';
    else if (type === 'warning') iconName = 'warning';

    toast.innerHTML = `
        <span class="material-symbols-outlined text-[20px] shrink-0">${iconName}</span>
        <span class="flex-grow text-xs">${message}</span>
    `;

    container.appendChild(toast);
    playClickSound();

    setTimeout(() => {
        toast.classList.remove('toast-enter');
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const appContainer = document.getElementById('app-container');
    canvas.width = appContainer.clientWidth;
    canvas.height = appContainer.clientHeight;

    playSuccessSound();

    const colors = ['#f46b2a', '#a53c00', '#FBBF24', '#10B981', '#00658c'];
    const particles = [];

    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -10 - Math.random() * 20,
            r: 4 + Math.random() * 6,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0,
            w: 8 + Math.random() * 6,
            h: 4 + Math.random() * 4,
            speedY: 2 + Math.random() * 3,
            speedX: Math.random() * 2 - 1
        });
    }

    let animationFrameId;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let remaining = false;

        particles.forEach(p => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += p.speedY;
            p.x += p.speedX;
            p.tilt = Math.sin(p.tiltAngle) * 12;

            if (p.y < canvas.height) {
                remaining = true;
                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            }
        });

        if (remaining) {
            animationFrameId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationFrameId);
        }
    }

    draw();
}

// ==========================================
// 4. SCREEN COMPONENT RENDERERS
// ==========================================

function renderHeader(state) {
    const isMainPage = ['#/home', '#/vouchers', '#/menu', '#/orders', '#/profile'].includes(state.currentRoute) || !state.currentRoute || state.currentRoute === '#/';
    let headerHTML = '';

    if (isMainPage) {
        const unreadCount = state.notifications.filter(n => n.unread).length;
        const badgeHTML = unreadCount > 0 
            ? `<span class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-status-red rounded-full border border-surface badge-pulse"></span>` 
            : '';

        const cartCount = Object.values(state.cart).reduce((sum, q) => sum + q, 0);
        const cartBadgeHTML = cartCount > 0 
            ? `<span class="absolute -top-1 -right-1 bg-status-red text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm badge-pulse">${cartCount}</span>` 
            : '';

        headerHTML = `
            <header class="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-14 bg-surface-container-low dark:bg-surface-dim border-b border-outline-variant/10 shadow-sm transition-colors duration-300">
                <div class="flex items-center gap-2 cursor-pointer" onclick="window.location.hash = '#/home'">
                    <span class="material-symbols-outlined text-primary" data-icon="location_on">location_on</span>
                    <h1 class="font-hero-mobile text-[24px] leading-tight text-primary font-bold">Sinh Viên Quán</h1>
                </div>
                <div class="flex items-center gap-4">
                    <button class="relative material-symbols-outlined text-on-surface-variant hover:text-primary hover:scale-105 active:scale-95 transition-transform animate-fade-in" data-icon="shopping_cart" onclick="window.location.hash = '#/cart'">
                        shopping_cart
                        ${cartBadgeHTML}
                    </button>
                    <button class="relative material-symbols-outlined text-on-surface-variant hover:text-primary hover:scale-105 active:scale-95 transition-transform" data-icon="notifications" onclick="window.location.hash = '#/notifications'">
                        notifications
                        ${badgeHTML}
                    </button>
                    <button class="material-symbols-outlined text-on-surface-variant hover:text-primary hover:scale-105 active:scale-95 transition-transform" data-icon="menu" onclick="window.toggleDrawer()">
                        menu
                    </button>
                </div>
            </header>
        `;
    } else {
        let pageTitle = "Sinh Viên Quán";
        if (state.currentRoute === '#/notifications') pageTitle = "Thông báo";
        if (state.currentRoute === '#/decision') pageTitle = "Quán Chọn Giúp";

        headerHTML = `
            <header class="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-14 bg-surface-container-low dark:bg-surface-dim border-b border-outline-variant/10 shadow-sm transition-colors duration-300">
                <div class="flex items-center gap-stack-sm">
                    <button class="active:scale-95 transition-transform text-on-surface hover:text-primary p-1 rounded-full hover:bg-surface-variant/30 flex items-center justify-center" onclick="window.history.back()">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 class="font-section-title-mobile text-section-title-mobile text-primary font-extrabold text-[20px] ml-1">${pageTitle}</h1>
                </div>
                ${state.currentRoute === '#/notifications' ? `
                    <button class="active:scale-95 transition-transform text-on-surface hover:text-primary hover:opacity-80 p-1 rounded-full hover:bg-surface-variant/30 flex items-center justify-center" onclick="window.markAllNotificationsRead()" title="Đọc tất cả">
                        <span class="material-symbols-outlined">done_all</span>
                    </button>
                ` : '<div></div>'}
            </header>
        `;
    }

    return headerHTML;
}

function renderFooter(state) {
    const route = state.currentRoute || '#/home';
    
    if (route === '#/cart') {
        const { finalTotal } = calcOrderTotals(state.cart, state.appliedVoucherCode);
        const isLoggedIn = !!state.user;

        return `
            <div class="absolute bottom-0 left-0 w-full z-50 bg-surface dark:bg-inverse-surface px-margin-mobile py-4 border-t border-outline-variant/10 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] pb-safe transition-colors duration-300">
                <div class="max-w-md mx-auto flex gap-4 items-center justify-between select-none">
                    <div class="flex flex-col shrink-0">
                        <span class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim">Tổng thanh toán</span>
                        <span class="font-label-price text-lg font-extrabold text-primary dark:text-primary-fixed-dim">${finalTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    ${isLoggedIn ? `
                        <button class="flex-grow bg-primary-container hover:bg-primary text-white font-extrabold py-3.5 rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all squishy-button" onclick="window.location.hash = '#/checkout'">
                            Tiếp tục thanh toán
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    ` : `
                        <button class="flex-grow bg-primary hover:bg-primary-container text-white font-extrabold py-3.5 rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all squishy-button" onclick="window.location.hash = '#/profile'; showToast('Vui lòng đăng nhập để thanh toán', 'info')">
                            Đăng nhập để thanh toán
                            <span class="material-symbols-outlined text-sm">login</span>
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    if (route === '#/checkout') {
        const { finalTotal } = calcOrderTotals(state.cart, state.appliedVoucherCode);

        return `
            <div class="absolute bottom-0 left-0 w-full bg-surface dark:bg-inverse-surface shadow-lg z-50 border-t border-outline-variant/10 rounded-t-2xl pb-safe transition-colors duration-300">
                <div class="max-w-md mx-auto p-4 flex flex-col gap-3">
                    <div class="flex justify-between items-end mb-1 select-none">
                        <div class="text-on-surface-variant dark:text-secondary-fixed-dim">
                            <p class="text-[10px]">Tổng thanh toán</p>
                            <p class="font-label-price text-lg font-extrabold text-primary dark:text-primary-fixed-dim">${finalTotal.toLocaleString('vi-VN')}đ</p>
                        </div>
                        <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim text-right max-w-[180px] leading-snug">Bấm đặt món để xác nhận đơn hàng.</p>
                    </div>
                    <button class="w-full h-12 bg-primary hover:bg-primary-container text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 squishy-button"
                            onclick="window.checkoutCartFinal()">
                        Xác nhận đặt món ngay
                        <span class="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </div>
        `;
    }

    const tabs = [
        { id: 'home', hash: '#/home', label: 'Trang chủ', icon: 'home' },
        { id: 'menu', hash: '#/menu', label: 'Thực đơn', icon: 'restaurant_menu' },
        { id: 'orders', hash: '#/orders', label: 'Đơn hàng', icon: 'receipt_long' },
        { id: 'vouchers', hash: '#/vouchers', label: 'Ưu đãi', icon: 'confirmation_number' },
        { id: 'profile', hash: '#/profile', label: 'Cá nhân', icon: 'person' }
    ];

    const tabElements = tabs.map(tab => {
        const isActive = route === tab.hash || (tab.id === 'home' && (route === '#/' || !route));
        const activeClass = isActive 
            ? 'text-primary dark:text-primary-fixed-dim font-semibold scale-105' 
            : 'text-on-secondary-container dark:text-secondary-fixed-dim hover:text-primary';
        
        const fillSetting = isActive ? "style=\"font-variation-settings: 'FILL' 1;\"" : '';

        return `
            <a class="flex flex-col items-center justify-center gap-1 ${activeClass} transition-all duration-200 px-2 py-1 select-none" href="${tab.hash}">
                <span class="material-symbols-outlined text-[24px]" ${fillSetting}>${tab.icon}</span>
                <span class="font-label-sm text-[10px] whitespace-nowrap uppercase tracking-tighter">${tab.label}</span>
            </a>
        `;
    }).join('');

    return `
        <nav class="absolute bottom-0 left-0 w-full z-50 h-16 flex justify-around items-center bg-surface-container-lowest dark:bg-inverse-surface border-t border-surface-variant shadow-md px-1 pb-safe transition-colors duration-300">
            ${tabElements}
        </nav>
    `;
}

function renderDrawer(state) {
    const isDark = state.theme === 'dark';
    
    return `
        <div class="absolute inset-0 bg-black/50 z-[55] hidden transition-opacity duration-300" id="drawer-overlay" onclick="window.toggleDrawer()"></div>
        
        <aside class="absolute inset-y-0 left-0 z-[60] flex flex-col p-stack-lg bg-surface dark:bg-inverse-surface h-full w-80 rounded-r-xl shadow-2xl -translate-x-full transition-transform duration-300 border-r border-outline-variant/10" id="nav-drawer">
            <div class="flex flex-col gap-4 mb-8">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-full overflow-hidden bg-primary-container border-2 border-primary shadow-sm shrink-0">
                        <img class="w-full h-full object-cover" alt="Student Profile Picture" src="https://i.ibb.co/whXgVxdz/nh-vest.png">
                    </div>
                    <div>
                        <h2 class="font-bold text-lg text-primary dark:text-primary-fixed-dim">Anh Quốc</h2>
                        <p class="text-sm text-on-surface-variant dark:text-secondary-fixed-dim">MSSV: 12345678</p>
                        <div class="flex gap-1.5 items-center mt-1">
                            <span class="inline-block px-2 py-0.5 bg-status-yellow text-on-primary-fixed text-xs font-bold rounded-full select-none shadow-sm">Hạng Vàng</span>
                            <span class="text-xs text-primary font-bold dark:text-primary-fixed-dim">🌟 50 Điểm</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <nav class="flex flex-col gap-2 flex-grow">
                ${state.profile && state.profile.role === 'admin' ? `
                    <a class="flex items-center gap-4 p-3 rounded-lg text-primary dark:text-primary-fixed-dim hover:bg-primary/10 active:opacity-70 transition-colors font-bold" href="#/admin" onclick="window.toggleDrawer()">
                        <span class="material-symbols-outlined text-primary" data-icon="admin_panel_settings">admin_panel_settings</span>
                        <span class="font-body-md text-sm">Trang Quản trị</span>
                    </a>
                ` : ''}
                <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/orders" onclick="window.toggleDrawer()">
                    <span class="material-symbols-outlined" data-icon="history">history</span>
                    <span class="font-body-md text-sm">Lịch sử đặt quà</span>
                </a>
                <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/profile" onclick="window.toggleDrawer()">
                    <span class="material-symbols-outlined" data-icon="stars">stars</span>
                    <span class="font-body-md text-sm">Ví điểm thưởng</span>
                </a>
                <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/profile" onclick="window.toggleDrawer()">
                    <span class="material-symbols-outlined" data-icon="map">map</span>
                    <span class="font-body-md text-sm">Địa chỉ đã lưu</span>
                </a>
                <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/profile" onclick="window.toggleDrawer()">
                    <span class="material-symbols-outlined" data-icon="support_agent">support_agent</span>
                    <span class="font-body-md text-sm">Trung tâm hỗ trợ</span>
                </a>
                
                <div class="border-t border-outline-variant/30 dark:border-outline/30 mt-4 pt-4 flex flex-col gap-2">
                    <div class="flex items-center justify-between p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim">
                        <div class="flex items-center gap-4">
                            <span class="material-symbols-outlined" id="theme-icon">${isDark ? 'dark_mode' : 'light_mode'}</span>
                            <span class="font-body-md text-sm select-none">Chế độ tối</span>
                        </div>
                        <button class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDark ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}" 
                                id="theme-switch" role="switch" aria-checked="${isDark}" onclick="window.toggleTheme()">
                            <span class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isDark ? 'translate-x-5' : 'translate-x-0'}"></span>
                        </button>
                    </div>

                    <a class="flex items-center gap-4 p-3 rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant/30 active:opacity-70 transition-colors" href="#/profile" onclick="window.toggleDrawer()">
                        <span class="material-symbols-outlined" data-icon="settings">settings</span>
                        <span class="font-body-md text-sm">Cài đặt</span>
                    </a>
                </div>

                <button class="flex items-center gap-4 p-3 rounded-lg text-error hover:bg-error-container/30 active:opacity-70 transition-colors mt-auto text-left w-full" onclick="window.handleLogout()">
                    <span class="material-symbols-outlined" data-icon="logout">logout</span>
                    <span class="font-body-md text-sm font-semibold">Đăng xuất</span>
                </button>
            </nav>
        </aside>
    `;
}

function renderHome(state) {
    const activeVouchers = state.vouchers.filter(v => v.category === 'available').slice(0, 2);

    return `
        <div class="space-y-6 pt-16 pb-12 animate-fade-in">
            <div class="bg-gradient-to-br from-primary to-primary-container text-white p-5 rounded-2xl shadow-md relative overflow-hidden select-none">
                <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div class="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                
                <div class="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <p class="text-white/80 font-label-sm text-[12px] uppercase tracking-wider">Thành viên ưu tú</p>
                        <h3 class="text-xl font-extrabold leading-tight">Sinh Viên Quán Card</h3>
                    </div>
                    <span class="px-2.5 py-0.5 bg-status-yellow text-on-primary-fixed text-[11px] font-bold rounded-full shadow-sm">HẠNG VÀNG</span>
                </div>
                
                <div class="mt-6 flex justify-between items-end relative z-10">
                    <div>
                        <p class="text-white/60 text-[11px]">Mã số sinh viên</p>
                        <p class="font-mono text-sm tracking-wider font-bold">12345678</p>
                    </div>
                    <div class="text-right">
                        <p class="text-white/60 text-[11px]">Điểm tích lũy</p>
                        <p class="text-2xl font-black">50 <span class="text-xs font-normal">pts</span></p>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-r from-[#ffe9e2] to-[#fce3da] dark:from-[#3c2d28] dark:to-[#4e453b] p-5 rounded-2xl border border-outline-variant/30 dark:border-outline/20 relative overflow-hidden shadow-sm decision-engine-glow select-none">
                <div class="flex gap-4 items-center">
                    <div class="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shrink-0 shadow-md">
                        <span class="material-symbols-outlined text-2xl font-bold animate-bounce">psychology</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-on-surface text-base dark:text-white">Hôm nay ăn gì?</h4>
                        <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">Tiết kiệm thời gian suy nghĩ, để quán chọn cho bạn!</p>
                    </div>
                </div>
                <button class="mt-4 w-full squishy-button bg-primary text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all" onclick="window.location.hash = '#/decision'">
                    <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">bolt</span>
                    Quán Chọn Giúp Tôi (3 giây)
                </button>
            </div>

            <div class="grid grid-cols-3 gap-3 select-none">
                <button class="squishy-button flex flex-col items-center justify-center p-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-all" onclick="window.location.hash = '#/menu'">
                    <span class="material-symbols-outlined text-primary text-2xl mb-1.5" style="font-variation-settings: 'FILL' 1;">restaurant_menu</span>
                    <span class="font-label-sm text-[11px] text-on-surface">Gọi món</span>
                </button>
                <button class="squishy-button flex flex-col items-center justify-center p-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-all" onclick="window.location.hash = '#/vouchers'">
                    <span class="material-symbols-outlined text-primary text-2xl mb-1.5" style="font-variation-settings: 'FILL' 1;">confirmation_number</span>
                    <span class="font-label-sm text-[11px] text-on-surface">Voucher</span>
                </button>
                <button class="squishy-button flex flex-col items-center justify-center p-3.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/20 rounded-xl hover:bg-surface-container transition-all" onclick="window.location.hash = '#/notifications'">
                    <span class="material-symbols-outlined text-primary text-2xl mb-1.5" style="font-variation-settings: 'FILL' 1;">notifications</span>
                    <span class="font-label-sm text-[11px] text-on-surface">Thông báo</span>
                </button>
            </div>

            <section class="space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-lg text-primary dark:text-primary-fixed-dim">Voucher của bạn</h3>
                    <a class="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer" onclick="window.location.hash = '#/vouchers'">Xem tất cả</a>
                </div>
                
                <div class="grid gap-3">
                    ${activeVouchers.map(v => `
                        <div class="relative overflow-hidden flex bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-xl shadow-sm hover:shadow-md transition-all group select-none">
                            <div class="w-16 ${v.type === 'Giảm' ? 'bg-primary-container' : 'bg-tertiary-container'} flex flex-col items-center justify-center text-white p-1 shrink-0">
                                <span class="material-symbols-outlined text-2xl mb-0.5">${v.icon}</span>
                                <span class="text-[9px] font-bold uppercase">${v.type}</span>
                                <span class="text-sm font-black">${v.valueText}</span>
                            </div>
                            <div class="p-3 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 class="font-bold text-sm text-on-surface leading-snug dark:text-white">${v.title}</h4>
                                    <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">${v.condition} • HSD: ${v.expiry}</p>
                                </div>
                                <button class="mt-2 self-end bg-primary-container hover:bg-primary text-white text-[11px] font-bold px-3 py-1 rounded-full active:scale-95 transition-transform" onclick="window.applyVoucher('${v.id}')">Dùng ngay</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <section class="space-y-3">
                <h3 class="font-bold text-lg text-primary dark:text-primary-fixed-dim">Khuyến mãi cực hot</h3>
                <div class="relative overflow-hidden rounded-2xl bg-surface-container-high dark:bg-surface-dim border border-outline-variant/30 h-32 select-none cursor-pointer" onclick="window.location.hash = '#/menu'">
                    <img class="absolute inset-0 w-full h-full object-cover brightness-[0.7] hover:scale-105 transition-all duration-500" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80" alt="Hot deal background">
                    <div class="absolute inset-0 p-4 flex flex-col justify-between text-white pointer-events-none">
                        <span class="self-start bg-status-red text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg shadow-sm">Độc quyền</span>
                        <div>
                            <h4 class="font-black text-lg">Giờ Vàng Sinh Viên</h4>
                            <p class="text-[11px] text-white/80">Khung giờ 14h - 17h: Trà sữa giảm giá đồng loạt còn 15.000đ</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    `;
}

function renderVouchers(state) {
    const availableVouchers = state.vouchers.filter(v => v.category === 'available');
    const usedVouchers = state.vouchers.filter(v => v.category === 'used');
    const newCount = availableVouchers.filter(v => v.isNew).length;

    return `
        <div class="pt-16 pb-12 animate-fade-in">
            <div class="mb-6 select-none">
                <h2 class="font-section-title-mobile text-section-title-mobile text-on-surface dark:text-white mb-1.5">Voucher của bạn</h2>
                <p class="font-body-md text-sm text-on-surface-variant dark:text-secondary-fixed-dim">Tiết kiệm hơn với các ưu đãi dành riêng cho sinh viên.</p>
            </div>

            <section class="mb-8">
                <div class="flex items-center justify-between mb-4 select-none">
                    <h3 class="font-bold text-[16px] text-primary dark:text-primary-fixed-dim">Voucher khả dụng</h3>
                    ${newCount > 0 ? `<span class="bg-primary-container text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm badge-pulse">${newCount} Mới</span>` : ''}
                </div>
                
                <div class="grid gap-4">
                    ${availableVouchers.length === 0 ? `
                        <div class="p-6 border border-dashed border-outline-variant dark:border-outline/40 rounded-2xl flex flex-col items-center text-center opacity-70">
                            <span class="material-symbols-outlined text-4xl mb-2 text-outline">confirmation_number</span>
                            <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim font-medium">Bạn đã dùng hết voucher khả dụng rồi!</p>
                        </div>
                    ` : availableVouchers.map(v => `
                        <div class="relative overflow-hidden flex bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-xl shadow-sm hover:shadow-md transition-all group select-none">
                            <div class="w-24 ${v.id === 'v2' ? 'bg-tertiary-container' : 'bg-primary-container'} flex flex-col items-center justify-center text-white p-2 shrink-0 relative">
                                <span class="material-symbols-outlined text-3xl mb-1">${v.icon}</span>
                                <span class="text-[10px] font-bold uppercase text-center">${v.type}</span>
                                <span class="text-lg font-black">${v.valueText}</span>
                            </div>
                            <div class="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 class="font-bold text-[15px] text-on-surface dark:text-white leading-snug mb-1">${v.title}</h4>
                                    <p class="text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim mb-2">${v.condition} • HSD: ${v.expiry}</p>
                                    <span class="inline-block px-2 py-0.5 font-semibold text-[10px] rounded border ${v.tagColor}">${v.tag}</span>
                                </div>
                                <button class="mt-4 self-end bg-primary-container hover:bg-primary text-white px-5 py-1.5 rounded-full font-bold text-xs active:scale-95 transition-all shadow-sm squishy-button" onclick="window.applyVoucher('${v.id}')">Dùng ngay</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <section class="mb-6">
                <h3 class="font-bold text-[16px] text-on-surface-variant dark:text-secondary-fixed-dim mb-4 opacity-75 select-none">Voucher đã dùng</h3>
                <div class="grid gap-4">
                    ${usedVouchers.map(v => `
                        <div class="relative overflow-hidden flex bg-surface-container-low dark:bg-surface-variant/10 border border-outline-variant/20 rounded-xl grayscale opacity-60 select-none">
                            <div class="w-24 bg-secondary flex flex-col items-center justify-center text-white p-2 shrink-0">
                                <span class="material-symbols-outlined text-3xl mb-1">${v.icon}</span>
                                <span class="text-[10px] font-bold uppercase">${v.type}</span>
                            </div>
                            <div class="p-4 flex-1">
                                <h4 class="font-bold text-[15px] text-on-surface dark:text-white leading-snug mb-1">${v.title}</h4>
                                <p class="text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim mb-1">${v.useDetail}</p>
                                <p class="text-[10px] italic text-on-surface-variant/80 dark:text-secondary-fixed-dim/80">Ngày dùng: ${v.usedDate}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <div class="mt-8 p-6 border-2 border-dashed border-outline-variant dark:border-outline/30 rounded-3xl flex flex-col items-center text-center opacity-40 select-none">
                <span class="material-symbols-outlined text-5xl mb-3 text-outline">confirmation_number</span>
                <p class="font-body-md text-xs text-on-surface-variant dark:text-secondary-fixed-dim max-w-[200px] leading-relaxed">Đang săn thêm voucher hời cho bạn...</p>
            </div>
        </div>
    `;
}

function renderDecision(state) {
    const currentCombo = state.selectedCombo;
    const isSpinning = state.isSpinning;
    let cardContent = '';

    if (isSpinning) {
        cardContent = `
            <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 rounded-xl overflow-hidden decision-engine-glow transition-all duration-300">
                <div class="slot-machine-container bg-surface-variant/30 dark:bg-black/20 flex flex-col justify-center items-center">
                    <div class="slot-machine-track" id="slot-track">
                        <div class="slot-item">
                            <span class="material-symbols-outlined text-5xl text-primary animate-spin mb-2">autorenew</span>
                            <span class="font-bold text-sm text-on-surface-variant">Đang kết nối ý chí chống đói...</span>
                        </div>
                    </div>
                </div>
                <div class="p-6 text-center">
                    <h3 class="font-bold text-lg text-primary animate-pulse">Quán đang chọn nhân duyên ẩm thực...</h3>
                    <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim mt-1">Đảm bảo ngon, rẻ, siêu tốc!</p>
                </div>
            </div>
        `;
    } else if (currentCombo) {
        const priceFormatted = currentCombo.price.toLocaleString('vi-VN') + 'đ';
        const previewCart = { [currentCombo.id]: 1 };
        const { discount: discountAmount } = calcVoucherDiscount(previewCart, state.appliedVoucherCode);
        const hasDiscount = discountAmount > 0;
        const finalPrice = Math.max(0, currentCombo.price - discountAmount);
        const finalPriceFormatted = finalPrice.toLocaleString('vi-VN') + 'đ';

        cardContent = `
            <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 rounded-xl overflow-hidden decision-engine-glow transition-all duration-300 select-none">
                <div class="h-56 w-full relative overflow-hidden">
                    <img alt="${currentCombo.dishName}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500" src="${currentCombo.image}">
                    <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        ${currentCombo.tags.map(tag => `
                            <span class="bg-status-red text-white font-label-sm text-[10px] px-2.5 py-0.5 rounded-lg font-bold shadow-sm select-none">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="p-stack-md flex flex-col gap-4">
                    <div class="flex justify-between items-start">
                        <div class="flex-1 pr-2">
                            <h2 class="font-card-title text-base font-extrabold text-on-surface dark:text-white leading-tight">${currentCombo.dishName}</h2>
                            <div class="flex items-center gap-1 text-on-surface-variant dark:text-secondary-fixed-dim mt-1.5">
                                <span class="material-symbols-outlined text-[16px]">schedule</span>
                                <span class="font-body-md text-xs">${currentCombo.time} • ${currentCombo.status}</span>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            ${hasDiscount ? `
                                <span class="text-xs line-through text-on-surface-variant block">${priceFormatted}</span>
                                <span class="font-label-price text-base font-extrabold text-status-red block">${finalPriceFormatted}</span>
                            ` : `
                                <span class="font-label-price text-base font-extrabold text-primary dark:text-primary-fixed-dim block">${priceFormatted}</span>
                            `}
                        </div>
                    </div>
                    
                    <div class="bg-primary-fixed dark:bg-surface-container p-3 rounded-lg border-l-4 border-primary">
                        <p class="font-body-md text-xs text-on-primary-fixed dark:text-on-primary-container italic font-medium">"${currentCombo.reason}"</p>
                    </div>
                    
                    <button class="squishy-button w-full bg-primary-container hover:bg-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all" onclick="window.orderCombo('${currentCombo.id}')">
                        <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">shopping_cart</span>
                        Đặt combo này
                    </button>
                </div>
            </div>
        `;
    }

    return `
        <div class="pt-16 pb-12 max-w-md mx-auto animate-fade-in">
            <div class="mb-5 text-center select-none">
                <span class="inline-block px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container dark:bg-surface-variant dark:text-primary-fixed-dim font-bold text-[10px] uppercase tracking-wider mb-2 shadow-sm">
                    Quyết định trong 3 giây
                </span>
                <h1 class="font-section-title-mobile text-xl font-black text-on-surface dark:text-white">
                    Quán chọn cho bạn:<br>
                    <span class="text-primary dark:text-primary-fixed-dim font-black text-2xl">${isSpinning ? '...' : (currentCombo ? currentCombo.name : 'Chưa chọn')}</span>
                </h1>
            </div>

            <div class="relative group">
                ${cardContent}
            </div>

            <div class="mt-5 grid grid-cols-2 gap-3 select-none">
                <button class="squishy-button flex flex-col items-center justify-center p-3 border border-outline-variant/30 rounded-xl bg-surface-container-low dark:bg-surface-dim hover:bg-surface-container hover:text-primary dark:text-white transition-colors" 
                        onclick="window.spinDecisionEngine()" ${isSpinning ? 'disabled' : ''}>
                    <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim mb-1 ${isSpinning ? 'animate-spin' : ''}">refresh</span>
                    <span class="font-label-sm text-[11px] font-semibold">Gợi ý món khác</span>
                </button>
                <button class="squishy-button flex flex-col items-center justify-center p-3 border border-outline-variant/30 rounded-xl bg-surface-container-low dark:bg-surface-dim hover:bg-surface-container hover:text-primary dark:text-white transition-colors" 
                        onclick="window.location.hash = '#/menu'" ${isSpinning ? 'disabled' : ''}>
                    <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim mb-1">menu_book</span>
                    <span class="font-label-sm text-[11px] font-semibold">Xem toàn bộ menu</span>
                </button>
            </div>

            <div class="mt-6 p-4 rounded-xl border border-dashed border-outline-variant/40 dark:border-outline/30 bg-surface-container-highest dark:bg-surface-dim/40 select-none">
                <div class="flex gap-3">
                    <span class="material-symbols-outlined text-status-yellow shrink-0 text-xl" style="font-variation-settings: 'FILL' 1;">lightbulb</span>
                    <div>
                        <h4 class="font-label-sm text-xs font-bold text-on-surface dark:text-white">Mẹo nhỏ cho bạn</h4>
                        <p class="font-body-md text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5 leading-relaxed">Đặt ngay bây giờ để nhận món tại quầy số 3 mà không cần xếp hàng chờ đợi!</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderNotifications(state) {
    const activeTab = state.notificationTab || 'hoat-dong';
    const notificationsList = state.notifications.filter(n => n.type === activeTab);

    return `
        <div class="pt-16 pb-12 animate-fade-in select-none">
            <div class="sticky top-14 -mx-margin-mobile z-40 bg-surface dark:bg-inverse-surface border-b border-outline-variant/30 dark:border-outline/20 transition-all duration-300">
                <div class="flex w-full">
                    <button class="flex-1 py-4 text-center font-bold text-sm transition-all relative ${activeTab === 'hoat-dong' ? 'text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant dark:text-secondary-fixed-dim'}" 
                            onclick="window.switchNotificationTab('hoat-dong')">
                        Hoạt động
                        <div class="absolute bottom-0 left-0 w-full h-1 rounded-t-full transition-all duration-300 ${activeTab === 'hoat-dong' ? 'bg-primary dark:bg-primary-fixed-dim' : 'bg-transparent'}"></div>
                    </button>
                    <button class="flex-1 py-4 text-center font-bold text-sm transition-all relative ${activeTab === 'uu-dai' ? 'text-primary dark:text-primary-fixed-dim' : 'text-on-surface-variant dark:text-secondary-fixed-dim'}" 
                            onclick="window.switchNotificationTab('uu-dai')">
                        Ưu đãi
                        <div class="absolute bottom-0 left-0 w-full h-1 rounded-t-full transition-all duration-300 ${activeTab === 'uu-dai' ? 'bg-primary dark:bg-primary-fixed-dim' : 'bg-transparent'}"></div>
                    </button>
                </div>
            </div>

            <div class="py-5 space-y-4" id="notification-list-container">
                ${notificationsList.length === 0 ? `
                    <div class="py-12 text-center opacity-60 flex flex-col items-center">
                        <span class="material-symbols-outlined text-5xl mb-3 text-outline">notifications_off</span>
                        <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">Không có thông báo nào trong hộp thư của bạn.</p>
                    </div>
                ` : notificationsList.map(n => {
                    const unreadClass = n.unread 
                        ? 'border-primary dark:border-primary-fixed-dim bg-primary-fixed/20 dark:bg-primary-fixed/5' 
                        : 'border-outline-variant/30 dark:border-outline/10 bg-surface-container-low dark:bg-surface-dim';
                    
                    return `
                        <div class="p-4 rounded-xl flex gap-4 border ${unreadClass} relative active:scale-[0.98] transition-all cursor-pointer shadow-sm animate-fade-in"
                             onclick="window.readNotification('${n.id}')">
                            
                            ${n.icon === 'coupon_image' ? `
                                <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/30">
                                    <img alt="Promo" class="w-full h-full object-cover" src="${n.image}">
                                </div>
                            ` : `
                                <div class="w-12 h-12 rounded-full ${n.iconBg || 'bg-primary-fixed'} flex items-center justify-center flex-shrink-0 text-2xl">
                                    <span class="material-symbols-outlined ${n.iconColor || 'text-primary'}" style="font-variation-settings: 'FILL' 1;">${n.icon}</span>
                                </div>
                            `}

                            <div class="flex-grow space-y-2">
                                <div class="flex justify-between items-start">
                                    <h3 class="font-bold text-sm text-on-surface dark:text-white leading-snug">${n.title}</h3>
                                    <span class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim shrink-0 ml-2 font-medium">${n.time}</span>
                                </div>
                                <p class="text-on-surface-variant dark:text-secondary-fixed-dim text-xs leading-relaxed">${n.desc}</p>
                                
                                ${n.actionText ? `
                                    <button class="px-3.5 py-1 text-[11px] font-bold border border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim rounded-full hover:bg-primary/5 active:scale-95 transition-all mt-1"
                                            onclick="event.stopPropagation(); window.handleNotificationAction('${n.actionHash}', '${n.id}')">
                                        ${n.actionText}
                                    </button>
                                ` : ''}
                            </div>

                            ${n.unread ? `
                                <span class="absolute top-4 right-4 w-2 h-2 bg-status-red rounded-full shadow-sm badge-pulse"></span>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderMenu(state) {
    const activeCategory = state.menuFilter || 'all';
    const searchQuery = (state.menuSearch || '').toLowerCase().trim();

    let allItems = [];
    
    if (activeCategory === 'all' || activeCategory === 'combos') {
        combos.forEach(c => {
            allItems.push({
                id: c.id,
                name: c.name,
                subtitle: c.dishName,
                price: c.price,
                image: c.image,
                isCombo: true,
                category: 'combos'
            });
        });
    }

    singleItems.forEach(item => {
        if (activeCategory === 'all' || activeCategory === item.category) {
            allItems.push({
                id: item.id,
                name: item.name,
                subtitle: item.category === 'food' ? 'Món ăn chính' : 'Nước giải nhiệt',
                price: item.price,
                originalPrice: item.originalPrice,
                image: item.image,
                isCombo: false,
                category: item.category
            });
        }
    });

    if (searchQuery) {
        allItems = allItems.filter(item => 
            item.name.toLowerCase().includes(searchQuery) || 
            (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery))
        );
    }

    const cartCount = Object.values(state.cart).reduce((sum, q) => sum + q, 0);
    const cartTotal = calcCartSubtotal(state.cart);
    const { discount } = calcVoucherDiscount(state.cart, state.appliedVoucherCode);
    const finalTotal = Math.max(0, cartTotal - discount);

    return `
        <div class="pt-16 pb-24 animate-fade-in select-none">
            <div class="mb-4 relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-secondary-fixed-dim text-[20px]">search</span>
                <input class="w-full pl-10 pr-4 py-2.5 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/10 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface dark:text-white" 
                       id="menu-search-input" placeholder="Tìm món ngon sinh viên..." value="${state.menuSearch || ''}"
                       oninput="window.handleMenuSearch(this.value)">
                ${state.menuSearch ? `
                    <button class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-on-surface-variant" onclick="window.handleMenuSearch(''); document.getElementById('menu-search-input').value=''">close</button>
                ` : ''}
            </div>

            <div class="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none">
                <button class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 transition-all squishy-button ${activeCategory === 'all' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant dark:text-white'}" onclick="window.filterMenu('all')">Tất cả</button>
                <button class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 transition-all squishy-button ${activeCategory === 'combos' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant dark:text-white'}" onclick="window.filterMenu('combos')">Combo Tiết Kiệm</button>
                <button class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 transition-all squishy-button ${activeCategory === 'food' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant dark:text-white'}" onclick="window.filterMenu('food')">Món ăn chính</button>
                <button class="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border shrink-0 transition-all squishy-button ${activeCategory === 'drink' ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant dark:text-white'}" onclick="window.filterMenu('drink')">Nước uống</button>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-3">
                ${allItems.length === 0 ? `
                    <div class="col-span-2 py-12 text-center opacity-60 flex flex-col items-center">
                        <span class="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
                        <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">Không tìm thấy món ăn phù hợp với bộ lọc.</p>
                    </div>
                ` : allItems.map(item => {
                    const quantity = state.cart[item.id] || 0;
                    return `
                        <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/20 dark:border-outline/10 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group transition-all">
                            <div class="h-32 w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src="${item.image}">
                                ${item.isCombo ? `
                                    <span class="absolute top-2 left-2 bg-status-red text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">COMBO</span>
                                ` : ''}
                            </div>
                            
                            <div class="p-3 flex-1 flex flex-col justify-between">
                                <div class="mb-2">
                                    <h4 class="font-bold text-xs leading-snug text-on-surface dark:text-white line-clamp-1">${item.name}</h4>
                                    <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim line-clamp-1 mt-0.5">${item.subtitle}</p>
                                </div>
                                
                                <div class="flex justify-between items-center mt-auto pt-2 border-t border-outline-variant/10">
                                    <div class="flex flex-col items-start select-none">
                                        ${item.originalPrice ? `<span class="text-[9px] line-through text-on-surface-variant font-medium">${item.originalPrice.toLocaleString('vi-VN')}đ</span>` : ''}
                                        <span class="text-xs font-black text-primary dark:text-primary-fixed-dim">${item.price.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                    
                                    ${quantity > 0 ? `
                                        <div class="flex items-center gap-2">
                                            <button class="w-6 h-6 rounded-full border border-primary text-primary flex items-center justify-center font-bold active:scale-90 transition-transform hover:bg-primary/5 shrink-0 select-none" onclick="window.updateCartQuantity('${item.id}', -1)">-</button>
                                            <span class="text-xs font-bold text-on-surface dark:text-white min-w-[12px] text-center select-none">${quantity}</span>
                                            <button class="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold active:scale-90 transition-transform hover:bg-primary-container shrink-0 select-none" onclick="window.updateCartQuantity('${item.id}', 1)">+</button>
                                        </div>
                                    ` : `
                                        <button class="squishy-button w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center hover:bg-primary shadow-sm" onclick="window.updateCartQuantity('${item.id}', 1)">
                                            <span class="material-symbols-outlined text-[18px]">add</span>
                                        </button>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            ${cartCount > 0 ? `
                <div class="absolute bottom-16 left-0 w-full px-4 py-3 bg-surface-container-lowest/90 dark:bg-inverse-surface/95 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40 transition-all select-none animate-slide-up">
                    <div class="max-w-md mx-auto flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="relative">
                                <span class="material-symbols-outlined text-primary text-3xl">shopping_bag</span>
                                <span class="absolute -top-1 -right-1 bg-status-red text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm badge-pulse">${cartCount}</span>
                            </div>
                            <div>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim">Tổng thanh toán</p>
                                <div class="flex items-center gap-1.5">
                                    <p class="text-base font-black text-primary dark:text-primary-fixed-dim">${finalTotal.toLocaleString('vi-VN')}đ</p>
                                    ${discount > 0 ? `
                                        <span class="px-1.5 py-0.5 bg-status-red/10 text-status-red rounded text-[9px] font-bold border border-status-red/20">-${discount.toLocaleString('vi-VN')}đ</span>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        <button class="squishy-button bg-primary-container hover:bg-primary text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md text-xs flex items-center gap-1.5" onclick="window.checkoutCart()">
                            Đặt Hàng Ngay
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function renderOrders(state) {
    const activeOrders = state.orders.filter(o => o.status !== 'completed');
    const completedOrders = state.orders.filter(o => o.status === 'completed');

    return `
        <div class="pt-16 pb-12 animate-fade-in select-none">
            <div class="mb-6 select-none">
                <h2 class="font-section-title-mobile text-section-title-mobile text-on-surface dark:text-white mb-1.5">Đơn hàng của bạn</h2>
                <p class="font-body-md text-sm text-on-surface-variant dark:text-secondary-fixed-dim">Theo dõi tiến độ chuẩn bị món ăn tại quầy số 3.</p>
            </div>

            <section class="mb-8">
                <h3 class="font-bold text-[16px] text-primary dark:text-primary-fixed-dim mb-4 select-none">Đơn hàng đang chế biến</h3>
                
                <div class="grid gap-4">
                    ${activeOrders.length === 0 ? `
                        <div class="p-8 border border-dashed border-outline-variant dark:border-outline/30 rounded-2xl flex flex-col items-center text-center opacity-60">
                            <span class="material-symbols-outlined text-4xl mb-2 text-outline">receipt_long</span>
                            <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim font-medium">Bạn không có đơn hàng nào đang chế biến.</p>
                            <button class="mt-4 bg-primary-container text-white px-4 py-2 rounded-full font-bold text-xs hover:bg-primary transition-all squishy-button" onclick="window.location.hash = '#/menu'">Đặt món ngay</button>
                        </div>
                    ` : activeOrders.map(order => {
                        let statusColor = 'text-status-yellow';
                        let percentage = '30%';
                        let statusDesc = 'Đang chế biến';

                        if (order.step === 1) {
                            statusColor = 'text-status-yellow';
                            percentage = '15%';
                            statusDesc = 'Đang chuẩn bị nguyên liệu';
                        } else if (order.step === 2) {
                            statusColor = 'text-primary-container';
                            percentage = '60%';
                            statusDesc = 'Đang nấu trên bếp';
                        } else if (order.step === 3) {
                            statusColor = 'text-status-green';
                            percentage = '95%';
                            statusDesc = 'Đang chờ nhận tại Quầy số 3';
                        }

                        return `
                            <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-xl p-4 shadow-sm space-y-3">
                                <div class="flex justify-between items-start pb-2 border-b border-outline-variant/10">
                                    <div>
                                        <span class="text-xs font-mono font-bold text-on-surface-variant dark:text-secondary-fixed-dim">${order.id}</span>
                                        <h4 class="font-bold text-sm text-on-surface dark:text-white mt-1">${order.itemName}</h4>
                                    </div>
                                    <span class="text-xs font-bold ${statusColor}">${statusDesc}</span>
                                </div>
                                
                                <div class="space-y-1">
                                    <div class="flex justify-between text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim font-semibold">
                                        <span>Tiến độ món ăn</span>
                                        <span>${percentage}</span>
                                    </div>
                                    <div class="w-full bg-surface-container-low dark:bg-black/20 h-2 rounded-full overflow-hidden">
                                        <div class="bg-primary-container h-full rounded-full transition-all duration-1000" style="width: ${percentage}"></div>
                                    </div>
                                </div>
                                
                                <div class="flex justify-between items-center text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim pt-2">
                                    <span>Thời gian đặt: ${order.time}</span>
                                    <span class="font-bold text-primary dark:text-primary-fixed-dim">${order.price.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </section>

            <section class="mb-6">
                <h3 class="font-bold text-[16px] text-on-surface-variant dark:text-secondary-fixed-dim mb-4 opacity-75 select-none">Đơn hàng đã nhận</h3>
                
                <div class="grid gap-4 select-none">
                    ${completedOrders.map(order => `
                        <div class="bg-surface-container-low dark:bg-surface-variant/10 border border-outline-variant/20 rounded-xl p-4 flex justify-between items-center opacity-80 animate-fade-in">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-mono font-semibold text-on-surface-variant">${order.id}</span>
                                    <span class="px-1.5 py-0.5 bg-status-green/10 text-status-green border border-status-green/20 rounded text-[9px] font-bold">Thành công</span>
                                </div>
                                <h4 class="font-bold text-sm text-on-surface dark:text-white mt-1.5">${order.itemName}</h4>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">Thời gian: ${order.time}</p>
                            </div>
                            <div class="text-right">
                                <span class="font-black text-xs text-on-surface dark:text-white block">${order.price.toLocaleString('vi-VN')}đ</span>
                                <button class="mt-2 text-[10px] font-bold border border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim px-2.5 py-1 rounded-full active:scale-95 transition-all squishy-button" onclick="window.reorderItem('${order.id}')">Đặt lại</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
}

function renderAuthPage(state) {
    const activeTab = state.authTab || 'login';
    
    return `
        <div class="pt-16 pb-12 animate-fade-in select-none">
            <div class="text-center mb-6">
                <span class="material-symbols-outlined text-[64px] text-primary dark:text-primary-fixed-dim leading-none mb-2">account_circle</span>
                <h2 class="font-hero-mobile text-3xl text-primary dark:text-primary-fixed-dim">Sinh Viên Quán</h2>
                <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim mt-1">Đăng nhập tài khoản để đặt món & tích điểm</p>
            </div>
            
            <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 rounded-2xl p-5 shadow-sm space-y-4">
                <!-- Tabs -->
                <div class="flex border-b border-outline-variant/20 pb-2">
                    <button class="flex-1 text-center font-bold text-sm py-2 ${activeTab === 'login' ? 'text-primary border-b-2 border-primary dark:text-primary-fixed-dim dark:border-primary-fixed-dim' : 'text-on-surface-variant/60'}" onclick="window.setAuthTab('login')">
                        Đăng nhập
                    </button>
                    <button class="flex-1 text-center font-bold text-sm py-2 ${activeTab === 'register' ? 'text-primary border-b-2 border-primary dark:text-primary-fixed-dim dark:border-primary-fixed-dim' : 'text-on-surface-variant/60'}" onclick="window.setAuthTab('register')">
                        Đăng ký
                    </button>
                </div>
                
                ${activeTab === 'login' ? `
                    <!-- Login Form -->
                    <div class="space-y-4" id="login-form">
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Email sinh viên</label>
                            <input type="email" id="auth-email" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="name@student.edu.vn">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mật khẩu</label>
                            <input type="password" id="auth-password" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="••••••••">
                        </div>
                        <button class="w-full h-12 bg-primary hover:bg-primary-container text-white font-bold rounded-xl active:scale-[0.98] transition-transform text-xs shadow-md mt-2 flex items-center justify-center gap-2" onclick="window.submitAuthLogin()">
                            <span>Đăng nhập ngay</span>
                        </button>
                    </div>
                ` : `
                    <!-- Register Form -->
                    <div class="space-y-4" id="register-form">
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Họ và Tên</label>
                            <input type="text" id="reg-name" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="Nguyễn Văn A">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Email sinh viên</label>
                            <input type="email" id="reg-email" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="a.nv123@student.iuh.edu.vn">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mật khẩu (tối thiểu 6 ký tự)</label>
                            <input type="password" id="reg-password" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="••••••••">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Mã số sinh viên (MSSV)</label>
                            <input type="text" id="reg-mssv" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" placeholder="12345678">
                        </div>
                        <div class="space-y-1">
                            <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Trường Đại học</label>
                            <input type="text" id="reg-univ" class="w-full bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white" value="Trường Đại học Công Nghiệp - IUH">
                        </div>
                        <button class="w-full h-12 bg-primary hover:bg-primary-container text-white font-bold rounded-xl active:scale-[0.98] transition-transform text-xs shadow-md mt-2 flex items-center justify-center gap-2" onclick="window.submitAuthRegister()">
                            <span>Đăng ký tài khoản</span>
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderProfile(state) {
    if (!state.user) {
        return renderAuthPage(state);
    }
    
    const profile = state.profile || { name: "Người dùng IUH", mssv: "Chưa cập nhật", university: "Đại học Công Nghiệp - IUH", point_balance: 0 };
    const addresses = state.addresses || [];
    
    const pointTransactions = [
        { desc: "Chào mừng thành viên mới!", pts: "+0", date: "Vừa xong" }
    ];

    let tier = "HẠNG ĐỒNG";
    let badgeColor = "bg-gray-400 text-white";
    if (profile.point_balance >= 1500) {
        tier = "KIM CƯƠNG";
        badgeColor = "bg-status-red text-white";
    } else if (profile.point_balance >= 500) {
        tier = "HẠNG VÀNG";
        badgeColor = "bg-status-yellow text-on-primary-fixed";
    }

    const progressPercent = Math.min(100, (profile.point_balance / 1500) * 100);

    return `
        <div class="pt-16 pb-12 animate-fade-in select-none">
            <!-- Profile header card -->
            <div class="flex items-center gap-4 p-4 bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 rounded-2xl shadow-sm mb-6 select-none">
                <div class="w-16 h-16 rounded-full overflow-hidden bg-primary-container border-2 border-primary shadow-sm shrink-0 flex items-center justify-center text-white">
                    <span class="material-symbols-outlined text-4xl">account_circle</span>
                </div>
                <div>
                    <h2 class="font-bold text-lg text-primary dark:text-primary-fixed-dim">${profile.name}</h2>
                    <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim">MSSV: ${profile.mssv} • ${profile.university}</p>
                    <div class="flex gap-2 items-center mt-1">
                        <span class="px-2.5 py-0.5 ${badgeColor} text-[10px] font-black rounded-full shadow-sm">${tier}</span>
                        <span class="text-xs font-bold text-primary dark:text-primary-fixed-dim">${profile.point_balance} PTS</span>
                    </div>
                </div>
            </div>

            <!-- Tier Level Progress -->
            <section class="mb-6 bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-2xl p-4 shadow-sm space-y-3 select-none">
                <div class="flex justify-between items-center text-xs">
                    <span class="font-bold text-on-surface dark:text-white">Thăng hạng Kim Cương</span>
                    <span class="text-on-surface-variant dark:text-secondary-fixed-dim font-bold">${profile.point_balance} / 1500 PTS</span>
                </div>
                
                <!-- Progress bar -->
                <div class="w-full bg-surface-container-low dark:bg-black/20 h-2 rounded-full overflow-hidden">
                    <div class="bg-gradient-to-r from-primary to-primary-container h-full rounded-full" style="width: ${progressPercent}%"></div>
                </div>
                
                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim italic leading-relaxed">Đạt thêm ${Math.max(0, 1500 - profile.point_balance)} PTS để thăng hạng Kim Cương và nhận voucher giảm giá 50% miễn phí hàng tháng!</p>
            </section>

            <!-- Loyalty Point Transactions -->
            <section class="mb-6 select-none">
                <h3 class="font-bold text-[15px] text-primary dark:text-primary-fixed-dim mb-3">Lịch sử tích lũy</h3>
                <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-2xl p-3 divide-y divide-outline-variant/10">
                    ${pointTransactions.map(t => `
                        <div class="flex justify-between items-center py-2.5 first:pt-1 last:pb-1">
                            <div>
                                <h4 class="font-bold text-xs text-on-surface dark:text-white">${t.desc}</h4>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">${t.date}</p>
                            </div>
                            <span class="text-xs font-black text-status-green">${t.pts} PTS</span>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Saved Addresses -->
            <section class="mb-6 select-none">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold text-[15px] text-primary dark:text-primary-fixed-dim">Địa chỉ đã lưu</h3>
                    <button class="text-xs font-bold text-primary hover:text-primary-container shrink-0 flex items-center gap-0.5" onclick="window.addMockAddress()">
                        <span class="material-symbols-outlined text-sm">add</span> Thêm
                    </button>
                </div>
                
                <div class="grid gap-3" id="address-list-root">
                    ${addresses.length === 0 ? `
                        <p class="text-xs text-on-surface-variant/60 text-center py-4">Chưa có địa chỉ nào được lưu.</p>
                    ` : addresses.map(a => `
                        <div class="p-3 border border-outline-variant/30 dark:border-outline/10 bg-surface-container-lowest dark:bg-surface-dim rounded-xl flex gap-3 shadow-sm select-none">
                            <span class="material-symbols-outlined text-primary text-xl shrink-0">location_on</span>
                            <div class="flex-grow space-y-1">
                                <div class="flex items-center gap-2">
                                    <h4 class="font-bold text-xs text-on-surface dark:text-white">${a.label}</h4>
                                    ${a.is_default ? `<span class="px-1.5 py-0.5 bg-status-green/10 text-status-green border border-status-green/20 rounded text-[9px] font-bold shrink-0">Mặc định</span>` : ''}
                                </div>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">${a.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>

            <!-- Logout button -->
            <button class="w-full h-12 border border-outline-variant/50 text-on-surface hover:bg-surface-container-low font-bold rounded-xl active:scale-[0.98] transition-transform text-xs shadow-sm mt-4 flex items-center justify-center gap-2 dark:text-white dark:border-outline/20" onclick="window.handleSupabaseLogout()">
                <span class="material-symbols-outlined text-sm">logout</span>
                <span>Đăng xuất tài khoản</span>
            </button>
        </div>
    `;
}

function renderAdminPage(state) {
    const activeTab = state.adminTab || 'orders';
    const orders = state.adminOrders || [];
    const products = state.adminProducts || [];

    let contentHTML = '';
    if (activeTab === 'orders') {
        contentHTML = `
            <div class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center select-none">
                    <h3 class="font-bold text-[14px] text-primary">Danh sách đơn hàng (${orders.length})</h3>
                    <button class="text-xs bg-primary-container hover:bg-primary text-white px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 select-none squishy-button" onclick="window.refreshAdminData()">
                        <span class="material-symbols-outlined text-xs">refresh</span> Tải lại
                    </button>
                </div>
                
                <div class="grid gap-3 select-none">
                    ${orders.length === 0 ? `
                        <div class="p-8 border border-dashed border-outline-variant dark:border-outline/30 rounded-2xl flex flex-col items-center text-center opacity-60">
                            <span class="material-symbols-outlined text-3xl mb-2 text-outline">receipt_long</span>
                            <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim font-medium">Chưa có đơn hàng nào trên hệ thống.</p>
                        </div>
                    ` : orders.map(order => {
                        const itemsList = order.order_items.map(oi => {
                            const name = oi.products ? oi.products.name : 'Món ăn';
                            return `${name} x${oi.quantity}`;
                        }).join(', ');

                        const date = new Date(order.created_at);
                        const timeFormatted = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} ${date.toLocaleDateString('vi-VN')}`;
                        
                        let badgeColor = 'bg-status-yellow/20 text-status-brown border-status-yellow/30';
                        if (order.order_status === 'PREPARING') badgeColor = 'bg-primary-fixed/30 text-primary border-primary/20';
                        if (order.order_status === 'READY') badgeColor = 'bg-status-green/20 text-status-green border-status-green/30';
                        if (order.order_status === 'COMPLETED') badgeColor = 'bg-gray-100 text-gray-500 border-gray-200';
                        if (order.order_status === 'CANCELLED') badgeColor = 'bg-status-red/10 text-status-red border-status-red/20';

                        return `
                            <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-xl p-4 shadow-sm space-y-3">
                                <div class="flex justify-between items-start pb-2 border-b border-outline-variant/10">
                                    <div>
                                        <span class="text-xs font-mono font-bold text-primary">${order.id}</span>
                                        <div class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">
                                            Khách: ${order.profiles?.name || 'Khách vãng lai'} (${order.profiles?.mssv || 'N/A'})
                                        </div>
                                    </div>
                                    <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}">${order.order_status}</span>
                                </div>
                                
                                <div class="text-xs font-semibold text-on-surface dark:text-white">${itemsList}</div>
                                <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed">Địa chỉ: ${order.delivery_address}</p>
                                ${order.notes ? `<p class="text-[10px] bg-surface-container-low dark:bg-surface-variant/20 p-2 rounded text-status-brown dark:text-secondary-fixed-dim italic">Ghi chú: "${order.notes}"</p>` : ''}
                                
                                <div class="flex justify-between items-center pt-2 border-t border-outline-variant/10 text-[10px]">
                                    <span class="text-on-surface-variant/70">Đặt lúc: ${timeFormatted} • Thanh toán: ${order.payment_method.toUpperCase()} (${order.payment_status})</span>
                                    <span class="font-bold text-xs text-primary">${order.final_amount.toLocaleString('vi-VN')}đ</span>
                                </div>

                                <!-- Actions buttons -->
                                <div class="flex gap-2 pt-2 justify-end">
                                    ${order.order_status === 'PENDING' ? `
                                        <button class="bg-primary-container text-white px-2.5 py-1 rounded text-[10px] font-bold hover:bg-primary active:scale-95 transition-all squishy-button" onclick="window.updateOrderStatus('${order.id}', 'PREPARING')">Nhận đơn (Nấu)</button>
                                    ` : ''}
                                    ${order.order_status === 'PREPARING' ? `
                                        <button class="bg-status-green text-white px-2.5 py-1 rounded text-[10px] font-bold hover:opacity-95 active:scale-95 transition-all squishy-button" onclick="window.updateOrderStatus('${order.id}', 'READY')">Nấu xong (Sẵn sàng)</button>
                                    ` : ''}
                                    ${order.order_status === 'READY' ? `
                                        <button class="bg-gray-500 text-white px-2.5 py-1 rounded text-[10px] font-bold hover:opacity-95 active:scale-95 transition-all squishy-button" onclick="window.updateOrderStatus('${order.id}', 'COMPLETED')">Đã lấy món (Hoàn thành)</button>
                                    ` : ''}
                                    ${order.order_status !== 'COMPLETED' && order.order_status !== 'CANCELLED' ? `
                                        <button class="border border-status-red text-status-red px-2.5 py-1 rounded text-[10px] font-bold hover:bg-status-red/5 active:scale-95 transition-all squishy-button" onclick="window.updateOrderStatus('${order.id}', 'CANCELLED')">Hủy đơn</button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    } else {
        // Products tab
        contentHTML = `
            <div class="space-y-4 animate-fade-in">
                <div class="flex justify-between items-center select-none">
                    <h3 class="font-bold text-[14px] text-primary">Quản lý kho hàng (${products.length})</h3>
                </div>
                
                <div class="grid gap-3 select-none">
                    ${products.map(prod => `
                        <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/20 rounded-xl p-3 shadow-sm flex gap-3 items-center">
                            <img class="w-12 h-12 rounded-lg object-cover border border-outline-variant/10 shrink-0" src="${prod.image_url}" alt="${prod.name}">
                            <div class="flex-grow">
                                <h4 class="font-bold text-xs text-on-surface dark:text-white leading-tight">${prod.name}</h4>
                                <p class="text-[10px] text-primary font-bold mt-0.5">${prod.price.toLocaleString('vi-VN')}đ</p>
                            </div>
                            <div class="flex items-center gap-1 border border-outline-variant/30 dark:border-outline/20 bg-surface-container rounded-lg p-1 shrink-0">
                                <button class="text-primary font-bold text-xs px-1.5 active:scale-90" onclick="window.changeProductStock('${prod.id}', -5)">-5</button>
                                <button class="text-primary font-bold text-xs px-1 active:scale-90" onclick="window.changeProductStock('${prod.id}', -1)">-</button>
                                <span class="font-bold text-xs w-6 text-center dark:text-white">${prod.stock_quantity}</span>
                                <button class="text-primary font-bold text-xs px-1 active:scale-90" onclick="window.changeProductStock('${prod.id}', 1)">+</button>
                                <button class="text-primary font-bold text-xs px-1.5 active:scale-90" onclick="window.changeProductStock('${prod.id}', 5)">+5</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    return `
        <div class="pt-16 pb-24 max-w-md mx-auto animate-fade-in select-none">
            <div class="mb-5 text-center select-none">
                <h2 class="font-hero-mobile text-2xl text-primary leading-tight">Quản trị Sinh Viên Quán</h2>
                <p class="text-[11px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">Quản lý đơn hàng và trạng thái kho hàng trực tiếp từ Dashboard</p>
            </div>
            
            <!-- Admin Tabs -->
            <div class="flex border-b border-outline-variant/20 pb-2 mb-4 sticky top-14 bg-surface dark:bg-inverse-surface z-40">
                <button class="flex-1 text-center font-bold text-xs py-2 ${activeTab === 'orders' ? 'text-primary border-b-2 border-primary dark:text-primary-fixed-dim dark:border-primary-fixed-dim' : 'text-on-surface-variant/60'}" onclick="window.setAdminTab('orders')">
                    Đơn hàng (${orders.filter(o => o.order_status !== 'COMPLETED' && o.order_status !== 'CANCELLED').length} Đang chạy)
                </button>
                <button class="flex-1 text-center font-bold text-xs py-2 ${activeTab === 'products' ? 'text-primary border-b-2 border-primary dark:text-primary-fixed-dim dark:border-primary-fixed-dim' : 'text-on-surface-variant/60'}" onclick="window.setAdminTab('products')">
                    Kho hàng & Món ăn
                </button>
            </div>

            ${contentHTML}
        </div>
    `;
}

// ==========================================
// 5. APPLICATION FLOW & RENDER LOOP
// ==========================================

// --- Screen 11: Added to Cart Successful Sheet ---
function renderAddToCartSheet(state) {
    if (!state.addedItemSheet) return '';
    
    const itemId = state.addedItemSheet;
    const item = combos.find(c => c.id === itemId) || singleItems.find(i => i.id === itemId);
    if (!item) return '';

    const cartCount = Object.values(state.cart).reduce((sum, q) => sum + q, 0);
    const quantity = state.cart[itemId] || 0;
    const priceFormatted = item.price.toLocaleString('vi-VN') + 'đ';

    return `
        <!-- Background Sematic Dark Overlay -->
        <div class="absolute inset-0 bg-on-surface/40 z-[90] backdrop-blur-sm transition-opacity duration-300" onclick="window.closeAddedSheet()"></div>
        
        <!-- Bottom Sheet -->
        <div class="absolute inset-x-0 bottom-0 z-[95] transform translate-y-0 transition-transform duration-500 ease-out">
            <div class="max-w-xl mx-auto bg-surface-container-lowest dark:bg-inverse-surface rounded-t-[32px] bottom-sheet-shadow overflow-hidden flex flex-col border-t border-outline-variant/20">
                <!-- Handle -->
                <div class="flex justify-center pt-3 pb-1">
                    <div class="w-10 h-1.5 bg-outline-variant rounded-full opacity-50"></div>
                </div>
                <!-- Header -->
                <div class="px-margin-mobile py-stack-sm flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="text-secondary dark:text-secondary-fixed-dim flex items-center">
                            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                        </span>
                        <span class="font-label-sm text-xs font-bold text-secondary dark:text-secondary-fixed-dim uppercase tracking-wider">✓ Đã thêm thành công</span>
                    </div>
                    <button class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container-high dark:bg-surface-variant/30 active:scale-95 transition-transform" onclick="window.closeAddedSheet()">
                        <span class="material-symbols-outlined text-on-surface-variant dark:text-white text-[18px]">close</span>
                    </button>
                </div>
                <!-- Main Content Area -->
                <div class="px-margin-mobile pb-36 overflow-y-auto max-h-[50vh] space-y-6">
                    <!-- Added Item Card (Bento Style) -->
                    <div class="bg-surface-container-low dark:bg-surface-dim p-stack-md rounded-xl border border-outline-variant/30 flex gap-stack-md items-start mt-2">
                        <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                            <img alt="${item.name || item.dishName}" class="w-full h-full object-cover" src="${item.image}">
                        </div>
                        <div class="flex-1 flex flex-col justify-between h-full">
                            <div>
                                <h3 class="font-bold text-sm text-on-surface dark:text-white leading-tight">${item.name || item.dishName}</h3>
                                <div class="flex flex-wrap gap-2 mt-1">
                                    <span class="bg-surface-container-highest dark:bg-surface-variant/40 px-2 py-0.5 rounded-full text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim font-medium">Mặc định</span>
                                </div>
                            </div>
                            <div class="flex items-center justify-between mt-3">
                                <span class="font-label-price text-xs font-extrabold text-primary dark:text-primary-fixed-dim">${priceFormatted}</span>
                                <div class="flex items-center bg-surface-container-highest dark:bg-surface-variant/50 rounded-lg px-2 py-1 gap-3">
                                    <span class="material-symbols-outlined text-[16px] text-on-surface-variant dark:text-white active:scale-90 transition-transform cursor-pointer" onclick="window.updateCartQuantity('${item.id}', -1)">remove</span>
                                    <span class="font-label-sm text-xs w-4 text-center dark:text-white">${quantity}</span>
                                    <span class="material-symbols-outlined text-[16px] text-primary dark:text-primary-fixed-dim active:scale-90 transition-transform cursor-pointer" onclick="window.updateCartQuantity('${item.id}', 1)">add</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Upsell Section -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between">
                            <h4 class="font-bold text-xs text-on-surface dark:text-white uppercase tracking-wider">Có thể bạn muốn thêm</h4>
                            <span class="text-primary dark:text-primary-fixed-dim text-xs font-bold hover:underline cursor-pointer" onclick="window.location.hash = '#/menu'; window.closeAddedSheet()">Xem tất cả</span>
                        </div>
                        <div class="bento-grid">
                            <!-- Recommendation 1: Trà tắc -->
                            <div class="bg-surface dark:bg-surface-dim p-3 rounded-xl border border-outline-variant/20 flex flex-col justify-between select-none">
                                <div>
                                    <div class="aspect-square rounded-lg overflow-hidden mb-2">
                                        <img alt="Trà Tắc" class="w-full h-full object-cover" src="https://i.ibb.co/G35GkzS4/Tr-T-c.jpg">
                                    </div>
                                    <h5 class="font-bold text-xs text-on-surface dark:text-white truncate">Trà Tắc Giải Nhiệt</h5>
                                </div>
                                <div class="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/10">
                                    <span class="text-xs font-extrabold text-primary dark:text-primary-fixed-dim">25.000đ</span>
                                    <button class="w-6 h-6 flex items-center justify-center rounded-full bg-primary hover:bg-primary-container text-white active:scale-95 transition-transform" onclick="window.addUpsellItem('drink-5', 'Trà Tắc Giải Nhiệt')">
                                        <span class="material-symbols-outlined text-[16px]">add</span>
                                    </button>
                                </div>
                            </div>
                            <!-- Recommendation 2: Sâm lục vị -->
                            <div class="bg-surface dark:bg-surface-dim p-3 rounded-xl border border-outline-variant/20 flex flex-col justify-between select-none">
                                <div>
                                    <div class="aspect-square rounded-lg overflow-hidden mb-2">
                                        <img alt="Sâm Lục Vị" class="w-full h-full object-cover" src="https://i.ibb.co/67Q4HTGR/S-m-L-c-V-M-t-Gan.jpg">
                                    </div>
                                    <h5 class="font-bold text-xs text-on-surface dark:text-white truncate">Sâm Lục Vị Mát Gan</h5>
                                </div>
                                <div class="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/10">
                                    <span class="text-xs font-extrabold text-primary dark:text-primary-fixed-dim">20.000đ</span>
                                    <button class="w-6 h-6 flex items-center justify-center rounded-full bg-primary hover:bg-primary-container text-white active:scale-95 transition-transform" onclick="window.addUpsellItem('drink-2', 'Sâm Lục Vị Mát Gan')">
                                        <span class="material-symbols-outlined text-[16px]">add</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Fixed Bottom Buttons -->
                <div class="absolute bottom-0 left-0 right-0 p-margin-mobile bg-surface-container-lowest/90 dark:bg-inverse-surface/95 backdrop-blur-md border-t border-outline-variant/10 flex flex-col gap-2.5">
                    <button class="w-full h-12 bg-primary hover:bg-primary-container text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md text-sm select-none" onclick="window.location.hash = '#/cart'; window.closeAddedSheet()">
                        Xem giỏ hàng
                        <span class="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold">${cartCount}</span>
                    </button>
                    <button class="w-full h-12 border-2 border-primary text-primary dark:border-primary-fixed-dim dark:text-primary-fixed-dim rounded-xl font-bold flex items-center justify-center active:scale-[0.98] transition-all bg-transparent text-sm select-none" onclick="window.closeAddedSheet()">
                        Tiếp tục chọn món
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- Screen 12: Cart Page Renderer ---
function renderCartPage(state) {
    const cartEntries = Object.entries(state.cart);
    const cartCount = Object.values(state.cart).reduce((sum, q) => sum + q, 0);

    if (cartCount === 0) {
        return `
            <div class="pt-16 pb-12 text-center py-20 flex flex-col items-center justify-center animate-fade-in select-none">
                <span class="material-symbols-outlined text-6xl text-outline mb-4">shopping_cart_off</span>
                <h3 class="font-bold text-lg text-on-surface dark:text-white">Giỏ hàng của bạn đang trống!</h3>
                <p class="text-xs text-on-surface-variant dark:text-secondary-fixed-dim mt-1.5 max-w-[240px] leading-relaxed">Hãy quay lại trang Thực đơn để chọn những món ăn ngon sinh viên nhé.</p>
                <button class="mt-6 squishy-button bg-primary text-white font-bold px-6 py-2.5 rounded-xl shadow-md text-xs" onclick="window.location.hash = '#/menu'">
                    Gọi món ngay
                </button>
            </div>
        `;
    }

    let cartTotal = 0;
    const cartItemsHTML = cartEntries.map(([itemId, qty]) => {
        const item = combos.find(c => c.id === itemId) || singleItems.find(i => i.id === itemId);
        if (!item) return '';

        const itemTotal = item.price * qty;
        cartTotal += itemTotal;

        // Custom selections label mock
        const isDrink = item.category === 'drink' || (item.dishName && item.dishName.includes('Trà'));
        const optionsHTML = isDrink
            ? `<span class="inline-block bg-surface-container dark:bg-surface-variant/40 px-2 py-0.5 rounded text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim font-medium select-none">Mặc định</span>`
            : `
                <span class="inline-block bg-surface-container dark:bg-surface-variant/40 px-2 py-0.5 rounded text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim font-medium select-none">Thêm trứng +7.000đ</span>
                <span class="inline-block bg-surface-container dark:bg-surface-variant/40 px-2 py-0.5 rounded text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim font-medium select-none">Ít cay</span>
            `;

        return `
            <!-- Cart Item -->
            <div class="bg-surface-container-lowest dark:bg-surface-dim p-stack-md rounded-xl border border-outline-variant/20 dark:border-outline/10 shadow-sm flex gap-stack-md select-none animate-fade-in">
                <img alt="${item.name || item.dishName}" class="w-20 h-20 rounded-lg object-cover border border-outline-variant/10 shrink-0" src="${item.image}">
                <div class="flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-sm text-on-surface dark:text-white leading-tight line-clamp-1">${item.name || item.dishName}</h3>
                            <div class="flex gap-1 -mt-1 shrink-0">
                                <button class="p-1 hover:bg-surface-container-high rounded-full transition-colors active:scale-90" onclick="showToast('Tính năng tùy chỉnh món sẽ mở khi gọi món!', 'info')"><span class="material-symbols-outlined text-[16px] text-on-surface-variant dark:text-white">edit</span></button>
                                <button class="p-1 hover:bg-error-container/20 rounded-full transition-colors active:scale-90" onclick="window.updateCartQuantity('${item.id}', -${qty})"><span class="material-symbols-outlined text-[16px] text-status-red">delete</span></button>
                            </div>
                        </div>
                        <div class="space-y-1 mt-1 flex flex-wrap gap-1">
                            ${optionsHTML}
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-end mt-3">
                        <span class="font-label-price text-sm font-extrabold text-primary dark:text-primary-fixed-dim">${item.price.toLocaleString('vi-VN')}đ</span>
                        <div class="flex items-center bg-surface-container dark:bg-surface-variant/50 px-3 py-1 rounded-full border border-outline-variant/20">
                            <button class="text-primary dark:text-primary-fixed-dim font-bold active:scale-90 transition-transform mr-2.5" onclick="window.updateCartQuantity('${item.id}', -1)">-</button>
                            <span class="font-bold text-on-surface dark:text-white text-xs">${qty}</span>
                            <button class="text-primary dark:text-primary-fixed-dim font-bold active:scale-90 transition-transform ml-2.5" onclick="window.updateCartQuantity('${item.id}', 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const { prepFee, discount, finalTotal } = calcOrderTotals(state.cart, state.appliedVoucherCode);
    const voucherLabelHTML = getVoucherLabel(state.appliedVoucherCode, discount);

    return `
        <div class="pt-16 pb-32 animate-fade-in select-none">
            <!-- Branch Info banner -->
            <section class="bg-surface-container-low dark:bg-surface-dim p-4 rounded-xl flex items-start gap-stack-md border border-outline-variant/30 dark:border-outline/10 select-none">
                <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim mt-0.5">location_on</span>
                <div class="flex-grow">
                    <h3 class="font-bold text-xs text-on-surface dark:text-white">Sinh Viên Quán — Căn tin IUH</h3>
                    <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">Thời gian nhận hàng ước tính: 10–15 phút</p>
                </div>
                <button class="text-primary dark:text-primary-fixed-dim text-xs font-bold hover:underline" onclick="showToast('Đã tự động chọn Chi nhánh Căn tin Công nghiệp - IUH!', 'info')">Thay đổi</button>
            </section>

            <!-- DineOption switch tab -->
            <div class="bg-surface-container-high dark:bg-surface-variant/40 p-1 rounded-xl flex mt-4 select-none">
                <button class="flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all duration-200 ${state.dineOption === 'eat-in' ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant dark:text-secondary-fixed-dim'}" 
                        onclick="window.setDineOption('eat-in')">Ăn tại quán</button>
                <button class="flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all duration-200 ${state.dineOption === 'take-away' ? 'bg-primary-container text-white shadow-sm' : 'text-on-surface-variant dark:text-secondary-fixed-dim'}" 
                        onclick="window.setDineOption('take-away')">Mang đi</button>
            </div>

            <!-- Cart list -->
            <div class="mt-6 space-y-4">
                <div class="flex items-center justify-between select-none">
                    <h2 class="font-bold text-[15px] text-on-surface dark:text-white">Món đã chọn</h2>
                    <button class="text-primary dark:text-primary-fixed-dim text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer" onclick="window.location.hash = '#/menu'">
                        <span class="material-symbols-outlined text-[16px]">add_circle</span>
                        Thêm món khác
                    </button>
                </div>
                
                <div class="space-y-3">
                    ${cartItemsHTML}
                </div>
            </div>

            <!-- Notes Section -->
            <section class="mt-6 space-y-2 select-none">
                <h2 class="font-bold text-[15px] text-on-surface dark:text-white px-1">Ghi chú cho bếp</h2>
                <div class="relative">
                    <textarea class="w-full bg-surface-container-low dark:bg-surface-dim border-none rounded-xl p-4 text-xs text-on-surface dark:text-white placeholder:text-on-surface-variant/60 focus:ring-1 focus:ring-primary h-20 transition-all outline-none" 
                              placeholder="Ghi chú thêm (Ví dụ: ít đường, nhiều trứng, không cay...)" 
                              oninput="window.setCartNote(this.value)">${state.cartNote || ''}</textarea>
                    <span class="material-symbols-outlined absolute right-3 bottom-3 text-on-surface-variant/40">edit_note</span>
                </div>
            </section>

            <!-- Pricing Summary Box -->
            <section class="bg-surface-container-lowest dark:bg-surface-dim p-4 rounded-xl border border-outline-variant/30 dark:border-outline/10 space-y-3 shadow-sm mt-6 select-none">
                <div class="flex justify-between text-xs text-on-surface-variant dark:text-secondary-fixed-dim">
                    <span>Tạm tính</span>
                    <span class="font-semibold text-on-surface dark:text-white">${cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div class="flex justify-between text-xs text-on-surface-variant dark:text-secondary-fixed-dim">
                    <span>Phí chuẩn bị món</span>
                    <span class="font-semibold text-on-surface dark:text-white">${prepFee.toLocaleString('vi-VN')}đ</span>
                </div>
                ${discount > 0 ? `
                <div class="flex justify-between text-xs text-status-green font-semibold">
                    <span>Voucher giảm giá</span>
                    <span>-${discount.toLocaleString('vi-VN')}đ</span>
                </div>
                ` : ''}
                <div class="flex justify-between text-xs items-center">
                    <div class="flex items-center gap-1 text-on-surface-variant dark:text-secondary-fixed-dim">
                        <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-[16px]">confirmation_number</span>
                        <span>Voucher sinh viên</span>
                    </div>
                    <button class="text-primary dark:text-primary-fixed-dim font-bold text-xs hover:underline cursor-pointer" onclick="window.location.hash = '#/checkout'">${voucherLabelHTML}</button>
                </div>
                
                <hr class="border-outline-variant/10 dark:border-outline/10">
                
                <div class="flex justify-between items-center pt-1 select-none">
                    <span class="font-bold text-on-surface dark:text-white text-base">Tổng cộng</span>
                    <span class="font-label-price text-xl font-extrabold text-primary dark:text-primary-fixed-dim">${finalTotal.toLocaleString('vi-VN')}đ</span>
                </div>
            </section>

        </div>
    `;
}

// --- Screen 13: Checkout & Voucher Screen ---
function renderCheckoutPage(state) {
    const { cartTotal, prepFee, discount, finalTotal } = calcOrderTotals(state.cart, state.appliedVoucherCode);
    const payment = state.paymentMethod || 'cash';

    return `
        <div class="pt-16 pb-32 animate-fade-in select-none">
            <!-- Voucher Input Box -->
            <section class="space-y-3" id="voucher-section">
                <div class="flex items-center gap-2 select-none">
                    <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim" style="font-variation-settings: 'FILL' 1;">confirmation_number</span>
                    <h2 class="font-bold text-[15px] text-on-surface dark:text-white">Mã giảm giá khả dụng</h2>
                </div>
                
                <div class="flex gap-2">
                    <input class="flex-grow bg-surface-container-low dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/10 rounded-xl px-4 py-2.5 text-xs outline-none text-on-surface dark:text-white placeholder:text-on-surface-variant/40" 
                           placeholder="Nhập mã ưu đãi khác..." type="text" id="voucher-code-input" value="${state.appliedVoucherCode || ''}">
                    <button class="bg-primary hover:bg-primary-container text-white px-5 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm shrink-0 select-none squishy-button"
                            onclick="window.applyVoucherCode(document.getElementById('voucher-code-input').value)">
                        Áp dụng
                    </button>
                </div>

                <!-- Active success banner -->
                ${state.appliedVoucherCode ? `
                    <div class="bg-secondary-container/30 border border-outline/20 p-3 rounded-xl flex items-center justify-between animate-fade-in select-none">
                        <div class="flex items-center gap-2 text-on-surface dark:text-white">
                            <span class="material-symbols-outlined text-status-green" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                            <span class="text-xs font-bold">Voucher "${state.appliedVoucherCode}" đã được áp dụng</span>
                        </div>
                        <span class="text-xs font-black text-status-red">Tiết kiệm -${discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                ` : ''}

                <!-- Clickable dashed vouchers -->
                <div class="grid grid-cols-2 gap-3 mt-2">
                    <!-- GIAM10 card -->
                    <div class="cursor-pointer group relative bg-surface-container-lowest dark:bg-surface-dim border-2 border-dashed ${state.appliedVoucherCode === 'GIAM10' ? 'border-primary dark:border-primary-fixed-dim bg-primary-fixed/10' : 'border-outline-variant/40 dark:border-outline/10'} p-3 rounded-xl flex items-center gap-3 hover:border-primary transition-colors select-none"
                         onclick="window.applyVoucherCode('GIAM10')">
                        <div class="bg-primary-container/10 p-2 rounded-lg text-primary dark:text-primary-fixed-dim">
                            <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">local_activity</span>
                        </div>
                        <div>
                            <p class="font-bold text-xs text-primary dark:text-primary-fixed-dim">GIAM10</p>
                            <p class="text-[9px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">Giảm 10k đơn từ 50k</p>
                        </div>
                    </div>
                    
                    <!-- SINHVIEN15 card -->
                    <div class="cursor-pointer group relative bg-surface-container-lowest dark:bg-surface-dim border-2 border-dashed ${state.appliedVoucherCode === 'SINHVIEN15' ? 'border-primary dark:border-primary-fixed-dim bg-primary-fixed/10' : 'border-outline-variant/40 dark:border-outline/10'} p-3 rounded-xl flex items-center gap-3 hover:border-primary transition-colors select-none"
                         onclick="window.applyVoucherCode('SINHVIEN15')">
                        <div class="bg-tertiary-container/10 p-2 rounded-lg text-tertiary">
                            <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">school</span>
                        </div>
                        <div>
                            <p class="font-bold text-xs text-tertiary">SINHVIEN15</p>
                            <p class="text-[9px] text-on-surface-variant dark:text-secondary-fixed-dim mt-0.5">Giảm 15% cho SV</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Payment Methods Radios -->
            <section class="mt-6 space-y-3">
                <div class="flex items-center gap-2 select-none">
                    <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim" style="font-variation-settings: 'FILL' 1;">account_balance_wallet</span>
                    <h2 class="font-bold text-[15px] text-on-surface dark:text-white">Phương thức thanh toán</h2>
                </div>
                
                <div class="grid grid-cols-1 gap-2.5">
                    <!-- Cash -->
                    <label class="relative flex items-center p-3 bg-surface-container-lowest dark:bg-surface-dim rounded-xl border ${payment === 'cash' ? 'border-primary dark:border-primary-fixed-dim bg-primary-fixed/10' : 'border-outline-variant/30 dark:border-outline/10'} cursor-pointer transition-all active:scale-[0.98]" onclick="window.setPaymentMethod('cash')">
                        <input class="hidden" name="payment" type="radio" value="cash" ${payment === 'cash' ? 'checked' : ''}>
                        <div class="flex items-center gap-3 w-full">
                            <div class="w-8 h-8 rounded-full bg-surface-container-high dark:bg-surface-variant/40 flex items-center justify-center text-on-surface-variant dark:text-white">
                                <span class="material-symbols-outlined text-base">payments</span>
                            </div>
                            <span class="flex-grow font-bold text-xs text-on-surface dark:text-white">Tiền mặt</span>
                            <div class="w-4 h-4 rounded-full border-2 ${payment === 'cash' ? 'border-primary dark:border-primary-fixed-dim bg-primary' : 'border-outline-variant'} flex items-center justify-center">
                                ${payment === 'cash' ? '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>' : ''}
                            </div>
                        </div>
                    </label>
                    
                    <!-- MoMo -->
                    <label class="relative flex items-center p-3 bg-surface-container-lowest dark:bg-surface-dim rounded-xl border ${payment === 'momo' ? 'border-primary dark:border-primary-fixed-dim bg-primary-fixed/10' : 'border-outline-variant/30 dark:border-outline/10'} cursor-pointer transition-all active:scale-[0.98]" onclick="window.setPaymentMethod('momo')">
                        <input class="hidden" name="payment" type="radio" value="momo" ${payment === 'momo' ? 'checked' : ''}>
                        <div class="flex items-center gap-3 w-full">
                            <img class="w-8 h-8 rounded-lg object-cover" src="https://i.ibb.co/F4FnXJvJ/Logo-Mo-Mo-Square-300x300.png">
                            <span class="flex-grow font-bold text-xs text-on-surface dark:text-white">Ví MoMo</span>
                            <div class="w-4 h-4 rounded-full border-2 ${payment === 'momo' ? 'border-primary dark:border-primary-fixed-dim bg-primary' : 'border-outline-variant'} flex items-center justify-center">
                                ${payment === 'momo' ? '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>' : ''}
                            </div>
                        </div>
                    </label>

                    <!-- ZaloPay -->
                    <label class="relative flex items-center p-3 bg-surface-container-lowest dark:bg-surface-dim rounded-xl border ${payment === 'zalopay' ? 'border-primary dark:border-primary-fixed-dim bg-primary-fixed/10' : 'border-outline-variant/30 dark:border-outline/10'} cursor-pointer transition-all active:scale-[0.98]" onclick="window.setPaymentMethod('zalopay')">
                        <input class="hidden" name="payment" type="radio" value="zalopay" ${payment === 'zalopay' ? 'checked' : ''}>
                        <div class="flex items-center gap-3 w-full">
                            <img class="w-8 h-8 rounded-lg object-cover" src="https://i.ibb.co/QFbVbWrs/zalopay.jpg">
                            <span class="flex-grow font-bold text-xs text-on-surface dark:text-white">Ví ZaloPay</span>
                            <div class="w-4 h-4 rounded-full border-2 ${payment === 'zalopay' ? 'border-primary dark:border-primary-fixed-dim bg-primary' : 'border-outline-variant'} flex items-center justify-center">
                                ${payment === 'zalopay' ? '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>' : ''}
                            </div>
                        </div>
                    </label>
                    
                    <!-- Bank card -->
                    <label class="relative flex items-center p-3 bg-surface-container-lowest dark:bg-surface-dim rounded-xl border ${payment === 'card' ? 'border-primary dark:border-primary-fixed-dim bg-primary-fixed/10' : 'border-outline-variant/30 dark:border-outline/10'} cursor-pointer transition-all active:scale-[0.98]" onclick="window.setPaymentMethod('card')">
                        <input class="hidden" name="payment" type="radio" value="card" ${payment === 'card' ? 'checked' : ''}>
                        <div class="flex items-center gap-3 w-full">
                            <div class="w-8 h-8 rounded-full bg-surface-container-high dark:bg-surface-variant/40 flex items-center justify-center text-on-surface-variant dark:text-white">
                                <span class="material-symbols-outlined text-base">credit_card</span>
                            </div>
                            <span class="flex-grow font-bold text-xs text-on-surface dark:text-white">Thẻ ngân hàng (ATM/Visa)</span>
                            <div class="w-4 h-4 rounded-full border-2 ${payment === 'card' ? 'border-primary dark:border-primary-fixed-dim bg-primary' : 'border-outline-variant'} flex items-center justify-center">
                                ${payment === 'card' ? '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>' : ''}
                            </div>
                        </div>
                    </label>

                    <!-- payOS -->
                    <label class="relative flex items-center p-3 bg-surface-container-lowest dark:bg-surface-dim rounded-xl border ${payment === 'payos' ? 'border-primary dark:border-primary-fixed-dim bg-primary-fixed/10' : 'border-outline-variant/30 dark:border-outline/10'} cursor-pointer transition-all active:scale-[0.98]" onclick="window.setPaymentMethod('payos')">
                        <input class="hidden" name="payment" type="radio" value="payos" ${payment === 'payos' ? 'checked' : ''}>
                        <div class="flex items-center gap-3 w-full">
                            <div class="w-8 h-8 rounded-full bg-surface-container-high dark:bg-surface-variant/40 flex items-center justify-center text-on-surface-variant dark:text-white">
                                <span class="material-symbols-outlined text-base">qr_code_2</span>
                            </div>
                            <span class="flex-grow font-bold text-xs text-on-surface dark:text-white">Chuyển khoản QR (payOS)</span>
                            <div class="w-4 h-4 rounded-full border-2 ${payment === 'payos' ? 'border-primary dark:border-primary-fixed-dim bg-primary' : 'border-outline-variant'} flex items-center justify-center">
                                ${payment === 'payos' ? '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>' : ''}
                            </div>
                        </div>
                    </label>
                </div>
            </section>

            <!-- QR Code MoMo Section (Animated, visible when MoMo is selected) -->
            ${payment === 'momo' ? `
                <div class="bg-surface-container-lowest dark:bg-surface-dim border border-outline-variant/30 dark:border-outline/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm animate-fade-in space-y-4 select-none mt-4">
                    <div class="flex items-center gap-2 justify-center text-primary dark:text-primary-fixed-dim font-bold text-xs tracking-wider">
                        <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                        <span>MÃ QR THANH TOÁN MOMO</span>
                    </div>
                    <div class="w-48 h-48 p-2 bg-white rounded-xl border border-outline-variant/30 flex items-center justify-center shadow-sm relative overflow-hidden group">
                        <img class="w-full h-full object-contain rounded-lg" src="https://i.ibb.co/TMYZgM3y/Mu-i-tea-coffee-1.png" alt="Momo QR Code">
                        <div class="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                    <div class="space-y-1">
                        <p class="font-bold text-xs text-on-surface dark:text-white">Sinh Viên Quán - Căn tin IUH</p>
                        <p class="text-[10px] text-on-surface-variant dark:text-secondary-fixed-dim leading-relaxed max-w-[240px]">Vui lòng mở ứng dụng MoMo quét mã QR trên hoặc thanh toán khi nhận món tại Quầy số 3 nhé!</p>
                    </div>
                </div>
            ` : ''}

            <!-- Delivery Address Section -->
            <section class="bg-surface-container-low dark:bg-surface-dim rounded-2xl p-4 space-y-3 shadow-sm border border-outline-variant/30 dark:border-outline/10 mt-6 select-none animate-fade-in">
                <div class="flex items-center gap-2 select-none border-b border-outline-variant/20 pb-2">
                    <span class="material-symbols-outlined text-primary dark:text-primary-fixed-dim text-[18px]" style="font-variation-settings: 'FILL' 1;">location_on</span>
                    <h2 class="font-bold text-[14px] text-on-surface dark:text-white">Địa chỉ giao hàng</h2>
                </div>
                
                ${(state.addresses || []).length === 0 ? `
                    <div class="space-y-2">
                        <p class="text-[10px] text-status-red italic font-semibold">Bạn chưa lưu địa chỉ nào. Vui lòng nhập địa chỉ nhận hàng bên dưới:</p>
                        <textarea id="checkout-address-input" class="w-full bg-surface-container-lowest dark:bg-surface-variant/20 border border-outline-variant/30 rounded-xl px-3 py-2 text-xs outline-none text-on-surface dark:text-white placeholder:text-on-surface-variant/40" 
                                  placeholder="Nhập địa chỉ nhận hàng chi tiết (Tòa, Phòng, KTX...)..." rows="2"></textarea>
                    </div>
                ` : `
                    <div class="space-y-2.5">
                        <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Chọn địa chỉ đã lưu</label>
                        <select id="checkout-address-select" class="w-full bg-surface-container-lowest dark:bg-surface-variant/20 border border-outline-variant/30 rounded-xl px-3 py-2.5 text-xs text-on-surface dark:text-white outline-none">
                            ${state.addresses.map(a => `<option value="${a.id}" ${a.is_default ? 'selected' : ''}>${a.label}: ${a.description}</option>`).join('')}
                        </select>
                    </div>
                `}
                
                <!-- Ghi chú cho bếp -->
                <div class="space-y-1 pt-1">
                    <label class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">Ghi chú cho bếp (tùy chọn)</label>
                    <input type="text" id="checkout-note-input" class="w-full bg-surface-container-lowest dark:bg-surface-variant/20 border border-outline-variant/30 rounded-xl px-3 py-2 text-xs outline-none text-on-surface dark:text-white" placeholder="Ví dụ: Ít ngọt, trà đá ít đá..." value="${state.cartNote || ''}">
                </div>
            </section>

            <!-- Order Summary Section -->
            <section class="bg-surface-container-low dark:bg-surface-dim rounded-2xl p-4 space-y-3 shadow-sm border border-outline-variant/30 dark:border-outline/10 mt-6 select-none">
                <h2 class="font-bold text-on-surface dark:text-white border-b border-outline-variant/20 pb-2 text-[14px]">Tóm tắt đơn hàng</h2>
                <div class="space-y-2.5">
                    <div class="flex justify-between text-xs text-on-surface-variant dark:text-secondary-fixed-dim">
                        <span>Tạm tính</span>
                        <span class="font-bold text-on-surface dark:text-white">${cartTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    ${state.appliedVoucherCode ? `
                        <div class="flex justify-between text-xs text-status-green font-semibold">
                            <span>Voucher giảm giá</span>
                            <span class="font-bold">-${discount.toLocaleString('vi-VN')}đ</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-xs text-on-surface-variant dark:text-secondary-fixed-dim">
                        <span>Phí chuẩn bị món</span>
                        <span class="font-bold text-on-surface dark:text-white">${prepFee.toLocaleString('vi-VN')}đ</span>
                    </div>
                    
                    <div class="pt-3 border-t border-dashed border-outline-variant/30 flex justify-between items-center select-none">
                        <span class="font-bold text-sm text-on-surface dark:text-white">Tổng thanh toán</span>
                        <span class="font-label-price text-lg font-extrabold text-primary dark:text-primary-fixed-dim">${finalTotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>
            </section>

        </div>
    `;
}

function renderApp() {
    // Dynamic theme class sync
    if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    const mainRoot = document.getElementById('main-root');
    const headerRoot = document.getElementById('header-root');
    const footerRoot = document.getElementById('footer-root');
    const drawerRoot = document.getElementById('drawer-root');

    if (!mainRoot) return;

    // Render Global Frame items
    headerRoot.innerHTML = renderHeader(state);
    footerRoot.innerHTML = renderFooter(state);
    drawerRoot.innerHTML = renderDrawer(state);

    // Render Bottom Sheet Modal for Screen 11 dynamically
    let addedSheetRoot = document.getElementById('added-sheet-root');
    if (!addedSheetRoot) {
        addedSheetRoot = document.createElement('div');
        addedSheetRoot.id = 'added-sheet-root';
        const appContainer = document.getElementById('app-container');
        if (appContainer) appContainer.appendChild(addedSheetRoot);
    }
    addedSheetRoot.innerHTML = renderAddToCartSheet(state);

    // Dynamic padding adjustments
    const cartCount = Object.values(state.cart).reduce((sum, q) => sum + q, 0);
    if ((state.currentRoute === '#/menu' && cartCount > 0) || state.currentRoute === '#/cart' || state.currentRoute === '#/checkout') {
        mainRoot.className = "flex-1 overflow-y-auto pb-32 pt-14 px-margin-mobile transition-all duration-300";
    } else {
        mainRoot.className = "flex-1 overflow-y-auto pb-24 pt-14 px-margin-mobile transition-all duration-300";
    }

    // Dynamic Route switching
    switch (state.currentRoute) {
        case '#/home':
        case '#/':
            mainRoot.innerHTML = renderHome(state);
            break;
        case '#/vouchers':
            mainRoot.innerHTML = renderVouchers(state);
            break;
        case '#/decision':
            mainRoot.innerHTML = renderDecision(state);
            break;
        case '#/notifications':
            mainRoot.innerHTML = renderNotifications(state);
            break;
        case '#/menu':
            mainRoot.innerHTML = renderMenu(state);
            break;
        case '#/orders':
            mainRoot.innerHTML = renderOrders(state);
            break;
        case '#/profile':
            mainRoot.innerHTML = renderProfile(state);
            break;
        case '#/cart':
            mainRoot.innerHTML = renderCartPage(state);
            break;
        case '#/checkout':
            if (!state.user) {
                window.location.hash = '#/profile';
                showToast("Vui lòng đăng nhập để thanh toán", "warning");
                mainRoot.innerHTML = renderAuthPage(state);
            } else {
                mainRoot.innerHTML = renderCheckoutPage(state);
            }
            break;
        case '#/admin':
            if (!state.user || !state.profile || state.profile.role !== 'admin') {
                window.location.hash = '#/home';
                showToast("Bạn không có quyền truy cập trang quản trị!", "warning");
                mainRoot.innerHTML = renderHome(state);
            } else {
                mainRoot.innerHTML = renderAdminPage(state);
            }
            break;
        default:
            mainRoot.innerHTML = renderHome(state);
            break;
    }

    // Attach Click Sounds
    document.querySelectorAll('a, button').forEach(el => {
        if (!el.hasAttribute('data-sound-binded')) {
            el.addEventListener('click', () => {
                if (!el.classList.contains('no-click-sound')) {
                    playClickSound();
                }
            });
            el.setAttribute('data-sound-binded', 'true');
        }
    });
}

// ==========================================
// 6. EVENT ROUTE BINDING
// ==========================================
window.addEventListener('hashchange', async () => {
    state.currentRoute = window.location.hash;
    
    // Check payOS callback params
    if (window.location.href.includes('payment=success')) {
        showToast("Thanh toán thành công qua cổng payOS!", "success");
        triggerConfetti();
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash.split('?')[0];
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    } else if (window.location.href.includes('payment=cancelled')) {
        showToast("Giao dịch thanh toán đã bị hủy.", "warning");
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.hash.split('?')[0];
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
    }

    if (state.currentRoute.startsWith('#/orders')) {
        await fetchOrdersFromSupabase();
    } else if (state.currentRoute.startsWith('#/admin')) {
        await fetchAdminData();
    }
    renderApp();
    const mainRoot = document.getElementById('main-root');
    if (mainRoot) mainRoot.scrollTop = 0;
});

// ==========================================
// 7. WINDOW ACTIONS BINDINGS
// ==========================================

window.toggleDrawer = () => {
    const drawer = document.getElementById('nav-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (!drawer) return;
    
    const isHidden = drawer.classList.contains('-translate-x-full');
    if (isHidden) {
        drawer.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        overlay.classList.add('opacity-100');
    } else {
        drawer.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        overlay.classList.remove('opacity-100');
    }
};

window.toggleTheme = () => {
    if (state.theme === 'light') {
        state.theme = 'dark';
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        showToast("Đã kích hoạt Chế độ Tối ấm áp!", "info");
    } else {
        state.theme = 'light';
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        showToast("Đã kích hoạt Chế độ Sáng rực rỡ!", "info");
    }
    renderApp();
};

window.applyVoucher = (voucherId) => {
    const voucher = state.vouchers.find(v => v.id === voucherId);
    if (!voucher || voucher.category !== 'available') return;

    if (!VOUCHER_RULES[voucher.code]) {
        showToast(`Mã ${voucher.code} không khả dụng!`, "warning");
        return;
    }

    state.appliedVoucherId = voucherId;
    state.appliedVoucherCode = voucher.code;

    const { error } = calcVoucherDiscount(state.cart, voucher.code);
    if (error && calcCartSubtotal(state.cart) > 0) {
        showToast(error, "warning");
    }

    navigator.clipboard.writeText(voucher.code).then(() => {
        showToast(`Sao chép mã ${voucher.code} & áp dụng thành công!`, "success");
    }).catch(() => {
        showToast(`Đã áp dụng mã giảm giá ${voucher.title}!`, "success");
    });

    triggerConfetti();
    persistAppState();

    const cartCount = Object.values(state.cart).reduce((sum, q) => sum + q, 0);
    setTimeout(() => {
        if (cartCount > 0) {
            window.location.hash = '#/checkout';
        } else {
            window.location.hash = '#/menu';
        }
    }, 800);
};

window.spinDecisionEngine = () => {
    if (state.isSpinning) return;
    
    state.isSpinning = true;
    state.selectedCombo = null;
    renderApp();

    let spins = 0;
    const maxSpins = 12;
    const intervalTime = 100;
    
    const spinInterval = setInterval(() => {
        const rollCombo = combos[spins % combos.length];
        const slotTrack = document.getElementById('slot-track');
        
        if (slotTrack) {
            slotTrack.innerHTML = `
                <div class="slot-item text-center">
                    <img class="w-24 h-24 rounded-full object-cover border-2 border-primary mx-auto animate-ping mb-2" src="${rollCombo.image}">
                    <h4 class="font-extrabold text-base text-primary">${rollCombo.name}</h4>
                    <p class="text-xs text-on-surface-variant font-bold">${rollCombo.price.toLocaleString('vi-VN')}đ</p>
                </div>
            `;
        }
        
        playClickSound();
        spins++;

        if (spins >= maxSpins) {
            clearInterval(spinInterval);
            
            const randomIndex = Math.floor(Math.random() * combos.length);
            state.selectedCombo = combos[randomIndex];
            state.isSpinning = false;
            
            renderApp();
            playSuccessSound();
            showToast(`Gợi ý thành công: ${state.selectedCombo.name}!`, "success");
            triggerConfetti();
        }
    }, intervalTime);
};

window.orderCombo = async (comboId) => {
    if (!state.user) {
        window.location.hash = '#/profile';
        showToast("Vui lòng đăng nhập để chọn món!", "warning");
        return;
    }
    const combo = combos.find(c => c.id === comboId);
    if (!combo) return;

    const newQty = (state.cart[comboId] || 0) + 1;
    const ok = await updateSupabaseCartItem(comboId, newQty);
    if (ok) {
        state.cart[comboId] = newQty;
        state.addedItemSheet = comboId;
        showToast(`Đã thêm ${combo.name} vào giỏ hàng!`, "success");
        persistAppState();
        renderApp();
    }
};

window.reorderItem = async (orderId) => {
    if (!state.user) {
        window.location.hash = '#/profile';
        showToast("Vui lòng đăng nhập để đặt lại món!", "warning");
        return;
    }
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    if (!order.items || !order.items.length) {
        showToast('Không thể đặt lại đơn này.', 'warning');
        return;
    }

    let allOk = true;
    for (const { id, qty } of order.items) {
        const newQty = (state.cart[id] || 0) + qty;
        const ok = await updateSupabaseCartItem(id, newQty);
        if (ok) {
            state.cart[id] = newQty;
        } else {
            allOk = false;
        }
    }

    if (allOk) {
        showToast(`Đã thêm lại món của đơn ${orderId} vào giỏ!`, "success");
    }
    persistAppState();
    window.location.hash = '#/cart';
};

window.checkoutCart = () => {
    if (!state.user) {
        window.location.hash = '#/profile';
        showToast("Vui lòng đăng nhập để thanh toán!", "warning");
        return;
    }
    window.location.hash = '#/cart';
};

window.updateCartQuantity = async (itemId, change) => {
    if (!state.user) {
        window.location.hash = '#/profile';
        showToast("Vui lòng đăng nhập để chọn món!", "warning");
        return;
    }
    const currentQty = state.cart[itemId] || 0;
    const newQty = currentQty + change;
    
    const ok = await updateSupabaseCartItem(itemId, newQty);
    if (ok) {
        if (newQty <= 0) {
            delete state.cart[itemId];
        } else {
            state.cart[itemId] = newQty;
        }
        
        if (change > 0 && state.currentRoute === '#/menu') {
            state.addedItemSheet = itemId;
        }
        
        persistAppState();
        renderApp();
    }
};

window.closeAddedSheet = () => {
    state.addedItemSheet = null;
    renderApp();
};

window.addUpsellItem = async (id, name) => {
    if (!state.user) {
        window.location.hash = '#/profile';
        showToast("Vui lòng đăng nhập để thêm món!", "warning");
        return;
    }
    const newQty = (state.cart[id] || 0) + 1;
    const ok = await updateSupabaseCartItem(id, newQty);
    if (ok) {
        state.cart[id] = newQty;
        showToast(`Đã thêm ${name} thành công!`, "success");
        persistAppState();
        renderApp();
    }
};

window.setDineOption = (option) => {
    state.dineOption = option;
    persistAppState();
    renderApp();
};

window.setCartNote = (value) => {
    state.cartNote = value;
};

window.applyVoucherCode = (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === '') {
        state.appliedVoucherCode = null;
        state.appliedVoucherId = null;
        showToast(`Đã hủy áp dụng mã giảm giá.`, "info");
        persistAppState();
        renderApp();
        return;
    }

    if (!VOUCHER_RULES[cleanCode]) {
        showToast(`Mã ${cleanCode} không khả dụng!`, "warning");
        return;
    }

    const walletVoucher = state.vouchers.find(v => v.code === cleanCode && v.category === 'available');
    state.appliedVoucherCode = cleanCode;
    state.appliedVoucherId = walletVoucher ? walletVoucher.id : null;

    const { error } = calcVoucherDiscount(state.cart, cleanCode);
    if (error && calcCartSubtotal(state.cart) > 0) {
        showToast(error, "warning");
    } else {
        triggerConfetti();
        showToast(`Áp dụng mã ${cleanCode} thành công!`, "success");
    }

    persistAppState();
    renderApp();
};

window.setPaymentMethod = (method) => {
    state.paymentMethod = method;
    persistAppState();
    renderApp();
};

window.checkoutCartFinal = async () => {
    const cartCount = Object.values(state.cart).reduce((sum, q) => sum + q, 0);
    if (cartCount === 0) {
        showToast("Giỏ hàng của bạn đang trống!", "warning");
        return;
    }

    if (!state.user) {
        showToast("Vui lòng đăng nhập để thanh toán!", "warning");
        window.location.hash = '#/profile';
        return;
    }

    // Get input values
    const selectEl = document.getElementById('checkout-address-select');
    const inputEl = document.getElementById('checkout-address-input');
    const addressId = selectEl ? selectEl.value : null;
    const deliveryAddress = inputEl ? inputEl.value : null;
    const notes = document.getElementById('checkout-note-input')?.value || '';
    const paymentMethod = state.paymentMethod || 'cash';
    const appliedVoucherCode = state.appliedVoucherCode || null;

    if (!addressId && (!deliveryAddress || deliveryAddress.trim() === '')) {
        showToast("Vui lòng cung cấp địa chỉ nhận hàng!", "warning");
        return;
    }

    try {
        const { data: { session }, error: sessionErr } = await supabaseClient.auth.getSession();
        if (sessionErr || !session) {
            showToast("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!", "error");
            window.location.hash = '#/profile';
            return;
        }

        // Show loading status
        showToast("Đang xử lý đơn hàng...", "info");

        const response = await fetch('/api/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                addressId,
                deliveryAddress,
                notes,
                paymentMethod,
                appliedVoucherCode
            })
        });

        const data = await response.json();
        if (!response.ok || data.error) {
            showToast(data.error || "Đặt hàng thất bại. Vui lòng thử lại!", "error");
            return;
        }

        // Success!
        state.cart = {}; 
        state.appliedVoucherCode = null;
        state.appliedVoucherId = null;
        state.cartNote = '';
        persistAppState();

        if (paymentMethod === 'payos') {
            showToast("Đang kết nối cổng thanh toán payOS...", "info");
            try {
                const payResponse = await fetch('/api/payment/payos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        orderId: data.orderId
                    })
                });
                const payData = await payResponse.json();
                if (!payResponse.ok || payData.error) {
                    showToast(payData.error || "Không thể tạo liên kết thanh toán payOS", "error");
                    return;
                }
                
                // Redirect user to payOS checkout page
                window.location.href = payData.checkoutUrl;
                return;
            } catch (err) {
                console.error("payOS creation error", err);
                showToast("Lỗi kết nối cổng thanh toán payOS.", "error");
                return;
            }
        }

        // Refresh orders and profile data
        await fetchOrdersFromSupabase();
        
        triggerConfetti();
        showToast(data.message || `Đặt đơn ${data.orderId} thành công!`, "success");

        state.notifications.unshift({
            id: `n-${Date.now()}`,
            title: "Đơn hàng đang chuẩn bị",
            desc: `Đơn ${data.orderId} đã được ghi nhận trên hệ thống.`,
            time: "Vừa xong",
            type: "hoat-dong",
            icon: "restaurant",
            iconBg: "bg-primary-fixed",
            iconColor: "text-primary",
            actionText: "Xem đơn",
            actionHash: "#/orders",
            unread: true
        });

        setTimeout(() => {
            window.location.hash = '#/orders';
        }, 1000);

    } catch (e) {
        console.error("Checkout submission error", e);
        showToast("Không thể kết nối đến server để tạo đơn hàng.", "error");
    }
};

window.filterMenu = (category) => {
    state.menuFilter = category;
    renderApp();
};

window.setAdminTab = (tab) => {
    state.adminTab = tab;
    renderApp();
};

window.refreshAdminData = async () => {
    showToast("Đang tải lại dữ liệu...", "info");
    await fetchAdminData();
    renderApp();
};

window.updateOrderStatus = async (orderId, newStatus) => {
    try {
        showToast("Đang cập nhật trạng thái...", "info");
        const { error } = await supabaseClient
            .from('orders')
            .update({ order_status: newStatus })
            .eq('id', orderId);
        
        if (error) {
            showToast(error.message, "error");
        } else {
            showToast(`Đã chuyển đơn ${orderId} sang ${newStatus}!`, "success");
            
            // If the status is CANCELLED, return stock to products
            if (newStatus === 'CANCELLED') {
                const order = (state.adminOrders || []).find(o => o.id === orderId);
                if (order && Array.isArray(order.order_items)) {
                    for (const item of order.order_items) {
                        const { data: prod } = await supabaseClient
                            .from('products')
                            .select('stock_quantity')
                            .eq('id', item.product_id)
                            .single();
                        if (prod) {
                            const returnedStock = prod.stock_quantity + item.quantity;
                            await supabaseClient
                                .from('products')
                                .update({ stock_quantity: returnedStock })
                                .eq('id', item.product_id);
                        }
                    }
                }
            }
            
            await fetchAdminData();
            renderApp();
        }
    } catch (e) {
        console.error("Error updating order status", e);
        showToast("Lỗi hệ thống khi cập nhật", "error");
    }
};

window.changeProductStock = async (prodId, delta) => {
    try {
        const prod = (state.adminProducts || []).find(p => p.id === prodId);
        if (!prod) return;
        const newStock = Math.max(0, prod.stock_quantity + delta);
        
        const { error } = await supabaseClient
            .from('products')
            .update({ stock_quantity: newStock })
            .eq('id', prodId);
        
        if (error) {
            showToast(error.message, "error");
        } else {
            prod.stock_quantity = newStock;
            renderApp();
        }
    } catch (e) {
        console.error("Error updating stock quantity", e);
        showToast("Lỗi hệ thống khi sửa kho hàng", "error");
    }
};

window.handleMenuSearch = (query) => {
    state.menuSearch = query;
    clearTimeout(menuSearchDebounceTimer);
    menuSearchDebounceTimer = setTimeout(() => renderApp(), 200);
};

window.switchNotificationTab = (tab) => {
    state.notificationTab = tab;
    renderApp();
};

window.readNotification = (notifId) => {
    const notif = state.notifications.find(n => n.id === notifId);
    if (notif && notif.unread) {
        notif.unread = false;
        persistAppState();
        renderApp();
    }
};

window.handleNotificationAction = (hash, notifId) => {
    window.readNotification(notifId);
    if (hash) window.location.hash = hash;
};

window.markAllNotificationsRead = () => {
    state.notifications.forEach(n => n.unread = false);
    persistAppState();
    renderApp();
    playSuccessSound();
    showToast("Đã đánh dấu đọc tất cả thông báo!", "success");
};

window.handleSupabaseLogin = async (email, password) => {
    try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) {
            if (error.message.includes("Email not confirmed")) {
                showToast("Email chưa xác nhận! Vui lòng kiểm tra hòm thư hoặc tắt 'Confirm email' trong cài đặt Auth -> Providers -> Email trên Supabase Dashboard.", "error");
            } else {
                showToast(error.message, "error");
            }
        } else {
            showToast("Đăng nhập thành công!", "success");
            window.location.hash = "#/home";
        }
    } catch (err) {
        showToast(err.message || "Đăng nhập thất bại", "error");
    }
};

window.handleSupabaseRegister = async (email, password, name, mssv, university) => {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });
        if (error) {
            showToast(error.message, "error");
            return;
        }
        
        if (data.user) {
            // Wait for profile trigger. Let's update extra info
            const { error: updateErr } = await supabaseClient
                .from('profiles')
                .update({ mssv, university })
                .eq('id', data.user.id);
            if (updateErr) console.warn("Failed to update extra profile details", updateErr);
            
            showToast("Đăng ký thành công!", "success");
            window.location.hash = "#/home";
        }
    } catch (err) {
        showToast(err.message || "Đăng ký thất bại", "error");
    }
};

window.handleSupabaseLogout = async () => {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            showToast(error.message, "error");
        } else {
            showToast("Đã đăng xuất!", "success");
            window.location.hash = "#/home";
        }
    } catch (err) {
        showToast("Lỗi đăng xuất", "error");
    }
};

window.setAuthTab = (tab) => {
    state.authTab = tab;
    renderApp();
};

window.submitAuthLogin = () => {
    const email = document.getElementById('auth-email')?.value;
    const password = document.getElementById('auth-password')?.value;
    if (!email || !password) {
        showToast("Vui lòng điền đầy đủ email và mật khẩu", "warning");
        return;
    }
    window.handleSupabaseLogin(email, password);
};

window.submitAuthRegister = () => {
    const email = document.getElementById('reg-email')?.value;
    const password = document.getElementById('reg-password')?.value;
    const name = document.getElementById('reg-name')?.value;
    const mssv = document.getElementById('reg-mssv')?.value;
    const university = document.getElementById('reg-univ')?.value;
    
    if (!email || !password || !name || !mssv) {
        showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "warning");
        return;
    }
    if (password.length < 6) {
        showToast("Mật khẩu phải dài tối thiểu 6 ký tự", "warning");
        return;
    }
    window.handleSupabaseRegister(email, password, name, mssv, university);
};

window.addMockAddress = async () => {
    if (!state.user) {
        showToast("Vui lòng đăng nhập trước!", "warning");
        return;
    }
    const label = prompt("Nhập tên địa chỉ (ví dụ: Ký túc xá Khu A):");
    if (!label) return;
    const description = prompt("Nhập địa chỉ chi tiết:");
    if (!description) return;
    
    try {
        const { error } = await supabaseClient
            .from('addresses')
            .insert({
                user_id: state.user.id,
                label,
                description,
                is_default: state.addresses.length === 0
            });
        if (error) {
            showToast(error.message, "error");
        } else {
            showToast("Đã thêm địa chỉ!", "success");
            const { data } = await supabaseClient.from('addresses').select('*').eq('user_id', state.user.id);
            state.addresses = data || [];
            renderApp();
        }
    } catch (e) {
        showToast("Lỗi thêm địa chỉ", "error");
    }
};

// --- Poll active orders from Supabase every 6 seconds ---
setInterval(async () => {
    if (state.user && Array.isArray(state.orders) && state.orders.some(o => o.step < 4 && o.step > 0)) {
        await fetchOrdersFromSupabase();
        renderApp();
    }
}, 6000);

// --- Bootstrapper ---
async function bootstrapApp() {
    // Fetch products from database first
    await fetchProductsFromSupabase();
    
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
            state.user = session.user;
            
            // Fetch profile
            const { data: profile } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            if (profile) {
                state.profile = profile;
            }
            
            // Fetch addresses
            const { data: addresses } = await supabaseClient
                .from('addresses')
                .select('*')
                .eq('user_id', session.user.id);
            state.addresses = addresses || [];
            
            // Sync cart from Supabase
            await syncCartFromSupabase();
            // Fetch orders
            await fetchOrdersFromSupabase();
            
            // If admin, fetch admin data too
            if (profile && profile.role === 'admin') {
                await fetchAdminData();
            }
        } else {
            state.user = null;
            state.profile = null;
            state.addresses = [];
            state.cart = {}; // Clear cart on logout
        }
        renderApp();
    });
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
    bootstrapApp();
}
