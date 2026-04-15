// Shared storage + auth helpers used by the profile-review pipeline.
//
// Storage strategy:
//   - Vercel Blob is used for all persisted artifacts (submissions, analyses, PDFs).
//   - Requires the env var BLOB_READ_WRITE_TOKEN (auto-provisioned when you add
//     Vercel Blob to the project in the Vercel dashboard).
//   - The blob store is configured as **Private** in the Vercel dashboard.
//     Reads are mediated by /api/get-asset.js which verifies the admin cookie
//     before streaming content; uploads happen server-side via this helper.
//     The `access: 'private'` option below matches the store's ACL setting.
//   - A single JSON "index" file tracks submissions so the admin dashboard can
//     list them without scanning the blob store.
//
// Everything here is server-only.

import { put, list, head, del } from '@vercel/blob';
import { createHmac, timingSafeEqual, randomBytes } from 'crypto';

const INDEX_KEY = 'profiles/_index.json';

export function requireEnv(name) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing required env var: ${name}`);
    return v;
}

export function newSubmissionId() {
    // URL-safe 12-char id, timestamp-prefixed so listing is chronological.
    const ts = Date.now().toString(36);
    const rnd = randomBytes(6).toString('hex');
    return `${ts}-${rnd}`;
}

// ---------- Submission index ----------

export async function readIndex() {
    try {
        const token = requireEnv('BLOB_READ_WRITE_TOKEN');
        const blobs = await list({ prefix: INDEX_KEY, token });
        const match = blobs.blobs.find((b) => b.pathname === INDEX_KEY);
        if (!match) return { submissions: [] };
        const res = await fetch(match.url, { cache: 'no-store' });
        if (!res.ok) return { submissions: [] };
        return await res.json();
    } catch (err) {
        console.error('readIndex error:', err);
        return { submissions: [] };
    }
}

export async function writeIndex(index) {
    const token = requireEnv('BLOB_READ_WRITE_TOKEN');
    await put(INDEX_KEY, JSON.stringify(index, null, 2), {
        access: 'private',
        token,
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
    });
}

export async function appendSubmission(entry) {
    const index = await readIndex();
    index.submissions = index.submissions || [];
    index.submissions.unshift(entry); // newest first
    await writeIndex(index);
}

export async function updateSubmission(id, patch) {
    const index = await readIndex();
    index.submissions = (index.submissions || []).map((s) =>
        s.id === id ? { ...s, ...patch } : s
    );
    await writeIndex(index);
}

// ---------- Blob helpers ----------

export async function putJson(key, obj) {
    const token = requireEnv('BLOB_READ_WRITE_TOKEN');
    const blob = await put(key, JSON.stringify(obj, null, 2), {
        access: 'private',
        token,
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
    });
    return blob.url;
}

export async function putText(key, text, contentType = 'text/plain; charset=utf-8') {
    const token = requireEnv('BLOB_READ_WRITE_TOKEN');
    const blob = await put(key, text, {
        access: 'private',
        token,
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
    });
    return blob.url;
}

export async function putBinary(key, buffer, contentType) {
    const token = requireEnv('BLOB_READ_WRITE_TOKEN');
    const blob = await put(key, buffer, {
        access: 'private',
        token,
        contentType,
        addRandomSuffix: false,
        allowOverwrite: true,
    });
    return blob.url;
}

export async function fetchBlob(urlOrKey) {
    // urlOrKey may be a full blob URL or a pathname.
    if (urlOrKey.startsWith('http')) {
        const res = await fetch(urlOrKey, { cache: 'no-store' });
        if (!res.ok) throw new Error(`fetchBlob failed: ${res.status}`);
        return res;
    }
    const token = requireEnv('BLOB_READ_WRITE_TOKEN');
    const h = await head(urlOrKey, { token });
    const res = await fetch(h.url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`fetchBlob failed: ${res.status}`);
    return res;
}

export async function deleteBlob(urlOrKey) {
    const token = requireEnv('BLOB_READ_WRITE_TOKEN');
    try {
        await del(urlOrKey, { token });
    } catch (err) {
        console.error('deleteBlob error:', err);
    }
}

// ---------- Admin auth (cookie-based, HMAC-signed) ----------

const COOKIE_NAME = 'rr_admin';
const COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function sessionSecret() {
    // Prefer a dedicated secret; fall back to ADMIN_PASSWORD so the project
    // still works with a single env var configured.
    return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

export function issueAdminCookie() {
    const secret = sessionSecret();
    if (!secret) throw new Error('Cannot issue admin cookie \u2014 no secret configured');
    const exp = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE;
    const payload = `admin.${exp}`;
    const sig = createHmac('sha256', secret).update(payload).digest('hex');
    const value = `${payload}.${sig}`;
    return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${COOKIE_MAX_AGE}`;
}

export function clearAdminCookie() {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export function isAdminRequest(req) {
    const secret = sessionSecret();
    if (!secret) return false;
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.split(';').map((s) => s.trim()).find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!match) return false;
    const value = match.slice(COOKIE_NAME.length + 1);
    const parts = value.split('.');
    if (parts.length !== 3) return false;
    const [role, expStr, sig] = parts;
    if (role !== 'admin') return false;
    const exp = parseInt(expStr, 10);
    if (!exp || exp * 1000 < Date.now()) return false;
    const expected = createHmac('sha256', secret).update(`${role}.${expStr}`).digest('hex');
    try {
        const a = Buffer.from(sig, 'hex');
        const b = Buffer.from(expected, 'hex');
        if (a.length !== b.length) return false;
        return timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

export function checkAdminPassword(submitted) {
    const expected = process.env.ADMIN_PASSWORD || '';
    if (!expected) return false;
    const a = Buffer.from(submitted || '', 'utf-8');
    const b = Buffer.from(expected, 'utf-8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
}
