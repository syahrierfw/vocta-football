// realtime-server.js
const express = require('express');
const { WebSocketServer } = require('ws');
const { SpeechClient } = require('@google-cloud/speech');
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- CONFIGURATION ---
const PORT = 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const SYSTEM_PROMPT = `You are "Paolo", a friendly and expert AC Milan jersey specialist. Keep your responses very brief and conversational for voice.`;

// --- INITIALIZE CLIENTS ---
const speechClient = new SpeechClient();
const ttsClient = new TextToSpeechClient();
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction: SYSTEM_PROMPT });

const app = express();
app.use(express.json()); 

const server = app.listen(PORT, () => console.log(`✅ Real-time server listening on port ${PORT}`));
const wss = new WebSocketServer({ server });

let dashboardSockets = new Set();

app.post('/broadcast', (req, res) => {
    const { message } = req.body;
    for (const socket of dashboardSockets) {
        socket.send(JSON.stringify({ type: 'transcript_message', message }));
    }
    res.status(200).send('Message broadcasted');
});

wss.on('connection', (ws) => {
    console.log('Client connected');
    let recognizeStream = null;

    const broadcastToDashboards = (message) => {
        for (const socket of dashboardSockets) {
            socket.send(JSON.stringify({ type: 'transcript_message', message }));
        }
    };

    const startStream = () => {
        recognizeStream = speechClient
            .streamingRecognize({
                config: {
                    encoding: 'LINEAR16',
                    sampleRateHertz: 16000,
                    languageCode: 'en-US',
                    model: 'chirp',
                    enableAutomaticPunctuation: true,
                },
                interimResults: false,
            })
            .on('error', (err) => console.error('Speech API Error:', err))
            .on('data', async (data) => {
                const transcript = data.results[0]?.alternatives[0]?.transcript.trim();
                if (transcript) {
                    console.log(`Transcript: ${transcript}`);
                    broadcastToDashboards({ from: 'user', text: transcript });
                    ws.send(JSON.stringify({ type: 'user_transcript', text: transcript }));

                    try {
                        const result = await geminiModel.generateContent(transcript);
                        const geminiResponse = await result.response;
                        const geminiText = geminiResponse.text();
                        console.log(`Gemini: ${geminiText}`);
                        
                        broadcastToDashboards({ from: 'agent', text: geminiText });
                        ws.send(JSON.stringify({ type: 'agent_transcript', text: geminiText }));

                        const [ttsResponse] = await ttsClient.synthesizeSpeech({
                            input: { ssml: `<speak>${geminiText}<break time="400ms"/></speak>` },
                            voice: { languageCode: 'en-US', name: 'en-US-Studio-M' },
                            audioConfig: { audioEncoding: 'MP3' },
                        });

                        if (ttsResponse.audioContent) {
                            ws.send(JSON.stringify({ type: 'audio', data: ttsResponse.audioContent.toString('base64') }));
                        }
                    } catch (err) {
                        console.error("AI Processing Error:", err);
                    }
                }
            });
    };

    ws.on('message', (message) => {
        const msg = JSON.parse(message);
        if (msg.type === 'dashboard_connect') {
            dashboardSockets.add(ws);
        } else if (msg.event === 'start') {
            startStream();
        } else if (msg.event === 'audio_in') {
            if (recognizeStream) recognizeStream.write(Buffer.from(msg.data, 'base64'));
        } else if (msg.event === 'stop') {
            if (recognizeStream) {
                recognizeStream.destroy();
                recognizeStream = null;
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        dashboardSockets.delete(ws);
        if (recognizeStream) {
            recognizeStream.destroy();
            recognizeStream = null;
        }
    });
});