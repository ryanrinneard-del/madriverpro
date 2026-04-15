// POST /api/process-profile
//
// Accepts a submitted Know Your Game profile, calls Anthropic's Claude API
// (claude-sonnet-4-20250514) with the Golfer Profile Interpreter prompt bound
// to a structured-output tool, and persists:
//   profiles/{id}/submission.json   â the raw form data
//   profiles/{id}/analysis.json     â Claude's structured payload
//   profiles/{id}/analysis.md       â markdown derived from analysis.json
// Then fires an internal call to /api/generate-pdfs.

import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';
import { GOLFER_PROFILE_SYSTEM_PROMPT } from './_lib/systemPrompt.js';
import { PDF_DATA_SCHEMA, renderMarkdown } from './_lib/schema.js';
import {
    newSubmissionId,
    appendSubmission,
    updateSubmission,
    putJson,
    putText,
    requireEnv,
} from './_lib/storage.js';

const RYAN_EMAIL = 'ryan@rrgolfperformance.com';

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 8192;

export const config = { maxDuration: 60 };

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

function formatProfileForClaude(data) {
    const lines = ['=== GOLFER PROFILE SUBMISSION ===', ''];
    for (const [key, value] of Object.entries(data)) {
        if (key === 'website') continue;
        const pretty = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const val = Array.isArray(value) ? value.join(', ') : (value || 'â');
        lines.push(`${pretty}: ${val}`);
    }
    return lines.join('\n');
}

async function notifyRyan(submissionId, studentName, studentEmail, formData, host, proto) {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
        console.warn('RESEND_API_KEY not set â skipping Ryan notification email.');
        return;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Ryan Rinneard <ryan@rrgolfperformance.com>';
    const dashboardUrl = `${proto}://${host}/admin/profile-review`;

    // Build a readable summary of the student's answers.
    const summaryLines = [];
    for (const [key, value] of Object.entries(formData)) {
        if (key === 'website') continue;
        const pretty = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        const val = Array.isArray(value) ? value.join(', ') : (value || 'â');
        summaryLines.push(`<tr><td style="padding:4px 12px 4px 0;font-weight:600;vertical-align:top;white-space:nowrap;">${pretty}</td><td style="padding:4px 0;vertical-align:top;">${val}</td></tr>`);
    }

    const html = `
<p>New Know Your Game profile submitted.</p>
<h3 style="margin:16px 0 8px;">${studentName} &lt;${studentEmail}&gt;</h3>
<table style="border-collapse:collapse;font-size:14px;">
${summaryLines.join('\n')}
</table>
<p style="margin-top:20px;">
  The AI analysis and PDFs are being generated now. Once they're ready you can
  review and approve them here:<br/>
  <a href="${dashboardUrl}" style="font-weight:600;">${dashboardUrl}</a>
</p>
<p style="color:#888;font-size:12px;">Submission ID: ${submissionId}</p>`;

    try {
        const resend = new Resend(resendKey);
        const result = await resend.emails.send({
            from: fromEmail,
            to: RYAN_EMAIL,
            subject: `[New Profile] ${studentName}`,
            html,
        });
        if (result.error) {
            console.error('Ryan notification email error:', result.error);
        }
    } catch (err) {
        console.error('Ryan notification email failed:', err);
    }
}

async function triggerPdfGeneration(submissionId, host, proto) {
    const url = `${proto}://${host}/api/generate-pdfs`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-token': process.env.INTERNAL_PIPELINE_TOKEN || '',
            },
            body: JSON.stringify({ id: submissionId }),
        });
        if (!res.ok) {
            console.error('PDF generation trigger failed:', res.status, await res.text());
        }
    } catch (err) {
        console.error('PDF generation trigger error:', err);
    }
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
    if (data.website) {
        // Honeypot â pretend success.
        return res.status(200).json({ success: true });
    }
    if (!data.full_name || !data.email) {
        return res.status(400).json({ error: 'Name and email are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) {
        return res.status(400).json({ error: 'A valid email is required.' });
    }

    let anthropicKey;
    try {
        anthropicKey = requireEnv('ANTHROPIC_API_KEY');
        requireEnv('BLOB_READ_WRITE_TOKEN');
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: 'Server not fully configured.' });
    }

    const id = newSubmissionId();
    const submittedAt = new Date().toISOString();
    const studentName = String(data.full_name).slice(0, 120);
    const studentEmail = String(data.email).slice(0, 254);

    try {
        await putJson(`profiles/${id}/submission.json`, {
            id, submittedAt,
            student: { name: studentName, email: studentEmail },
            raw: data,
        });
        await appendSubmission({
            id, submittedAt, studentName, studentEmail,
            status: 'analyzing',
        });
    } catch (err) {
        console.error('Persist submission error:', err);
        return res.status(500).json({ error: 'Failed to save submission.' });
    }

    // --- Anthropic call with forced tool use for structured output ---
    try {
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const resp = await anthropic.messages.create({
            model: MODEL,
            max_tokens: MAX_TOKENS,
            system: GOLFER_PROFILE_SYSTEM_PROMPT,
            tools: [{
                name: 'write_coaching_roadmap',
                description: 'Write the complete structured coaching roadmap. Call exactly once.',
                input_schema: PDF_DATA_SCHEMA,
            }],
            tool_choice: { type: 'tool', name: 'write_coaching_roadmap' },
            messages: [{ role: 'user', content: formatProfileForClaude(data) }],
        });

        const toolUse = resp.content.find((b) => b.type === 'tool_use' && b.name === 'write_coaching_roadmap');
        if (!toolUse || !toolUse.input) {
            throw new Error('Anthropic did not return a tool_use block.');
        }
        const roadmap = toolUse.input;

        // Persist structured JSON + markdown derived from it.
        await putJson(`profiles/${id}/analysis.json`, roadmap);
        const md = renderMarkdown(roadmap);
        await putText(`profiles/${id}/analysis.md`, md, 'text/markdown; charset=utf-8');

        await updateSubmission(id, { status: 'pdf-pending' });
    } catch (err) {
        console.error('Anthropic error:', err);
        await updateSubmission(id, { status: 'error', error: String(err.message || err) });
        return res.status(502).json({ error: 'Analysis failed. Ryan has been notified.' });
    }

    // Notify Ryan via email and kick off PDF generation.
    // Neither blocks the student's response.
    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0];
    notifyRyan(id, studentName, studentEmail, data, host, proto).catch(() => {});
    triggerPdfGeneration(id, host, proto).catch(() => {});

    return res.status(200).json({ success: true, id });
}
