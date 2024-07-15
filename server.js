require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Function to generate email addresses
function generateEmail(firstName, lastName, companyDomain) {
    const emailFormats = [
        `${firstName}.${lastName}@${companyDomain}`,
        `${firstName}@${companyDomain}`,
        `${lastName}@${companyDomain}`,
        `${firstName}${lastName}@${companyDomain}`,
        `${firstName}_${lastName}@${companyDomain}`
    ];

    return emailFormats;
}

// Function to send email
async function sendEmail(to, firstName, lastName, company) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: `Job Application: ${firstName} ${lastName}`,
        text: `Dear ${firstName} ${lastName},\n\nI am very interested in the opportunity at ${company}. Please find my resume attached.\n\nBest regards,\nYour Name`,
        attachments: [
            {
                filename: 'Resume.pdf',
                path: './path/to/your/resume.pdf'
            }
        ]
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}: ${info.response}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
}

// Route to render the form
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Route to handle form submission
app.post('/send-email', async (req, res) => {
    const { firstName, lastName, company, companyDomain } = req.body;
    const emailAddresses = generateEmail(firstName, lastName, companyDomain);

    for (let email of emailAddresses) {
        await sendEmail(email, firstName, lastName, company);
    }

    res.send('Emails sent successfully!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
