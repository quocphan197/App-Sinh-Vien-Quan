const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const VOUCHER_RULES = {
    KHOINGHI5K: { type: 'fixed', amount: 5000, minOrder: 35000 },
    TRATACFREE: { type: 'free_drink', amount: 25000, drinkIds: ['drink-5'] },
    CUOITUAN50: { type: 'percent_category', percent: 50, category: 'drink', minOrder: 50000 },
    GIAM10: { type: 'fixed', amount: 10000, minOrder: 50000 },
    SINHVIEN15: { type: 'percent', percent: 15, minOrder: 0 }
};

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 1. Verify User Session from JWT Token
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing Authorization Header' });
        }
        const token = authHeader.split(' ')[1];
        
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid User Token' });
        }

        // 2. Parse request body parameters
        const { addressId, deliveryAddress, notes, paymentMethod, appliedVoucherCode } = req.body;

        if (!paymentMethod) {
            return res.status(400).json({ error: 'Vui lòng chọn phương thức thanh toán.' });
        }

        // 3. Fetch user's cart items
        const { data: cartItems, error: cartError } = await supabase
            .from('cart_items')
            .select('product_id, quantity')
            .eq('user_id', user.id);

        if (cartError) {
            console.error('Cart query error:', cartError);
            return res.status(500).json({ error: 'Lỗi truy vấn giỏ hàng.' });
        }

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: 'Giỏ hàng của bạn đang trống.' });
        }

        // 4. Fetch actual product details from products table
        const productIds = cartItems.map(item => item.product_id);
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

        if (prodError) {
            console.error('Products query error:', prodError);
            return res.status(500).json({ error: 'Lỗi truy vấn thông tin sản phẩm.' });
        }

        // 5. Calculate subtotal and validate stock
        let subtotal = 0;
        for (const item of cartItems) {
            const product = products.find(p => p.id === item.product_id);
            if (!product) {
                return res.status(400).json({ error: `Sản phẩm ${item.product_id} không tồn tại.` });
            }
            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({ error: `Món "${product.name}" đã hết hàng hoặc không đủ số lượng trong kho.` });
            }
            subtotal += product.price * item.quantity;
        }

        // 6. Calculate Voucher Discount Server-side
        let discount = 0;
        if (appliedVoucherCode) {
            const rule = VOUCHER_RULES[appliedVoucherCode];
            if (rule) {
                if (!rule.minOrder || subtotal >= rule.minOrder) {
                    if (rule.type === 'fixed') {
                        discount = Math.min(rule.amount, subtotal);
                    } else if (rule.type === 'percent') {
                        discount = Math.round(subtotal * rule.percent / 100);
                    } else if (rule.type === 'percent_category') {
                        let drinkTotal = 0;
                        for (const item of cartItems) {
                            const product = products.find(p => p.id === item.product_id);
                            if (product && product.category_id === 'drink') {
                                drinkTotal += product.price * item.quantity;
                            }
                        }
                        if (drinkTotal > 0) {
                            discount = Math.round(drinkTotal * rule.percent / 100);
                        }
                    } else if (rule.type === 'free_drink') {
                        const hasDrink = cartItems.some(item => rule.drinkIds.includes(item.product_id));
                        if (hasDrink) {
                            discount = 25000;
                        }
                    }
                }
            }
        }

        const prepFee = 3000;
        const finalAmount = Math.max(0, subtotal + prepFee - discount);

        // 7. Resolve delivery address
        let deliveryAddressText = '';
        if (addressId) {
            const { data: addr, error: addrError } = await supabase
                .from('addresses')
                .select('label, description')
                .eq('id', addressId)
                .eq('user_id', user.id)
                .single();
            if (addr) {
                deliveryAddressText = `${addr.label}: ${addr.description}`;
            } else {
                return res.status(400).json({ error: 'Địa chỉ nhận hàng đã chọn không tồn tại.' });
            }
        } else {
            deliveryAddressText = deliveryAddress;
        }

        if (!deliveryAddressText || deliveryAddressText.trim() === '') {
            return res.status(400).json({ error: 'Vui lòng cung cấp địa chỉ nhận hàng.' });
        }

        // 8. Generate Order ID (Format: SVQ-XXXXXX)
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        const orderId = `SVQ-${randomDigits}`;

        // 9. Insert order into orders table
        const { error: orderInsertErr } = await supabase
            .from('orders')
            .insert({
                id: orderId,
                user_id: user.id,
                total_amount: subtotal,
                discount_amount: discount,
                prep_fee: prepFee,
                final_amount: finalAmount,
                payment_method: paymentMethod,
                payment_status: 'PENDING',
                order_status: 'PENDING',
                notes: notes || '',
                delivery_address: deliveryAddressText
            });

        if (orderInsertErr) {
            console.error('Order insert error:', orderInsertErr);
            return res.status(500).json({ error: 'Lỗi lưu thông tin đơn hàng.' });
        }

        // 10. Insert order items
        const orderItemsToInsert = cartItems.map(item => {
            const product = products.find(p => p.id === item.product_id);
            return {
                order_id: orderId,
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_purchase: product.price
            };
        });

        const { error: itemsInsertErr } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsInsertErr) {
            console.error('Order items insert error:', itemsInsertErr);
            // Attempt rollback by deleting the order
            await supabase.from('orders').delete().eq('id', orderId);
            return res.status(500).json({ error: 'Lỗi lưu chi tiết đơn hàng.' });
        }

        // 11. Decrement product stock quantities
        for (const item of cartItems) {
            const product = products.find(p => p.id === item.product_id);
            const newStock = product.stock_quantity - item.quantity;
            await supabase
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', item.product_id);
        }

        // 12. Clear user's cart in Supabase
        await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id);

        // 13. Return success order details
        return res.status(200).json({
            success: true,
            orderId: orderId,
            finalAmount: finalAmount,
            message: 'Đơn hàng đã được đặt thành công!'
        });

    } catch (e) {
        console.error('Serverless API checkout error:', e);
        return res.status(500).json({ error: 'Lỗi hệ thống trong quá trình đặt hàng.' });
    }
};
