const axios = require("axios");
const fs = require('fs')

const key = "09b7ba36f195481487cac3a89c1f6b5e"

const upload = axios.create({
    baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: key,
        "content-type": "application/json",
        "transfer-encoding": "chunked",
    },
});

const assembly = axios.create({ baseURL: "https://api.assemblyai.com/v2",
    headers: {
        authorization: key,
        "content-type": "application/json",
    },
});


const file = "./transcript.wav";
fs.readFile(file, async (err, data) => {
    if (err) return console.error(err);

    const uploadRes = await uploadTranscript(data)
    await getSummary(uploadRes.id)
});

const uploadTranscript = async (data) => {
    console.log("Uploading recording...", data)
    const uploadResponse = await upload.post("/upload", data).catch(console.error)

    if (uploadResponse.data.upload_url) {
        console.log("Posting recording to assembly for transcription.")
        const params = {
            audio_url: uploadResponse.data.upload_url,
            speaker_labels: true,
            summarization: true,
            summary_model: "informative",
            summary_type: "bullets"
        }
        const postResponse = await assembly.post("/transcript", params).catch(console.error)

        if(postResponse.data) {
            return postResponse.data
        }
    }
}

const getSummary = async (transcriptId) => {
    try {
        const response = await assembly.get(`/transcript/${transcriptId}`)
        // const data = await response.json()

        if (response?.data?.status === 'queued' || response?.data?.status === 'processing') {
            console.log("Waiting for server to process data, status: ", response?.data?.status)
            setTimeout(async () => await getSummary(transcriptId), 1000)
        } else if (response?.data?.status === 'completed') {
            console.log(response)
            return response
        }else if (response?.data?.status === 'error') {
            console.error(data)
        }
    } catch (error) {
        console.error(error)
    }
}





