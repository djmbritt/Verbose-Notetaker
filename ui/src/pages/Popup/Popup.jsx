import React from 'react';
import { BsRecordCircleFill } from 'react-icons/bs';
import { AiOutlineLoading } from 'react-icons/ai';
import { HiArrowLeft } from 'react-icons/hi';
import { BiMicrophone, BiWindowAlt } from 'react-icons/bi';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import { useState } from 'react';

const Loading = () => {
  return (
    <div className="h-[300px] flex items-center justify-center">
      <AiOutlineLoading className="animate-spin text-2xl" />
    </div>
  );
};

const NewRecording = ({ back }) => {
  const [microphone, setMicrophone] = useState(false);
  const [tab, setTab] = useState(true);
  const [transcribe, setTranscribe] = useState(true);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center relative">
        <button className="z-10" onClick={back}>
          <HiArrowLeft />
        </button>
        <h4 className="font-semibold absolute text-center w-full">
          New recording
        </h4>
      </div>
      <div class="my-6 flex flex-col gap-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <input
              type="checkbox"
              id="microphone"
              checked={microphone}
              onChange={() => setMicrophone(!microphone)}
              class="hidden peer"
            />
            <label
              for="microphone"
              class="block justify-between items-center p-3 text-gray-500 bg-white rounded-lg border-2 border-gray-200 cursor-pointer peer-checked:border-blue-600 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50"
            >
              <div class="flex gap-2 text-sm items-center">
                <BiMicrophone />
                <div>Microphone</div>
              </div>
            </label>
          </div>
          <div>
            <input
              type="checkbox"
              id="tab"
              checked={tab}
              onChange={() => setTab(!tab)}
              class="hidden peer"
            />
            <label
              for="tab"
              class="block justify-between items-center p-3 text-gray-500 bg-white rounded-lg border-2 border-gray-200 cursor-pointer peer-checked:border-blue-600 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50"
            >
              <div class="flex gap-2 text-sm items-center">
                <BiWindowAlt />
                <div>Tab audio</div>
              </div>
            </label>
          </div>
        </div>
        <label class="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            checked={transcribe}
            onChange={() => setTranscribe(!transcribe)}
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span class="ml-3 text-sm font-medium text-gray-900">
            Real-time transcription
          </span>
        </label>
      </div>
      <button
        className="flex items-center bg-[#ff655b] text-[#fff2f1] border-2 border-[#ff655b] rounded-lg p-2 gap-2 font-bold w-full justify-center shadow-sm"
        onClick={() => {}}
      >
        <BsRecordCircleFill />
        Record
      </button>
    </div>
  );
};

const Popup = () => {
  const [record, setRecord] = useState(false);
  const recordings = useLiveQuery(() => db.recordings.toArray());

  if (!recordings) return <Loading />;

  if (record) return <NewRecording back={() => setRecord(false)} />;

  return (
    <div className="p-6">
      <button
        className="flex items-center text-[#ff655b] bg-[#fff2f1] border-2 border-[#f7e1df] rounded-lg p-2 gap-2 font-bold w-full justify-center mb-6 shadow-sm"
        onClick={() => setRecord(true)}
      >
        <BsRecordCircleFill />
        New recording
      </button>
      <div>
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">History</h4>
          <span className="bg-[#f6f8fa] text-sm text-[#3a78d9] px-3 py-1 rounded-lg font-medium">
            {recordings.length} recordings
          </span>
        </div>
        {recordings.length ? (
          recordings.map((recording) => <div key={recording.id}></div>)
        ) : (
          <div className="text-slate-600 h-40 flex items-center justify-center text-sm">
            No recordings yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;
