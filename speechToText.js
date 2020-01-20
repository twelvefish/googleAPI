const speech = require('@google-cloud/speech');
const fs = require("fs");
const client = new speech.SpeechClient();

exports.convert = async function convert(audioName) {

    const fileName = './' + audioName;
    const file = fs.readFileSync(fileName);
    const audioBytes = file.toString('base64');

    const audio = {
        content: audioBytes
    };

    const config = {
        enableAutomaticPunctuation: true,
        encoding: 'FLAC',
        languageCode: 'zh',
        // audioChannelCount: 2,
        sampleRateHertz: 16000,
        alternativeLanguageCodes: [`es-ES`, `zh-TW`, `zh`], // 可混語言
        model: "default"
    };

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
    return transcription;
}