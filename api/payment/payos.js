const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// payOS Configuration
const payosClientId = process.env.PAYOS_CLIENT_ID;
const payosApiKey = process.env.PAYOS_API_KEY;
const payosChecksumKey = process.env.PAYOS_CHECKSUM_KEY;

function getSignature(data, checksumKey) {
    const sortedKeys = Object.keys(data).sort();
    const sortedData = {};
    sortedKeys.forEach(key => {
        sortedData[key] = data[key];
    });

    const signString = Object.entries(sortedData)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    return crypto
        .createHmac('sha256', checksumKey)
        .update(signString)
        .digest('hex');
}

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
        // 1. Verify User Session
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }
        const token = authHeader.split(' ')[1];
        
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        // 2. Parse request body parameters
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ error: 'Missing orderId parameter.' });
        }

        // 3. Fetch order details from database
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single();

        if (orderErr || !order) {
            return res.status(400).json({ error: 'Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn.' });
        }

        if (order.payment_status === 'PAID') {
            return res.status(400).json({ error: 'Đơn hàng đã được thanh toán trước đó.' });
        }

        // 4. Parse orderCode (digits of SVQ-XXXXXX)
        const orderCode = parseInt(orderId.replace('SVQ-', ''));
        if (isNaN(orderCode)) {
            return res.status(500).json({ error: 'Mã đơn hàng không hợp lệ cho thanh toán payOS.' });
        }

        // Resolve URLs
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const returnUrl = `${protocol}://${host}/app.html#/orders?payment=success`;
        const cancelUrl = `${protocol}://${host}/app.html#/orders?payment=cancelled`;

        // 5. Build payOS payment details
        const paymentData = {
            orderCode: orderCode,
            amount: Number(order.final_amount),
            description: `Thanh toan don ${orderId}`.substring(0, 25), // payOS limits desc to 25 chars
            cancelUrl: cancelUrl,
            returnUrl: returnUrl
        };

        // Compute Signature
        const signature = getSignature(paymentData, payosChecksumKey);
        paymentData.signature = signature;

        // 6. Create payment request to payOS API
        const payosResponse = await fetch('https://api-merchant.payos.vn/v2/payment-requests', {
            method: 'POST',
            headers: {
                'x-client-id': payosClientId,
                'x-api-key': payosApiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const payosResult = await payosResponse.json();

        if (!payosResponse.ok || payosResult.code !== '00') {
            console.error('payOS Error response:', payosResult);
            return res.status(500).json({ error: payosResult.desc || 'Lỗi kết nối cổng thanh toán payOS.' });
        }

        // 7. Save log to payments table
        await supabase.from('payments').insert({
            order_id: orderId,
            payment_provider: 'payos',
            transaction_id: payosResult.data.paymentLinkId,
            amount: order.final_amount,
            status: 'PENDING',
            raw_response: payosResult
        });

        // 8. Return success response
        return res.status(200).json({
            success: true,
            checkoutUrl: payosResult.data.checkoutUrl
        });

    } catch (e) {
        console.error('payOS serverless creation error:', e);
        return res.status(500).json({ error: 'Lỗi hệ thống khi tạo giao dịch thanh toán.' });
    }
};
