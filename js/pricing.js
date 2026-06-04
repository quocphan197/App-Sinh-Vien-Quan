// Shared cart & voucher pricing (used by ES module components)
import { combos, singleItems, VOUCHER_RULES, PREP_FEE } from './database.js';

export function findProduct(itemId) {
    return combos.find(c => c.id === itemId) || singleItems.find(i => i.id === itemId) || null;
}

export function getCartLines(cart) {
    return Object.entries(cart || {})
        .map(([id, qty]) => {
            const product = findProduct(id);
            if (!product || qty <= 0) return null;
            return { id, qty, product, lineTotal: product.price * qty };
        })
        .filter(Boolean);
}

export function calcCartSubtotal(cart) {
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

export function calcVoucherDiscount(cart, code) {
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

export function calcOrderTotals(cart, voucherCode) {
    const cartTotal = calcCartSubtotal(cart);
    const { discount, error } = calcVoucherDiscount(cart, voucherCode);
    const finalTotal = Math.max(0, cartTotal + PREP_FEE - discount);
    return { cartTotal, prepFee: PREP_FEE, discount, finalTotal, error };
}

export function formatCartItemNames(cart) {
    return getCartLines(cart)
        .map((line) => `${line.product.name || line.product.dishName} x${line.qty}`)
        .join(', ');
}

export function getVoucherLabel(code, discount) {
    if (!code || !discount) return 'Chọn ưu đãi';
    return `<span class="bg-status-red/10 text-status-red border border-status-red/20 px-2 py-0.5 rounded text-[10px] font-bold">-${discount.toLocaleString('vi-VN')}đ (${code})</span>`;
}
