// POST /api/approve-profile  { id }
//
// Admin-only. Emails the three generated PDFs to the student and Ryan via
// Resend, then marks the submission as "approved".

import { Resend } from 'resend';
import { isAdminRequest, readIndex, updateSubmission, requireEnv, fetchBlob } from './_lib/storage.js';
import { list } from '@vercel/blob';

const RYAN_EMAIL = 'ryan@madriverpro.com';

async function fetchPdfAsAttachment(pathname, filename) {
    // Private store — fetchBlob handles head() + authenticated fetch.
    const r = await fetchBlob(pathname);
    if (!r.ok) throw new Error(`Failed to fetch ${filename}: ${r.status}`);
    const ab = await r.arrayBuffer();
    return {
        filename,
        content: Buffer.from(ab), // Resend supports Buffer content for attachments
    };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!isAdminRequest(req)) {
        return res.status(401).json({ error: 'Not authenticated.' });
    }

    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id is required' });

    let resendKey, fromEmail;
    try {
        resendKey = requireEnv('RESEND_API_KEY');
        fromEmail = process.env.RESEND_FROM_EMAIL || 'Ryan Rinneard <ryan@madriverpro.com>';
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

    // Look up the submission
    const index = await readIndex();
    const submission = (index.submissions || []).find((s) => s.id === id);
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });
    if (!submission.studentEmail) return res.status(400).json({ error: 'Submission has no student email.' });

    // Confirm the three PDFs exist under profiles/{id}/ before emailing.
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const blobs = await list({ prefix: `profiles/${id}/`, token });
    const present = new Set(
        blobs.blobs.map((b) => b.pathname.split('/').pop())
    );
    const required = ['session1_plan.pdf', 'arc.pdf', 'dossier.pdf'];
    const missing = required.filter((n) => !present.has(n));
    if (missing.length) {
        return res.status(409).json({
            error: `PDFs not ready: missing ${missing.join(', ')}`,
        });
    }

    let attachments;
    try {
        attachments = await Promise.all(
            required.map((n) => fetchPdfAsAttachment(`profiles/${id}/${n}`, n))
        );
    } catch (err) {
        console.error('Attachment fetch error:', err);
        return res.status(500).json({ error: 'Failed to load PDFs for email.' });
    }

    const resend = new Resend(resendKey);

    const studentSubject = 'Your Coaching Roadmap — Ryan Rinneard Golf Academy';
    const studentHtml = `
<p>Hi ${submission.studentName.split(' ')[0] || 'there'},</p>
<p>Thanks for taking the time to fill out the Know Your Game profile. Three documents are attached:</p>
<ul>
  <li><strong>Session 1 Plan</strong> — what we'll work on the first time we meet</li>
  <li><strong>6-Week Arc</strong> — how the first six sessions build on each other</li>
  <li><strong>Player Dossier</strong> — the full diagnostic and plan for your records</li>
</ul>
<p>Have a read through before our first session. Any questions, just reply to this email.</p>
<p>— Ryan<br/>Mad River Golf Club</p>`;

    const coachSubject = `[Profile Approved] ${submission.studentName}`;
    const coachHtml = `
<p>Approved profile packet sent to <strong>${submission.studentEmail}</strong>.</p>
<p><strong>Student:</strong> ${submission.studentName}<br/>
<strong>Submitted:</strong> ${submission.submittedAt}<br/>
<strong>ID:</strong> ${id}</p>
<p>All three PDFs attached for your records.</p>`;

    try {
        const [studentRes, coachRes] = await Promise.all([
            resend.emails.send({
                from: fromEmail,
                to: submission.studentEmail,
                subject: studentSubject,
                html: studentHtml,
                attachments,
                replyTo: RYAN_EMAIL,
            }),
            resend.emails.send({
                from: fromEmail,
                to: RYAN_EMAIL,
                subject: coachSubject,
                html: coachHtml,
                attachments,
            }),
        ]);

        if (studentRes.error || coachRes.error) {
            console.error('Resend errors:', studentRes.error, coachRes.error);
            return res.status(502).json({
                error: 'Resend delivery failed.',
                debug: { student: studentRes.error, coach: coachRes.error },
            });
        }

        await updateSubmission(id, {
            status: 'approved',
            approvedAt: new Date().toISOString(),
            studentEmailId: studentRes.data?.id || null,
            coachEmailId: coachRes.data?.id || null,
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Resend error:', err);
        return res.status(500).json({ error: 'Failed to send emails.' });
    }
}
