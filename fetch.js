const axios = require("axios");
const fs = require('fs')

const key = "09b7ba36f195481487cac3a89c1f6b5e"

let uploadData

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


// const file = "./note.wav";
// fs.readFile(file, (err, data) => {
//     if (err) return console.error(err);

//     upload
//         .post("/upload", data)
//         .then((res) => {
//             console.log(res.data)

//             assembly
//                 .post("/transcript", {
//                     audio_url: res.data.upload_url,
//                     speaker_labels: true,
//                     summarization: true,
//                     summary_model: "informative",
//                     summary_type: "bullets"
//                 })
//                 .then((res) => {
//                     console.log(res.data)
//                     assembly.get(`/transcript/${res.data.id}`).then(res => console.log(res.data)).catch(console.error)
//                 })
//                 .catch((err) => console.error(err));
//         })
//         .catch((err) => console.error(err));
// });


assembly.get(`/transcript/r7q8sny453-96b8-4384-9e66-decc418a8d30`).then(res => console.log(res.data)).catch(console.error)




