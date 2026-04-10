import { createHash } from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, first_name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

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
                        FNAME: first_name || '',
                    },
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Mailchimp API error:', error);
            return res.status(502).json({ error: 'Failed to subscribe' });
        }

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