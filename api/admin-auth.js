// POST /api/admin-auth  → login with { password }
// DELETE /api/admin-auth → logout
//
// Password is compared in constant time to process.env.ADMIN_PASSWORD.
// On success an HMAC-signed, HttpOnly, Secure cookie is set for 8 hours.

import { issueAdminCookie, clearAdminCookie, checkAdminPassword } from './_lib/storage.js';

// Per-IP login rate limit (login brute-force defense)
const loginAttempts = new Map();
const WINDOW = 10 * 60 * 1000;
const MAX = 10;

function rateLimited(ip) {
    const now = Date.now();
    const e = loginAttempts.get(ip);
    if (!e || now - e.start > WINDOW) {
        loginAttempts.set(ip, { start: now, count: 1 });
        return false;
    }
    e.count++;
    return e.count > MAX;
}

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        res.setHeader('Set-Cookie', clearAdminCookie());
        return res.status(200).json({ success: true });
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    if (rateLimited(ip)) {
        return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    }

    const password = (req.body && req.body.password) || '';
    if (!process.env.ADMIN_PASSWORD) {
        return res.status(500).json({ error: 'Admin password not configured on server.' });
    }
    if (!checkAdminPassword(password)) {
        return res.status(401).json({ error: 'Invalid password.' });
    }

    try {
        res.setHeader('Set-Cookie', issueAdminCookie());
        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('issueAdminCookie error:', err);
        return res.status(500).json({ error: 'Could not issue session.' });
    }
}
