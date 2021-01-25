const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const axios = require('axios');
let name;
let act;

router.get('/github', (req, res) => {
    res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`,
    );
    // res.json({ msg: 'Works' });
});

router.get('/oauth_githcb', async (req, res) => {

    const { query: { code } } = req;
    // use axios
    const body = {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_SECRET_ID,
        code,
    };
    const opts = { headers: { accept: 'application/json' } };

    axios.post('https://github.com/login/oauth/access_token', body, opts).then((_res) => _res.data.access_token).then((ac_token) => {
        act = ac_token;
        console.log('My token:', act);
        const header = {
            headers: {
                accept: 'application/json',
                Authorization: 'token ' + act
            }
        };

        axios.get('https://api.github.com/user', header).then(result => {
            // console.log(result)

            let userName = result.data.login;


            name = userName;

            const token = jwt.sign({ act }, `${process.env.SECRET}`, {
                expiresIn: 300 // 300 -> 5 minutes
            });

            const cookieOptions = {
                expires: new Date(Date.now() + process.env.JWT_COOKIE_TIME * 24 * 60 * 60 * 1000), // expires in jwt_cookie_time day
                httpOnly: true
            };

            res.cookie('token', token, cookieOptions);
            console.log('User Authenticated!!');
            res.status(200).redirect('/home');
            // res.json({ msg: "done" })

        }).catch((err) => res.status(500).json({ err: err.message }));

    }).catch((err) => res.status(500).json({ err: err.message }));

});


module.exports = {
    router,
    name
}