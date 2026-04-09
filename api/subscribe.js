export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, first_name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const API_KEY = process.env.KIT_API_KEY;
    const FORM_ID = process.env.KIT_FORM_ID;

    if (!API_KEY || !FORM_ID) {
        console.error('Missing KIT_API_KEY or KIT_FORM_ID environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        const response = await fetch(
            `https://api.convertkit.com/v3/forms/${FORM_ID}/subscribe`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    api_key: API_KEY,
                    email,
                    first_name: first_name || '',
                }),
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Kit API error:', error);
            return res.status(502).json({ error: 'Failed to subscribe' });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Subscribe error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
