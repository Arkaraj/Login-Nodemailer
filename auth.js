const express = require('express');
const router = express.Router();
require('dotenv').config();

router.get('/github', (req, res) => {
    res.redirect(
        `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`,
    );
    // res.json({ msg: 'Works' });
});

router.get('/oauth_githcb', ({ query: { code } }, res) => {
    console.log(code)
    res.json({ msg: 'Works' });
});



module.exports = router;