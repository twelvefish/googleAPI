const express = require("express")
const Line = require("@line/bot-sdk")
const config = require("./config");
const fs = require("fs");
const speechToText= require("./speechToText");
const lineClient = new Line.Client(config.LineConfig);
const router = express.Router();


router.use(function (req, res, next) {
    console.log("輸出記錄訊息至終端機", req.method, req.url);
    next();
});

router.post('/webhook', Line.middleware(config.LineConfig), (req, res) => {
    const events = req.body.events;
    events.forEach(event => {
        console.log(JSON.stringify(event, null, 4));
        switch (event.type) {
            case 'message':
                switch (event.message.type) {
                    case 'text':
                        console.log("text", event.message.text);
                        break;
                    case 'audio':
                        console.log("audio", event.message.id);
                        lineClient.getMessageContent(event.message.id).then(stream => {
                            let buffers = [];
                            stream.on('data', (data) => buffers.push(data));
                            stream.on('end', () => {
                                fs.writeFileSync('./audiosas123.flac', Buffer.concat(buffers));
                                speechToText.convert(Buffer.concat(buffers));
                            });
                        });
                        break;
                }
                break;
        }
    });
});
module.exports = router;