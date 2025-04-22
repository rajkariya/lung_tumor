// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const sgMail = require('@sendgrid/mail');

// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// app.use(bodyParser.json());
// app.use(cors());

// let otpStore = {};

// function generateOTP() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

// app.post('/send-otp', (req, res) => {
//     const { email, name, password } = req.body;
//     const otp = generateOTP();
//     otpStore[email] = otp; 

//     const msg = {
//         to: email,
//         from: 'cyatharva@gmail.com', 
//         subject: 'Your OTP for Login',
//         text: `Hi user,\n\nHere's your Security Code for access to the Tumor Detection System: ${otp}\n\nPlease do not share this OTP.`,
//     };

//     sgMail.send(msg)
//         .then(() => {
//             res.json({ success: true, otp });
//         })
//         .catch(error => {
//             console.error('Error sending OTP:', error);
//             if (error.response) {
//                 console.error('Response details:', error.response.body);
//             }
//             res.status(500).json({ success: false, error: 'Failed to send OTP' });
//         });
// });

// app.post('/send-signup-otp', (req,res)=>{
//     const { email} = req.body;
//     const otp = generateOTP();
//     otpStore[email] = otp; 
//     const msg = {
//         to: email,
//         from: 'cyatharva@gmail.com', 
//         subject: 'Your OTP for Signup',
//         text: `Hi user,\n\nHere's your Security Code for access to the Tumor Detection System: ${otp}\n\nPlease do not share this OTP.`,
//     };

//     sgMail.send(msg)
//         .then(() => {
//             res.json({ success: true, otp });
//         })
//         .catch(error => {
//             console.error('Error sending OTP:', error);
//             if (error.response) {
//                 console.error('Response details:', error.response.body);
//             }
//             res.status(500).json({ success: false, error: 'Failed to send OTP' });
//         });
// })
// app.post('/verify-otp', (req, res) => {
//     const { email, otp } = req.body;

//     if (otpStore[email] && otpStore[email] === otp) {
//         console.log(otpStore[email]);
//         console.log(otp);
//         delete otpStore[email]; 
//         res.json({ success: true, message: 'OTP verified' });
//     } else {
//         res.status(400).json({ success: false, error: 'Invalid OTP' });
//     }
// });
// app.post('/send-report', async (req, res) => {
//     console.log("Received body:", req.body);
  
//     const {
//       doctorEmail,
//       patientEmail,
//       patientName,
//       phone,
//       hasTumor,
//       confidence,
//       message,
//       imageUrl
//     } = req.body;
  
//     if (!doctorEmail || !patientEmail) {
//       return res.status(400).json({ success: false, error: 'Doctor and patient emails are required' });
//     }
  
//     // Constructing email to send to the doctor
//     const msg = {
//       to: doctorEmail,
//       from: 'cyatharva@gmail.com',  // Must be verified with SendGrid
//       subject: `Tumor Detection Report for ${patientName}`,
//       text: message,
//       html: `
//         <h2>Tumor Detection Report</h2>
//         <p><strong>Patient Name:</strong> ${patientName}</p>
//         <p><strong>Email:</strong> ${patientEmail}</p>
//         <p><strong>Phone:</strong> ${phone}</p>
//         <p><strong>Result:</strong> ${hasTumor ? "Tumor detected" : "No tumor detected"}</p>
//         <p><strong>Confidence:</strong> ${(confidence * 100).toFixed(2)}%</p>
//         <p><strong>Message:</strong> ${message}</p>
//         <p><strong>Image:</strong><br><img src="${imageUrl}" alt="CT Scan" width="300"/></p>
//       `
//     };
  
//     try {
//       await sgMail.send(msg);
//       res.json({ success: true, message: 'Report sent to doctor' });
//     } catch (error) {
//       console.error('Error sending reports:', error);
//       if (error.response) {
//         console.error('Response details:', error.response.body);
//       }
//       res.status(500).json({ success: false, error: 'Failed to send report' });
//     }
//   });
  
  
  
  

// app.listen(port, () => {
//     console.log(`Server is running on http://localhost:${port}`);
// });



const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const winston = require('winston');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = [process.env.REACT_APP_URL || 'http://localhost:3000'];

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Rate limiting for OTP endpoints
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many OTP requests, please try again later.'
});
app.use('/send-otp', otpLimiter);
app.use('/send-signup-otp', otpLimiter);

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// OTP Storage with Expiry
const otpStore = new Map(); // { email: { otp, expires } }

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Middleware to validate email
const validateEmail = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address')
];

// Send OTP for Login
app.post('/send-otp', validateEmail, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email } = req.body;
  const otp = generateOTP();
  const expires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
  otpStore.set(email, { otp, expires });

  const msg = {
    to: email,
    from: process.env.SENDGRID_VERIFIED_EMAIL || 'cyatharva@gmail.com',
    subject: 'Your OTP for Login',
    text: `Hi user,\n\nYour Security Code for the Tumor Detection System: ${otp}\n\nThis OTP expires in 10 minutes. Please do not share it.`,
    html: `<p>Hi user,</p><p>Your Security Code for the Tumor Detection System: <strong>${otp}</strong></p><p>This OTP expires in 10 minutes. Please do not share it.</p>`
  };

  try {
    await sgMail.send(msg);
    logger.info(`OTP sent to ${email}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    logger.error('Error sending OTP:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

// Send OTP for Signup
app.post('/send-signup-otp', validateEmail, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email } = req.body;
  const otp = generateOTP();
  const expires = Date.now() + 10 * 60 * 1000;
  otpStore.set(email, { otp, expires });

  const msg = {
    to: email,
    from: process.env.SENDGRID_VERIFIED_EMAIL || 'cyatharva@gmail.com',
    subject: 'Your OTP for Signup',
    text: `Hi user,\n\nYour Security Code for the Tumor Detection System: ${otp}\n\nThis OTP expires in 10 minutes. Please do not share it.`,
    html: `<p>Hi user,</p><p>Your Security Code for the Tumor Detection System: <strong>${otp}</strong></p><p>This OTP expires in 10 minutes. Please do not share it.</p>`
  };

  try {
    await sgMail.send(msg);
    logger.info(`Signup OTP sent to ${email}`);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    logger.error('Error sending signup OTP:', error);
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

// Verify OTP
app.post('/verify-otp', validateEmail, [
  body('otp').isString().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { email, otp } = req.body;
  const stored = otpStore.get(email);

  if (!stored) {
    return res.status(400).json({ success: false, error: 'OTP not found or expired' });
  }

  if (stored.expires < Date.now()) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, error: 'OTP expired' });
  }

  if (stored.otp === otp) {
    otpStore.delete(email);
    logger.info(`OTP verified for ${email}`);
    res.json({ success: true, message: 'OTP verified' });
  } else {
    res.status(400).json({ success: false, error: 'Invalid OTP' });
  }
});

// Send Report (Retained with Minor Improvements)
app.post('/send-report', [
  body('doctorEmail').isEmail().normalizeEmail().withMessage('Invalid doctor email'),
  body('patientEmail').isEmail().normalizeEmail().withMessage('Invalid patient email'),
  body('patientName').trim().escape().notEmpty().withMessage('Patient name is required'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('hasTumor').isBoolean().withMessage('hasTumor must be a boolean'),
  body('confidence').isFloat({ min: 0, max: 1 }).withMessage('Confidence must be between 0 and 1'),
  body('message').trim().escape().notEmpty().withMessage('Message is required'),
  body('imageUrl').isURL().withMessage('Invalid image URL')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { doctorEmail, patientEmail, patientName, phone, hasTumor, confidence, message, imageUrl } = req.body;

  const msg = {
    to: doctorEmail,
    from: process.env.SENDGRID_VERIFIED_EMAIL || 'cyatharva@gmail.com',
    subject: `Tumor Detection Report for ${patientName}`,
    text: message,
    // Note krle kya changes krne hai woh type krke rakh fir mein html change kr dunga.
    html: `
      <h2>Tumor Detection Report</h2>
      <p><strong>Patient Name:</strong> ${patientName}</p>
      <p><strong>Result:</strong> ${hasTumor ? 'Tumor detected' : 'No tumor detected'}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Image:</strong><br><img src="${imageUrl}" alt="CT Scan" width="300"/></p>
    `
  };

  try {
    await sgMail.send(msg);
    logger.info(`Report sent to ${doctorEmail} for patient ${patientName}`);
    res.json({ success: true, message: 'Report sent to doctor' });
  } catch (error) {
    logger.error('Error sending report:', error);
    res.status(500).json({ success: false, error: 'Failed to send report' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => {
  logger.info(`Server is running on http://localhost:${port}`);
});