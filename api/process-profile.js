// POST /api/process-profile
//
// Lightweight form handler: validates, emails Ryan the profile, returns
// success to the student. No AI, no Blob, no PDF generation — just email.
//
// The full AI pipeline is preserved in process-profile-full-pipeline.js.bak
// and the split endpoints (process-arc.js, test-arc.js, test-dossier.js).

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 15 };

const RYAN_EMAIL = 'ryan@rrgolfperformance.com';

// Lazy-init Supabase admin client (uses service-role key, bypasses RLS).
// Returns null if env vars aren't set so we degrade gracefully to email-only.
let _supabaseAdmin = null;
function getSupabaseAdmin() {
    if (_supabaseAdmin) return _supabaseAdmin;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    _supabaseAdmin = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
    return _supabaseAdmin;
}

// Simple per-instance rate limiter.
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip) {
    const now = Date.now();
    const entry = rateLimit.get(ip);
    if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
        rateLimit.set(ip, { start: now, count: 1 });
        return false;
    }
    entry.count++;
    return entry.count > RATE_LIMIT_MAX;
}

function buildEmailHtml(studentName, studentEmail, data) {
    const summaryLines = [];
    for (const [key, value] of Object.entries(data)) {
        if (key === 'website') continue;
        const pretty = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const val = Array.isArray(value) ? value.join(', ') : (value || '\u2014');
        summaryLines.push(
            `<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top;white-space:nowrap;">${pretty}</td>` +
            `<td style="padding:4px 0;vertical-align:top;">${val}</td></tr>`
        );
    }

    return `
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;">
  <p style="margin:0 0 12px;font-size:15px;">New <b>Know Your Game</b> profile submitted.</p>
  <h3 style="margin:16px 0 8px;color:#0A1628;">${studentName}</h3>
  <p style="margin:0 0 16px;color:#666;">${studentEmail}</p>
  <table style="border-collapse:collapse;font-size:14px;width:100%;">
    ${summaryLines.join('\n    ')}
  </table>
  <hr style="margin:24px 0;border:none;border-top:1px solid #ddd;">
  <p style="color:#999;font-size:12px;">
    Submitted ${new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' })}
  </p>
</div>`;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const data = req.body || {};

    // Honeypot — pretend success.
    if (data.website) {
        return res.status(200).json({ success: true });
    }

    if (!data.full_name || !data.email) {
        return res.status(400).json({ error: 'Name and email are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
        return res.status(400).json({ error: 'A valid email is required.' });
    }

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
        console.error('RESEND_API_KEY not set');
        return res.status(500).json({ error: 'Server not fully configured.' });
    }

    const studentName = String(data.full_name).slice(0, 120);
    const studentEmail = String(data.email).slice(0, 254);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Ryan Rinneard <ryan@rrgolfperformance.com>';

    try {
        const resend = new Resend(resendKey);
        const result = await resend.emails.send({
            from: fromEmail,
            to: RYAN_EMAIL,
            replyTo: studentEmail,
            subject: `[Know Your Game] ${studentName}`,
            html: buildEmailHtml(studentName, studentEmail, data),
        });

        if (result.error) {
            console.error('Email send error:', result.error);
            return res.status(502).json({ error: 'Failed to send profile. Please try again.' });
        }

        // Persist to Supabase so the submission shows up in the coach
        // dashboard's "Pending Junior Submissions" panel. This is best-effort —
        // we never fail the request just because the DB write failed; the
        // student already got their confirmation and Ryan got the email.
        const admin = getSupabaseAdmin();
        if (admin) {
            try {
                const { error: dbErr } = await admin
                    .from('public_submissions')
                    .insert({
                        full_name: studentName,
                        email: studentEmail,
                        submission_data: data,
                    });
                if (dbErr) console.error('public_submissions insert error:', dbErr);
            } catch (dbErr) {
                console.error('public_submissions insert threw:', dbErr);
            }
        } else {
            console.warn('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — submission emailed only.');
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Email error:', err);
        return res.status(502).json({ error: 'Failed to send profile. Please try again.' });
    }
}
