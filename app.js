const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
    host: `${process.env.HOST}`,
    user: `${process.env.USER_DB}`,
    password: `${process.env.PASSWORD}`,
    database: `${process.env.DB_NAME}`
});

connection.connect(err => {
    if (err) {
        console.log('Error in connecting...');
        return;
    } else
        console.log('connected as id ' + connection.threadId);
});

app.use(bodyParser.urlencoded({ extended: false }));

// Values from 1000 to 9999
let OTP = 0000;

function generateOTP() {
    OTP = Math.floor(Math.random() * 9000) + 1000;
    console.log(OTP);
}

let authenticated = false;

app.use(express.static(path.join(__dirname, 'Public')));

// For sending mail
async function sendMail(email) {
    // Generate test SMTP service account from ethereal.email    

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: `${process.env.MAIL_USER}`,
            pass: `${process.env.MAIL_PASS}`
        }, // For accessing in localhost
        tls: {
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    return await transporter.sendMail({
        from: `${process.env.USR}`, // sender address
        to: `${email}`, // list of receivers
        subject: "Node OTP", // Subject line
        text: `Your OTP is ${OTP}`, // plain text body
        html: `<b>Your OTP is ${OTP}</b>`, // html body 
    });
    /* Nodemailer docs:
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    */
}

app.get('/otp', (req, res) => {
    generateOTP();
    res.send('done');
});

app.get('/home', (req, res) => {
    //res.sendFile('./Public/login.html', { root: __dirname });
    if (authenticated) {
        res.send('<h1>This is the Home page</h1>');
    } else {
        res.redirect('/');
    }
});

app.post('/', (req, res) => {
    let email = req.body.email;
    connection.query(`SELECT * from Users where email = '${email}'`, async function (error, results, fields) {
        if (error) throw error;
        // no error
        if (results.length == 0) {
            // Send the OTP
            try {
                await sendMail(email);
                return res.send('done')
            } catch (err) {
                return res.send('invalid_email')
            }
            //res.send('invalid_email');
        }
        else {
            console.log('User already Present!!');
            res.send('email_present');
        }
    });

});

app.post('/otp', (req, res) => {
    let userotp = req.body.otp;
    if (userotp == OTP) {
        res.send('done');
    } else {
        res.send('wrong');
    }
});

app.post('/login', (req, res) => {

    connection.query(`SELECT * from Users where email = '${req.body.loginusr}' and password = '${req.body.loginp}' `, function (error, results, fields) {
        if (error) throw error;
        // no error
        if (results.length == 0) {
            // Send the OTP
            return res.status(200).send('nope');
        }
        else
            console.log('Logging in!!');
        authenticated = true;
        res.send('done');
        //res.redirect('/home');
    });
});

app.post('/check', (req, res) => {
    // do here insertion in Database
    connection.query(`INSERT INTO Users(Username,password,email) values('${req.body.user}','${req.body.pass}','${req.body.email}')`, function (error, results, fields) {
        if (error) throw error;
        // no error
        res.send('added');
    });
});


const port = process.env.PORT || 5000;

app.listen(port, () => { console.log(`Listening at port ${port} 🚀`) });