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
let OTP = Math.floor(Math.random() * 9000) + 1000;
//console.log(OTP);

app.use(express.static(path.join(__dirname, 'Public')));

let testAccount = await nodemailer.createTestAccount();

// create reusable transporter object using the default SMTP transport
let transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: `${proces.env.MAIL_USER}`,
        pass: `${proces.env.MAIL_PASS}`
    }
});

// send mail with defined transport object
let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
});

console.log("Message sent: %s", info.messageId);
// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

// Preview only available when sending through an Ethereal account
console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

app.get('/home', (req, res) => {
    //res.sendFile('./Public/login.html', { root: __dirname });
    res.send('<h1>This is the Home page</h1>');
});

/*app.post('/', (req,res)=>{

});*/


const port = process.env.PORT || 5000;

app.listen(port, () => { console.log(`Listening at port ${port} 🚀`) });