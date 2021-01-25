const path = require('path');
const express = require('express');
const app = express();
const nodemailer = require("nodemailer");
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const auth = require('./auth');

//secret_token: require('crypto').randomBytes(64).toString('hex')

const jwt = require('jsonwebtoken');
let authUser = {};
let warning = "";
let disp = "none";

// Authentication required!!!

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER_DB,
    password: process.env.PASSWORD,
    database: process.env.DB_NAME
});

connection.connect(err => {
    if (err) {
        console.log('Error in connecting...');
        return;
    } else
        console.log('connected as id ' + connection.threadId);
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use('/auth', auth);

// Values from 1000 to 9999
let OTP = 0000;

function generateOTP() {
    OTP = Math.floor(Math.random() * 9000) + 1000;
    console.log(OTP);
}

app.use(express.static(path.join(__dirname, 'views')));
app.set('view engine', 'ejs');

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

const checkAuth = (req, res, next) => {
    // if ((Object.keys(authUser).length) / 3 >= 1) {
    //     // console.log(authUser)
    //     return res.status(200).redirect('/home');
    // } else {
    //     next();
    // }

    const token = req.cookies.token;
    try {
        // const token = ftoken.substring(6, ftoken.length)
        if (!token) {
            //res.send('Requires a token');
            next();
        } else {
            return res.status(200).redirect('/home');
        }
    } catch (err) {
        next();
    }

}

app.get('/', checkAuth, (req, res) => {
    const status = {
        msg: warning,
        display: disp
    }
    res.render('index', { status: status });
})

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
                warning = "Incorrect Email or Password";
                disp = "flex";
                return res.status(200).redirect('/');
            }
            else {
                let encrypt = results[0].password;
                const validate = await bcrypt.compare(loginp, encrypt);
                if (validate) {

                    const id = results[0].id;
                    const token = jwt.sign({ id }, `${process.env.SECRET}`, {
                        expiresIn: 300 // 300 -> 5 minutes
                    });

                    const cookieOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_TIME * 24 * 60 * 60 * 1000), // expires in jwt_cookie_time day
                        httpOnly: true
                    };

                    res.cookie('token', token, cookieOptions);

                    console.log('User Authenticated!!');
                    // Pass to the frontend
                    authUser = { auth: true, token: token, result: results };
                    res.status(200).redirect('/home');
                    //res.json({ auth: true, token: token, result: results });
                } else {
                    warning = "Incorrect Email or Password";
                    disp = "flex";
                    return res.status(200).redirect('/');
                }
            }


            //res.redirect('/home');
        });
    } catch (err) {

    }
});

// Authorization
// Bearer <access_token>

// Middleware
const verifyJWT = (req, res, next) => {
    // Using cookie
    // const ftoken = req.headers["cookie"];
    const token = req.cookies.token;
    // Using JWT
    /* 
    const fullToken = req.headers['x-access-token'];
    const token = fullToken.spilt(' ')[1]; // Removes the bearer
    */
    try {
        // const token = ftoken.substring(6, ftoken.length)
        if (!token) {
            //res.send('Requires a token');
            authUser = {};
            // console.log(authUser);
            return res.sendStatus(401) // Unauthorized
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
    } catch (err) {
        // console.log(authUser);
        return res.sendStatus(401)
    }
}

// app.use('/home', verifyJWT, express.static(path.join(__dirname, 'Public/home.html'))); //auth route

app.get('/home', verifyJWT, (req, res) => {
    // Authorized!!
    const user = {
        id: req.userId,
        name: authUser.result[0].Username
    }
    res.render('home', { User: user });
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

app.post('/logout', (req, res) => {
    res.clearCookie('token');
    return res.status(200).redirect('/');
});


const port = process.env.PORT || 4000;

app.listen(port, () => { console.log(`Listening at port ${port} 🚀`) });