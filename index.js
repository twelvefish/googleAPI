const express = require("express");
const cors = require('cors');
const app = express(); //建立一個Express伺服器
const webhook = require('./webhook');

app.use(cors());
app.use('/', webhook);
app.listen(process.env.PORT || 3000, () => {
    console.log('Express server listening on port 3000');
});