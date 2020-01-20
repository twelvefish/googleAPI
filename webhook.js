const express = require("express")
const Line = require("@line/bot-sdk")
const config = require("./config")
const fs = require("fs");
const speechToText = require("./speechToText");
const lineClient = new Line.Client(config.LineConfig);
const router = express.Router();
const ffmpeg = require('fluent-ffmpeg');

router.use(function (req, res, next) {
    console.log("輸出記錄訊息至終端機", req.method, req.url);
    next();
});

router.post('/webhook', Line.middleware(config.LineConfig), (req, res) => {
    const events = req.body.events;
    let responseArray = [];

    events.forEach(event => {
        
        console.log(JSON.stringify(event, null, 4)); // 純粹印出Line給我們的JSON格式為何

        switch (event.type) {
            case 'message':
                switch (event.message.type) {
                    case 'text':    // 使用者輸入純文字訊息
                        lineClient.replyMessage(event.replyToken, {
                            "type": "text",
                            "text": event.message.text
                        });
                        break;
                    case 'audio':   // 使用者輸入語音訊息   
                        lineClient.getMessageContent(event.message.id).then(stream => { // 藉由messageID取得語音的buffer
                            let buffers = [];
                            stream.on('data', (data) => buffers.push(data));
                            stream.on('end', async () => {
                                var audioName = 'test.flac';
                                fs.writeFileSync('./test.m4a', Buffer.concat(buffers));

                                // 由於Line會將音檔壓所成m4a檔，由於音質太低，要轉換成FLAC檔，GCP辨識率才高
                                new Promise((resolve, reject) => {
                                    ffmpeg('./test.m4a')
                                        .on('error', (err) => {
                                            reject(err);
                                        })
                                        .on('end', () => {
                                            resolve();
                                        })
                                        .save('test.flac')
                                }).then(async () => {
                                    const transcription = await speechToText.convert(audioName); // 送去speech API進行STT
                                    lineClient.replyMessage(event.replyToken, { // 發送訊息給使用者
                                        "type": "text",
                                        "text": transcription
                                    });
                                })
                            });
                        });
                        break;
                }
                break;
        }

        Promise
            .all(responseArray)
            .then((result) => {
                res.json(result)
                res.status(200).end()
            })
            .catch((err) => {
                console.error("err", err)
                res.status(500).end()
            })

    });
});

module.exports = router;