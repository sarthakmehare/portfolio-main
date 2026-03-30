require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Resend API key loaded from .env ───
const resend = new Resend(process.env.RESEND_API_KEY);

// Log whether the key was loaded (without revealing it)
if (!process.env.RESEND_API_KEY) {
    console.error('⚠️  WARNING: RESEND_API_KEY is not set in .env file!');
} else {
    console.log('✅ Resend API key loaded successfully.');
}

app.use(cors());
app.use(express.json());

// Serve static files (index.html, src/, etc.)
app.use(express.static(path.join(__dirname)));

// ─── Contact form endpoint ───
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: ['sarthakmehare1111@gmail.com'],
            replyTo: email,
            subject: `[Portfolio] ${subject}`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #f5f5f5; border-radius: 12px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #c8b8ff, #7c6bbf); padding: 24px 32px;">
                        <h2 style="margin: 0; color: #000; font-size: 20px;">New Contact Form Message</h2>
                    </div>
                    <div style="padding: 32px;">
                        <p style="margin: 0 0 8px; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Name</p>
                        <p style="margin: 0 0 24px; font-size: 16px;">${name}</p>
                        
                        <p style="margin: 0 0 8px; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Email</p>
                        <p style="margin: 0 0 24px; font-size: 16px;"><a href="mailto:${email}" style="color: #c8b8ff;">${email}</a></p>
                        
                        <p style="margin: 0 0 8px; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Subject</p>
                        <p style="margin: 0 0 24px; font-size: 16px;">${subject}</p>
                        
                        <p style="margin: 0 0 8px; color: #a3a3a3; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em;">Message</p>
                        <div style="background: #111; padding: 16px; border-radius: 8px; border-left: 3px solid #c8b8ff;">
                            <p style="margin: 0; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
                        </div>
                    </div>
                    <div style="padding: 16px 32px; border-top: 1px solid #262626; text-align: center;">
                        <p style="margin: 0; color: #525252; font-size: 12px;">Sent from your portfolio contact form</p>
                    </div>
                </div>
            `,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(500).json({ error: 'Failed to send email. Please try again.' });
        }

        console.log('Email sent successfully:', data);
        return res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
