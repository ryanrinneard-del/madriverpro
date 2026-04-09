import { createHash } from 'crypto';

// Simple in-memory rate limiter (resets per function instance)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per IP per minute

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimit.get(ip);

    if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
        rateLimit.set(ip, { start: now, count: 1 });
        return false;
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) return true;
    return false;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Rate limiting by IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const { email, first_name, website } = req.body;

    // Honeypot — bots fill hidden fields, real users don't
    if (website) {
        return res.status(200).json({ success: true });
    }

    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ error: 'A valid email is required' });
    }

    // Sanitize first_name
    const safeName = (first_name || '').replace(/[^a-zA-Z\s\-']/g, '').slice(0, 50);

    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;
    const SERVER = process.env.MAILCHIMP_SERVER || 'us17';

    if (!API_KEY || !LIST_ID) {
        console.error('Missing MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    const auth = Buffer.from(`anystring:${API_KEY}`).toString('base64');
    const subscriberHash = createHash('md5').update(email.toLowerCase()).digest('hex');

    try {
        // Use PUT to create-or-update the subscriber
        const response = await fetch(
            `https://${SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${subscriberHash}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`,
                },
                body: JSON.stringify({
                    email_address: email,
                    status_if_new: 'subscribed',
                    merge_fields: {
                        FNAME: safeName,
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Mailchimp API error:', error);
            return res.status(502).json({ error: 'Failed to subscribe' });
        }

        // Add the ebook-download tag
        const tagRes = await fetch(
            `https://${SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members/${subscriberHash}/tags`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${auth}`,
                },
                body: JSON.stringify({
                    tags: [{ name: 'ebook-download', status: 'active' }],
                }),
            }
        );

        if (!tagRes.ok) {
            console.error('Mailchimp tag error:', await tagRes.text());
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Subscribe error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
