import React, { useEffect, useRef, useState } from 'react';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import { BsStopCircleFill } from 'react-icons/bs';
import { AiOutlineLoading } from 'react-icons/ai';
import { db } from '../../db';

const MultiStreamsMixer = require('multistreamsmixer');

const resize = (w: number, h: number) => {
  const width = window.screen.availWidth;
  const height = window.screen.availHeight;

  const l = width - w - 10;
  const t = height / 2 - h / 2;
  window.resizeTo(w, h);
  window.moveTo(l, t);
};

function tabCapture(): Promise<string> {
  resize(700, 600);
  return new Promise((resolve, reject) => {
    chrome.desktopCapture.chooseDesktopMedia(
      ['audio', 'tab'],
      (streamId, options) => {
        console.log(streamId, !streamId, 22222);
        resize(350, 600);
        if (!streamId || !options.canRequestAudioTrack)
          reject('Tab capture failed');
        resolve(streamId);
      }
    );
  });
}

interface Transcript {
  [k: string]: { text: string; final: boolean };
}

const Record: React.FC = () => {
  const [transcript, setTranscript] = useState<Transcript>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [length, setLength] = useState(0);
  const recorder = useRef<RecordRTC | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLength(length + 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [length]);

  const start = async () => {
    const query = new URLSearchParams(window.location.search);
    const streams = [];
    try {
      if (query.get('tab') === 'true') {
        const tabStream = await tabCapture();
        const media = await (navigator.mediaDevices as any).getUserMedia({
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: tabStream,
            },
          },
          audio: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: tabStream,
            },
          },
        });
        media.removeTrack(media.getVideoTracks()[0]);
        streams.push(media);
        streams[0].oninactive = () => stop();
      }
      if (query.get('microphone') === 'true')
        streams.push(
          await navigator.mediaDevices.getUserMedia({
            audio: true,
          })
        );
    } catch (e) {
      setError("Couldn't start recording: source error");
      return;
    }
    const mixedStream = new MultiStreamsMixer(streams);

    let socket: WebSocket | null = null;
    if (query.get('transcribe') === 'true') {
      const response = await fetch('http://localhost:8282/asmtoken');
      const { token } = await response.json();
      socket = await new Promise((resolve, reject) => {
        const socket = new WebSocket(
          `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`
        );
        let transcript: Transcript = {};
        socket.onmessage = (message) => {
          const res = JSON.parse(message.data);
          if (
            ['PartialTranscript', 'FinalTranscript'].includes(res.message_type)
          ) {
            transcript[res.audio_start.toString()] = {
              text: res.text,
              final: res.message_type === 'FinalTranscript',
            };
            setTranscript({ ...transcript });
          }
        };
        socket.onopen = () => {
          resolve(socket);
        };
        socket.onerror = (event) => {
          reject(event);
          socket.close();
        };
        socket.onclose = (event) => {
          console.log(event);
          alert('Real-time transcripts stopped.');
        };
      });
    }
    recorder.current = new RecordRTC(mixedStream.getMixedStream(), {
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
          const base64data = reader.result?.toString() || '';

          // audio data must be sent as a base64 encoded string
          if (socket) {
            socket.send(
              JSON.stringify({ audio_data: base64data.split('base64,')[1] })
            );
          }
        };
        reader.readAsDataURL(blob);
      },
    });
    recorder.current.startRecording();
    setLoading(false);
    setLength(0);
  };

  const keys = Object.keys(transcript);
  keys.sort((a, b) => parseInt(b) - parseInt(a));

  const stop = async () => {
    console.log(recorder);
    setLoading(true);
    if (!recorder.current) return;
    recorder.current.stopRecording(async () => {
      const blob = recorder.current!.getBlob();
      await db.recordings.add({
        file: blob,
        transcript: keys.map((k) => transcript[k].text).join(' '),
        created_at: new Date(),
        length,
      });
      window.close();
    });
  };

  useEffect(() => {
    start().catch(() => setError('Something went wrong, please try again'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-slate-600 text-sm">{error}</div>
      </div>
    );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <AiOutlineLoading className="animate-spin text-2xl" />
      </div>
    );

  return (
    <div className="flex flex-col h-screen">
      <div className="p-6">
        <button
          className="flex items-center bg-[#ff655b] text-[#fff2f1] border-2 border-[#ff655b] rounded-lg p-2 gap-2 font-bold w-full justify-center shadow-sm"
          onClick={() => stop()}
        >
          <BsStopCircleFill />
          Stop recording
        </button>
      </div>
      <div className="p-6 border-t border-dashed overflow-y-auto flex flex-col-reverse">
        {keys.map((k) => (
          <span key={k} className={transcript[k].final ? '' : 'text-slate-600'}>
            {transcript[k].text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Record;
