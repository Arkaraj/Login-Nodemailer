const path = require('path');
const express = require('express');
const app = express();

// Values from 1000 to 9999
let OTP = Math.floor(Math.random() * 9000) + 1000;
//console.log(OTP);

app.use(express.static(path.join(__dirname, 'Public')));

/*app.post('/', (req,res)=>{

});*/

app.get('/home', (req, res) => {
    //res.sendFile('./Public/login.html', { root: __dirname });
    res.send('<h1>This is the Home page</h1>');
});


const port = process.env.PORT || 5000;

app.listen(port, () => { console.log(`Listening at port ${port} 🚀`) });