// POST /api/admin-auth  → login with { password }
// DELETE /api/admin-auth → logout
//
// Password is compared in constant time to process.env.ADMIN_PASSWORD.
// On success an HMAC-signed, HttpOnly, Secure cookie is set for 8 hours.

import { createClient } from '@supabase/supabase-js';
import { issueAdminCookie, clearAdminCookie, checkAdminPassword } from './_lib/storage.js';

// Per-IP login rate limit (login brute-force defense)
const loginAttempts = new Map();
const WINDOW = 10 * 60 * 1000;
const MAX = 10;

// Coaches who may mint an admin session straight from their Supabase login.
// Keep in sync with RRG.COACH_EMAILS in adult/assets/app.js + portal/assets/app.js.
const COACH_EMAILS = ['ryanrinneard@gmail.com', 'rrinneard@madriver.ca'];

// Verify a Supabase access token and confirm it belongs to a coach (by email
// allowlist or profiles.role === 'coach'). Returns true/false.
async function verifyCoachToken(token) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || !token) return false;
    try {
        const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
        const { data, error } = await sb.auth.getUser(token);
        if (error || !data?.user) return false;
        const u = data.user;
        if (u.email && COACH_EMAILS.includes(u.email.toLowerCase())) return true;
        const { data: prof } = await sb.from('profiles').select('role').eq('id', u.id).maybeSingle();
        return prof?.role === 'coach';
    } catch {
        return false;
    }
}

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

    // Coach-session path: a logged-in coach (Supabase) mints an admin cookie
    // without the password. This is what lets the coach dashboard work on a
    // single sign-in. Checked before the password/rate-limit path.
    const authz = req.headers.authorization || '';
    const bearer = authz.startsWith('Bearer ') ? authz.slice(7).trim() : '';
    if (bearer) {
        if (!(await verifyCoachToken(bearer))) {
            return res.status(401).json({ error: 'Not a coach session.' });
        }
        try {
            res.setHeader('Set-Cookie', issueAdminCookie());
            return res.status(200).json({ success: true, via: 'coach-session' });
        } catch (err) {
            console.error('issueAdminCookie (coach session) error:', err);
            return res.status(500).json({ error: 'Could not issue session.' });
        }
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
