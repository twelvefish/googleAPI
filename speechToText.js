const speech = require('@google-cloud/speech');
const fs = require("fs");
const sox = require('sox-stream')

// const fileName = './AAA.flac';
const fileName = './multi.wav';

const client = new speech.SpeechClient();



const file = fs.readFileSync(fileName);
const audioBytes = file.toString('base64');
console.log("===file===",file.sampleRateHertz)

exports.convert = async function convert(dataBytes) {
    
    // console.log("===========", dataBytes.toString())
    const audio = {
        content: audioBytes
        // content: dataBytes.toString('base64'),
    };
    const config = {
        encoding: 'LINEAR16',
        
        sampleRateHertz: 44100,
        languageCode: 'en-US',
    };

    // const config = {
    //     encoding: 'FLAC',
    //     sampleRateHertz: 48000,
    //     languageCode: 'en-US',
    // };
    const request = {
        audio: audio,
        config: config,
    };
    
    const [response] = await client.recognize(request);
    const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
    console.log("response", response);
    console.log(`Transcription: ${transcription}`);
}
