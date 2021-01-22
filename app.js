const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
require('dotenv').config();

//secret_token: require('crypto').randomBytes(64).toString('hex')

const jwt = require('jsonwebtoken');

// Authentication required!!!

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
app.use(express.json());

// Values from 1000 to 9999
let OTP = 0000;

function generateOTP() {
    OTP = Math.floor(Math.random() * 9000) + 1000;
    console.log(OTP);
}

app.use(express.static(path.join(__dirname, 'Public')));

// For sending mail
async function sendMail(email, subjectLine, plainTextLine, htmlBody) {
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
        subject: `${subjectLine}`, // Subject line 
        text: `${plainTextLine}`, // plain text body 
        html: `${htmlBody}`, // html body 
    });
    /* 
    Nodemailer docs:
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

app.post('/', (req, res) => {
    let email = req.body.email;
    connection.query(`SELECT * from Users where email = '${email}'`, async function (error, results, fields) {
        if (error) throw error;
        // no error
        if (results.length == 0) {
            // Send the OTP
            try {
                await sendMail(email, 'Node OTP', `Your OTP is ${OTP}`, `<b>Your OTP is ${OTP}</b>`);
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

app.post('/login', async (req, res) => {

    const { loginusr, loginp } = req.body;

    try {
        connection.query(`SELECT * from Users where email = '${loginusr}' `, async function (error, results, fields) {
            if (error) throw error;
            // no error
            if (results.length == 0) {
                return res.status(200).send('nope');
            }
            else {
                let encrypt = results[0].password;
                const validate = await bcrypt.compare(loginp, encrypt);
                if (validate) {

                    const id = results[0].id;
                    const token = jwt.sign({ id }, `${process.env.SECRET}`, {
                        expiresIn: 300, // 5 minutes
                    });

                    console.log('User Authenticated!!');
                    // Pass to the frontend
                    res.json({ auth: true, token: token, result: results });
                } else {
                    res.json({ auth: false });
                }
            }


            //res.redirect('/home');
        });
    } catch (err) {

    }
});

// Middleware
const verifyJWT = (req, res, next) => {
    const token = req.headers["x-access-token"];

    if (!token) {
        //res.send('Requires a token');
        return res.sendStatus(401); // Unauthorized
    } else {
        jwt.verify(token, `${process.env.SECRET}`, (err, decoded) => {
            if (err) res.json({ auth: false });
            else {
                // console.log(decoded);
                req.userId = decoded.id;
                next();
            }
        })
    }
}

app.get('/home', verifyJWT, (req, res) => {
    // res.send("<h1>You are Autenticated!</h1>")

    // Authorized!!

    res.sendFile('./Public/home.html', { root: __dirname });
});

app.post('/forgot', (req, res) => {
    const { email } = req.body;

    connection.query(`SELECT email,password from Users where email='${email}'`, async (err, results, fields) => {
        if (err) throw err;

        if (results.length == 0) {
            return res.send('invalid');
        }

        // Sends the Encrypted passwords
        let pass = results[0].password;
        try {
            await sendMail(email, 'Your Password', `Your old Encrypted password is ${pass}`, `<b>Your old Encrypted password is ${pass}</b>`);
            return res.send('done');
        } catch (err) {
            return res.send('invalid');
        }

    });
});

app.post('/check', async (req, res) => {

    const { user, password, email } = req.body;

    try {
        let hash = await bcrypt.hash(password, 10);

        // do here insertion in Database
        connection.query(`INSERT INTO Users(Username,password,email) values('${user}','${hash}','${email}')`, function (error, results, fields) {
            if (error) throw error;
            // no error
            res.send('added');
        });
    } catch (err) {
        console.log('Error: ' + err);
        res.send('nope');
    }

});

app.patch('/update', async (req, res) => {
    const { email, password } = req.body;

    if (password.length < 3) {
        return res.send('nope');
    }

    try {
        let hash = await bcrypt.hash(password, 10);

        // do here insertion in Database
        connection.query(`UPDATE Users SET password='${hash}' where email = '${email}'`, function (error, results, fields) {
            if (error) throw error;
            // no error
            res.send('done');
        });
    } catch (err) {
        console.log('Error: ' + err);
        res.send('nope');
    }


});


const port = process.env.PORT || 8000;

app.listen(port, () => { console.log(`Listening at port ${port} 🚀`) });