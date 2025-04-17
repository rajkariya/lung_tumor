const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const sgMail = require('@sendgrid/mail');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

app.use(bodyParser.json());
app.use(cors());

let otpStore = {};

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-otp', (req, res) => {
    const { email, name, password } = req.body;
    const otp = generateOTP();
    otpStore[email] = otp; 

    const msg = {
        to: email,
        from: 'cyatharva@gmail.com', 
        subject: 'Your OTP for Login',
        text: `Hi user,\n\nHere's your Security Code for access to the Tumor Detection System: ${otp}\n\nPlease do not share this OTP.`,
    };

    sgMail.send(msg)
        .then(() => {
            res.json({ success: true, otp });
        })
        .catch(error => {
            console.error('Error sending OTP:', error);
            if (error.response) {
                console.error('Response details:', error.response.body);
            }
            res.status(500).json({ success: false, error: 'Failed to send OTP' });
        });
});

app.post('/send-signup-otp', (req,res)=>{
    const { email} = req.body;
    const otp = generateOTP();
    otpStore[email] = otp; 
    const msg = {
        to: email,
        from: 'cyatharva@gmail.com', 
        subject: 'Your OTP for Signup',
        text: `Hi user,\n\nHere's your Security Code for access to the Tumor Detection System: ${otp}\n\nPlease do not share this OTP.`,
    };

    sgMail.send(msg)
        .then(() => {
            res.json({ success: true, otp });
        })
        .catch(error => {
            console.error('Error sending OTP:', error);
            if (error.response) {
                console.error('Response details:', error.response.body);
            }
            res.status(500).json({ success: false, error: 'Failed to send OTP' });
        });
})
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] && otpStore[email] === otp) {
        console.log(otpStore[email]);
        console.log(otp);
        delete otpStore[email]; 
        res.json({ success: true, message: 'OTP verified' });
    } else {
        res.status(400).json({ success: false, error: 'Invalid OTP' });
    }
});
app.post('/send-report', async (req, res) => {
    console.log("Received body:", req.body);
  
    const {
      doctorEmail,
      patientEmail,
      patientName,
      phone,
      hasTumor,
      confidence,
      message,
      imageUrl
    } = req.body;
  
    if (!doctorEmail || !patientEmail) {
      return res.status(400).json({ success: false, error: 'Doctor and patient emails are required' });
    }
  
    // Constructing email to send to the doctor
    const msg = {
      to: doctorEmail,
      from: 'cyatharva@gmail.com',  // Must be verified with SendGrid
      subject: `Tumor Detection Report for ${patientName}`,
      text: message,
      html: `
        <h2>Tumor Detection Report</h2>
        <p><strong>Patient Name:</strong> ${patientName}</p>
        <p><strong>Email:</strong> ${patientEmail}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Result:</strong> ${hasTumor ? "Tumor detected" : "No tumor detected"}</p>
        <p><strong>Confidence:</strong> ${(confidence * 100).toFixed(2)}%</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Image:</strong><br><img src="${imageUrl}" alt="CT Scan" width="300"/></p>
      `
    };
  
    try {
      await sgMail.send(msg);
      res.json({ success: true, message: 'Report sent to doctor' });
    } catch (error) {
      console.error('Error sending reports:', error);
      if (error.response) {
        console.error('Response details:', error.response.body);
      }
      res.status(500).json({ success: false, error: 'Failed to send report' });
    }
  });
  
  
  
  

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

