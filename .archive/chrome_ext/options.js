// const MultiStreamsMixer = require("./multistreammixer");

// required dom elements
const buttonEl = document.getElementById('button');
const fileEl = document.getElementById('file')
const messageEl = document.getElementById('message');
const titleEl = document.getElementById('real-time-title');

let blob
let text
let recordrtc
let streamrtc

function tabCapture() {
  return new Promise((resolve) => {
    chrome.tabCapture.capture(
      {
        audio: true,
        video: false,
      },
      (stream) => {
        resolve(stream);
      }
    );
  });
}

function to16BitPCM(input) {
  const dataLength = input.length * (16 / 8);
  const dataBuffer = new ArrayBuffer(dataLength);
  const dataView = new DataView(dataBuffer);
  let offset = 0;
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return dataView;
}

function to16kHz(audioData, sampleRate = 44100) {
  const data = new Float32Array(audioData);
  const fitCount = Math.round(data.length * (16000 / sampleRate));
  const newData = new Float32Array(fitCount);
  const springFactor = (data.length - 1) / (fitCount - 1);
  newData[0] = data[0];
  for (let i = 1; i < fitCount - 1; i++) {
    const tmp = i * springFactor;
    const before = Math.floor(tmp).toFixed();
    const after = Math.ceil(tmp).toFixed();
    const atPoint = tmp - before;
    newData[i] = data[before] + (data[after] - data[before]) * atPoint;
  }
  newData[fitCount - 1] = data[data.length - 1];
  return newData;
}

function sendMessageToTab(tabId, data) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, data, (res) => {
      resolve(res);
    });
  });
}

async function startRecord(option) {

  // set initial state of application variables
  messageEl.style.display = 'none';
  let isRecording = false;
  let socket;
  let recorder;

  // Retrieve stream from tab
  const tabStream = await tabCapture();
  const userStream = await navigator.mediaDevices.getUserMedia({ audio: true })

  // Mix streams 🔀🔀
  const mixedStream = new MultiStreamsMixer([tabStream, userStream])

  console.log(
    tabStream,
    userStream,
    mixedStream
  )

  // Retrieve temp token for assemblyai
  const response = await fetch('http://localhost:8282/asmtoken');
  const data = await response.json();

  if(data.error){
    alert(data.error)
  }
  const { token } = data;

  // establish wss with AssemblyAI (AAI) at 16000 sample rate
  socket = await new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);

  // handle incoming messages to display transcription to the DOM
  const texts = {};
  socket.onmessage = (message) => {
    // console.log(message)
    let msg = '';
    const res = JSON.parse(message.data);
    texts[res.audio_start] = res.text;
    const keys = Object.keys(texts);
    keys.sort((a, b) => a - b);
    for (const key of keys) {
      if (texts[key]) {
        msg += ` ${texts[key]}`;
      }
    }
    messageEl.innerText = msg;
  };

  // Check for socket errors
  socket.onerror = (event) => {
    console.error(event);
    socket.close();
  }

  // Check for socket close
  socket.onclose = event => {
    console.log(event);
    socket = null;
  }

  if (tabStream && userStream && mixedStream) {

    try {
      recordrtc = new RecordRTC(mixedStream.getMixedStream(), {
        type: 'audio',
        mimeType: 'audio/wav', // endpoint requires 16bit PCM audio
        recorderType: StereoAudioRecorder
      })

      recordrtc.startRecording()
    } catch (error) {
      console.error(error)
    }

    try {

      socket.onopen = () => {
        messageEl.style.display = ''
        isRecording = true
        buttonEl.innerText = 'Stop Recording'



        // This stream is for the realtime recording.
        streamrtc = new RecordRTC(mixedStream.getMixedStream(), {
          type: 'audio',
          mimeType: 'audio/webm;codecs=pcm', // endpoint requires 16bit PCM audio
          recorderType: StereoAudioRecorder,
          timeSlice: 250, // set 250 ms intervals of data that sends to AAI
          desiredSampRate: 16000,
          numberOfAudioChannels: 1, // real-time requires only one channel
          bufferSize: 4096,
          audioBitsPerSecond: 128000,
          ondataavailable: (blob) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64data = reader.result;

              // audio data must be sent as a base64 encoded string
              if (socket) {
                socket.send(JSON.stringify({ audio_data: base64data.split('base64,')[1] }));
              }
            };
            reader.readAsDataURL(blob);
            blob = streamrtc.getBlob()
          },
        });

        streamrtc.startRecording();
      }
    } catch (error) {
      console.error(error)
    }

    // const audioDataCache = [];
    const context = new AudioContext();
    const mediaStream = context.createMediaStreamSource(tabStream);
    const recorder = context.createScriptProcessor(0, 1, 1);

    // Prevent page mute
    mediaStream.connect(recorder);
    recorder.connect(context.destination);
    mediaStream.connect(context.destination);


    // Set recording fields on page.
    titleEl.innerText ='Click stop to end and save recording!'
  } else {
    window.close();
  }
}

// Receive data from Current Tab or Background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { type, data } = request;

  switch (type) {
    case "START_RECORD":
      startRecord(data);
      break;
    default:
      break;
  }

  sendResponse({});
});

const uploadMedia = async (dataBlob) => {
  const content = messageEl.innerText
  const data = new FormData()
  data.append('blob', dataBlob)

  // Is using a token possible for this type of request? It should be, right?
  const responseToken = await fetch('http://localhost:8282/asmtoken').catch(console.error);
  const responseData = await responseToken.json()
  const { token } = responseData
  console.log("token", token)
  const uploadTokenUrl = `https://api.assemblyai.com/v2/upload?token=${token}`

  const uploadUrl = "https://api.assemblyai.com/v2/upload"
  const params = {
    headers: {
      "authorization": "09b7ba36f195481487cac3a89c1f6b5e",
      "Transfer-Encoding": "chunked"
    },
    body: data,
    method: "POST"
  }

  const uploadResponse = await fetch(uploadUrl, params).catch(console.error)
  const dataRes = await uploadResponse.json()
  console.log(dataRes)

  // Return upload url
  // { upload_url: "https://cdn.assemblyai.com/upload/76a2a24b-1648-4d78-946a-fe16241ef743" }
  return dataRes // return upload url
}


buttonEl.addEventListener('click', async () => {
  if (confirm("Are you sure you  want to stop?")) {

    recordrtc.stopRecording(async () => {
      const recordBlob = recordrtc.getBlob()
      console.log(recordrtc, recordBlob)
      invokeSaveAsDialog(recordBlob, 'note.wav')
      const response = await uploadMedia(recordBlob)
      console.log("Uploaded data: ", response)
    })

  }
});

fileEl.addEventListener('click', async () => {
  var a = document.createElement("a");
  a.href = window.URL.createObjectURL(new Blob(["CONTENT"], {type: "text/plain"}));
  a.download = "demo.txt";
  a.click();
})
