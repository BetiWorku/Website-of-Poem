const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/authMiddleware');
const Poem = require('../models/Poem');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const paypal = require('@paypal/checkout-server-sdk');
const crypto = require('crypto');
const axios = require('axios');

// ─── PAYPAL INITIALIZATION ───
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const isProd = process.env.NODE_ENV === 'production';

let paypalClient = null;
if (clientId && !clientId.includes('placeholder')) {
    const environment = isProd 
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);
    paypalClient = new paypal.core.PayPalHttpClient(environment);
}

const TELEBIRR_RETURN_URL = `${process.env.FRONTEND_URL}/payment-success`;

const CHAPA_SECRET_KEY = (process.env.CHAPA_SECRET_KEY || '').trim();
const CHAPA_API_URL = process.env.CHAPA_API_URL || 'https://api.chapa.co/v1';

const sendEmail = require('../utils/sendEmail');

// ─── UTILITY: RECORD TRANSACTION & SEND RECEIPT ───
const recordTransaction = async (poemId, method, paymentId, amount, user = null, guestInfo = {}) => {
    // 1. Prevent Duplicates
    const existingTxn = await Transaction.findOne({ paymentId });
    if (existingTxn) {
        console.log(`⚠️ Transaction ${paymentId} already processed. Skipping duplicate record.`);
        return existingTxn;
    }

    const poem = await Poem.findById(poemId);
    if (!poem) {
        console.error(`❌ Poem ${poemId} not found during transaction recording.`);
        return null;
    }

    // 2. Unlock Poem for User
    if (user) {
        await User.updateOne(
            { _id: user._id },
            { 
                $addToSet: { purchasedPoems: poemId },
                $inc: { balance: -amount } 
            }
        );
    }

    // ─── COMMISSION SYSTEM ───
    const authorId = poem.author;
    const adminCommission = amount * 0.10; // Admin takes 10%
    const authorEarnings = amount * 0.90; // Writer takes 90%

    // Update Writer's Earnings (Crucial: ensure we found the author)
    if (authorId) {
        const authorUpdate = await User.updateOne({ _id: authorId }, { $inc: { earnings: authorEarnings } });
        if (authorUpdate.modifiedCount === 0) {
            console.error(`❌ Writer ${authorId} payout failed (User not found or not updated).`);
        } else {
            console.log(`✅ Writer ${authorId} paid: $${authorEarnings.toFixed(2)}`);
        }
    } else {
        console.warn(`⚠️ No author found for poem ${poemId}. Earnings pooled to admin.`);
    }

    // Update Admin's Earnings
    await User.updateOne(
        { $or: [{ email: 'bwwmas@gmail.com' }, { role: 'admin' }] }, 
        { $inc: { earnings: authorId ? adminCommission : amount } }
    );
    // ─────────────────────────
    
    // 2. Create the Ledger Entry
    const txn = await Transaction.create({
        userId: user ? user._id : null,
        guestName: guestInfo.name || (user ? user.username : 'Guest'),
        guestEmail: guestInfo.email || (user ? user.email : 'guest@poetry.com'),
        poemId,
        amount,
        paymentMethod: method,
        paymentId,
        status: 'completed'
    });

    // 3. SEND THE "REAL RECEIPT" EMAIL
    try {
        const targetEmail = guestInfo.email || (user ? user.email : null);
        if (targetEmail) {
            await sendEmail({
                to: targetEmail,
                subject: `🧾 Official Receipt: ${poem.title}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #1a1a1a;">Payment Receipt</h2>
                        <p>Thank you for purchasing <strong>"${poem.title}"</strong>!</p>
                        <hr />
                        <p><strong>Transaction ID:</strong> ${paymentId}</p>
                        <p><strong>Payment Method:</strong> ${method}</p>
                        <p><strong>Amount Paid:</strong> $${amount}</p>
                        <p><strong>Status:</strong> Success</p>
                        <hr />
                        <p>Your poem is now unlocked in your digital library. Enjoy the verse!</p>
                    </div>
                `
            });
        }
    } catch (err) {
        console.error("Receipt Email Failed:", err.message);
    }

    return txn;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛒 STRIPE ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @desc Create Stripe Checkout Session
 * @route POST /api/payments/create-checkout-session
 */
router.post('/create-checkout-session', async (req, res) => {
    const { poemId, guestEmail } = req.body;
    try {
        const poem = await Poem.findById(poemId);
        if (!poem) return res.status(404).json({ message: 'Poem not found' });

        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
            throw new Error("Stripe Secret Key is missing or invalid.");
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: req.user ? req.user.email : guestEmail,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: poem.title, description: `Poem by ${poem.authorName}` },
                    unit_amount: Math.round(poem.price * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&poem_id=${poemId}&method=Stripe`,
            cancel_url: `${process.env.FRONTEND_URL}/poems/${poemId}`,
            metadata: { poemId: poemId.toString(), userId: req.user ? req.user._id.toString() : 'GUEST' }
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('❌ STRIPE ERROR:', error.message);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc Create Stripe Payment Intent (for embedded card element)
 * @route POST /api/payments/create-payment-intent
 */
router.post('/create-payment-intent', async (req, res) => {
    const { poemId, guestName, guestEmail } = req.body;
    try {
        const poem = await Poem.findById(poemId);
        if (!poem) return res.status(404).json({ message: 'Poem not found' });

        // If using documentation keys or placeholders, return a demo secret
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
            return res.json({ clientSecret: 'DEMO_SECRET_' + Date.now() });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(poem.price * 100),
            currency: 'usd',
            payment_method_types: ['card'],
            description: `Poem: ${poem.title}`,
            metadata: { 
                poemId: poem._id.toString(),
                guestName: guestName || 'Guest',
                guestEmail: guestEmail || 'guest@poetry.com'
            },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('❌ PAYMENT INTENT ERROR:', error.message);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc Generic Payment Verification (used by frontend Success page)
 */
router.post('/verify-payment', async (req, res) => {
    console.log('📡 [VERIFY-PAYMENT] Body:', JSON.stringify(req.body, null, 2));
    const { sessionId, orderId, outTradeNo, tx_ref, poemId, method, guestName, guestEmail } = req.body;
    try {
        const poem = await Poem.findById(poemId);
        if (!poem) return res.status(404).json({ message: 'Poem not found' });

        if (method === 'Stripe') {
            const session = await stripe.checkout.sessions.retrieve(sessionId);
            if (session.payment_status === 'paid') {
                await recordTransaction(poemId, 'Stripe', sessionId, poem.price, req.user, { name: guestName, email: guestEmail });
                return res.json({ success: true, message: 'Stripe payment verified!' });
            }
        } else if (method === 'PayPal') {
            const request = new paypal.orders.OrdersCaptureRequest(orderId);
            const capture = await paypalClient.execute(request);
            if (capture.result.status === 'COMPLETED') {
                await recordTransaction(poemId, 'PayPal', orderId, poem.price, req.user, { name: guestName, email: guestEmail });
                return res.json({ success: true, message: 'PayPal payment captured!' });
            }
        } else if (method === 'Chapa') {
            if (!tx_ref) {
                console.warn('❌ Chapa verification attempt with missing tx_ref');
                return res.status(400).json({ success: false, message: 'Missing transaction reference (tx_ref)' });
            }
            console.log(`🔍 [CHAPA] Verifying: ${tx_ref} (Key exists: ${!!CHAPA_SECRET_KEY})`);
            const config = { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } };
            const response = await axios.get(`${CHAPA_API_URL}/transaction/verify/${tx_ref}`, config);
            console.log('📦 CHAPA VERIFY RESPONSE:', JSON.stringify(response.data, null, 2));
            
            if (response.data.status === 'success' && (response.data.data.status === 'success' || response.data.data.status === 'PARTIAL_SUCCESS')) {
                await recordTransaction(poemId, 'Chapa', tx_ref, poem.price, req.user, { name: guestName, email: guestEmail });
                return res.json({ success: true, message: 'Chapa payment verified!' });
            } else {
                console.warn('❌ CHAPA VERIFY FAILED BEYOND API CALL:', response.data.message);
                return res.status(400).json({ success: false, message: response.data.message || 'Transaction verification failed at gateway' });
            }
        }

        res.status(400).json({ success: false, message: 'Payment verification failed' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc Verify Stripe Payment (Legacy name or for direct use)
 */
router.post('/verify-stripe', async (req, res) => {
    const { sessionId, poemId, guestName, guestEmail } = req.body;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status === 'paid') {
            const poem = await Poem.findById(poemId);
            await recordTransaction(poemId, 'Stripe', sessionId, poem.price, req.user, { name: guestName, email: guestEmail });
            res.json({ success: true, message: 'Payment verified!' });
        } else {
            res.status(400).json({ success: false, message: 'Payment incomplete' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💳 PAYPAL ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @desc Create PayPal Order
 */
router.post('/paypal/create-order', async (req, res) => {
    const { poemId } = req.body;
    try {
        if (!paypalClient) {
            return res.status(400).json({ 
                message: "PayPal is in Demo Mode. Real orders cannot be created without a valid Client ID.",
                isDemo: true 
            });
        }
        const poem = await Poem.findById(poemId);
        if (!poem) return res.status(404).json({ message: 'Poetry scroll not found' });

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [{
                amount: { currency_code: 'USD', value: Number(poem.price).toFixed(2) },
                description: `Verse: ${poem.title}`
            }]
        });

        const order = await paypalClient.execute(request);
        res.json({ id: order.result.id });
    } catch (error) {
        console.error('❌ PAYPAL ERROR:', error.message);
        res.status(500).json({ message: error.message });
    }
});

/**
 * @desc Capture PayPal Order
 */
router.post('/paypal/capture-order', async (req, res) => {
    const { orderId, poemId, guestName, guestEmail } = req.body;
    try {
        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        const capture = await paypalClient.execute(request);

        if (capture.result.status === 'COMPLETED') {
            const poem = await Poem.findById(poemId);
            await recordTransaction(poemId, 'PayPal', orderId, poem.price, req.user, { name: guestName, email: guestEmail });
            res.json({ success: true, message: 'PayPal payment captured!' });
        } else {
            res.status(400).json({ success: false, message: 'Order status: ' + capture.result.status });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏺 CHAPA ROUTES (ETHIOPIAN GATEWAY)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * @desc Initialize Chapa Payment
 * @route POST /api/payments/chapa/initialize
 */
router.post('/chapa/initialize', async (req, res) => {
    const { poemId, guestName, guestEmail } = req.body;
    try {
        const poem = await Poem.findById(poemId);
        if (!poem) return res.status(404).json({ message: 'Poem not found' });

        const tx_ref = `CHAPA-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
        
        const nameParts = (guestName || req.user?.username || 'Guest Writer').split(' ');
        const first_name = nameParts[0];
        const last_name = nameParts.slice(1).join(' ') || 'User';

        // Chapa title/desc can ONLY contain: letters, numbers, hyphens, underscores, spaces, dots.
        const cleanString = (str) => str.replace(/[^a-zA-Z0-9-_\s.]/g, '');

        const data = {
            amount: poem.price.toString(),
            currency: 'ETB', // Chapa primarily uses ETB
            email: guestEmail || req.user?.email || 'guest@poetry.com',
            first_name,
            last_name,
            tx_ref,
            callback_url: `${process.env.BACKEND_URL}/api/payments/chapa/callback`,
            return_url: `${process.env.FRONTEND_URL}/payment-success?method=Chapa&poem_id=${poemId}&tx_ref=${tx_ref}`,
            customization: {
                title: "PoemPurchase",
                description: "DigitalPoetryPurchase"
            }
        };
        
        console.log('💎 CHAPA DATA:', data);

        const config = {
            headers: {
                Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await axios.post(`${CHAPA_API_URL}/transaction/initialize`, data, config);
        
        if (response.data.status === 'success') {
            res.json({ checkout_url: response.data.data.checkout_url, tx_ref });
        } else {
            throw new Error(response.data.message || 'Chapa initialization failed');
        }
    } catch (error) {
        console.error('❌ CHAPA INITIALIZE ERROR:', error.response?.data || error.message);
        res.status(500).json({ message: error.response?.data?.message || error.message });
    }
});

/**
 * @desc Verify Chapa Transaction
 * @route GET /api/payments/chapa/verify/:tx_ref
 */
router.get('/chapa/verify/:tx_ref', async (req, res) => {
    const { tx_ref } = req.params;
    const { poemId, guestName, guestEmail } = req.query;

    try {
        const config = {
            headers: {
                Authorization: `Bearer ${CHAPA_SECRET_KEY}`
            }
        };

        const response = await axios.get(`${CHAPA_API_URL}/transaction/verify/${tx_ref}`, config);

        if (response.data.status === 'success' && response.data.data.status === 'success') {
            const poem = await Poem.findById(poemId);
            const amount = response.data.data.amount;
            
            // Record the transaction
            await recordTransaction(poemId, 'Chapa', tx_ref, amount, req.user, { 
                name: guestName, 
                email: guestEmail 
            });

            res.json({ success: true, message: 'Chapa payment verified!' });
        } else {
            res.status(400).json({ success: false, message: 'Chapa payment verification failed' });
        }
    } catch (error) {
        console.error('❌ CHAPA VERIFY ERROR:', error.response?.data || error.message);
        res.status(500).json({ message: error.response?.data?.message || error.message });
    }
});

/**
 * @desc Chapa Webhook Callback
 */
router.post('/chapa/callback', async (req, res) => {
    // Chapa sends a webhook. Ideally we verify the signature here.
    // For now, we process if the status is success.
    const { tx_ref, status, amount, email } = req.body;
    
    if (status === 'success') {
        console.log(`✅ CHAPA WEBHOOK: Payment success for ${tx_ref}`);
        // Here you would find the transaction and update it if it's not already updated.
    }
    
    res.sendStatus(200);
});

module.exports = router;

