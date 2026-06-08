const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// payOS Configuration
const payosChecksumKey = process.env.PAYOS_CHECKSUM_KEY;

function verifyWebhookSignature(body, checksumKey) {
    const signature = body.signature;
    const data = body.data;

    if (!signature || !data) return false;

    // Sort data fields alphabetically
    const sortedKeys = Object.keys(data).sort();
    const sortedData = {};
    sortedKeys.forEach(key => {
        sortedData[key] = data[key];
    });

    const signString = Object.entries(sortedData)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    const computedSignature = crypto
        .createHmac('sha256', checksumKey)
        .update(signString)
        .digest('hex');

    return computedSignature === signature;
}

module.exports = async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body;

        // 1. Verify webhook signature to prevent spoofing
        const isVerified = verifyWebhookSignature(body, payosChecksumKey);
        if (!isVerified) {
            console.error('payOS Webhook verification failed. Invalid Signature.');
            return res.status(400).json({ error: 'Invalid Signature' });
        }

        const webhookData = body.data;
        const orderCode = webhookData.orderCode;
        const orderId = `SVQ-${orderCode}`;

        console.log(`payOS Webhook received for Order ${orderId}:`, body);

        // Check if transaction is successful
        if (body.code === '00') {
            // 2. Fetch current order status to prevent redundant updates
            const { data: order } = await supabase
                .from('orders')
                .select('payment_status')
                .eq('id', orderId)
                .single();

            if (order && order.payment_status !== 'PAID') {
                // 3. Update order payment status and progress step
                const { error: orderUpdateErr } = await supabase
                    .from('orders')
                    .update({
                        payment_status: 'PAID',
                        order_status: 'PREPARING'
                    })
                    .eq('id', orderId);

                if (orderUpdateErr) {
                    console.error('Error updating order on webhook:', orderUpdateErr);
                    return res.status(500).json({ error: 'Database update failed' });
                }

                // 4. Update transaction status in payments table
                await supabase
                    .from('payments')
                    .update({
                        status: 'SUCCESS',
                        transaction_id: webhookData.reference || webhookData.paymentLinkId,
                        raw_response: body
                    })
                    .eq('order_id', orderId);

                console.log(`Order ${orderId} marked as PAID via webhook.`);
            }
        }

        // Return 200 OK to payOS to confirm receipt
        return res.status(200).json({ success: true });

    } catch (e) {
        console.error('payOS webhook system error:', e);
        return res.status(500).json({ error: 'Webhook handling system error' });
    }
};
