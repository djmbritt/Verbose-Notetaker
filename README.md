# Verbosey

<p align="center"><img src="./assets/logo.png" width="200px"></p>


Assembly-AI Hackathon project 📢

Team: [devpost.com/software/verbosey](https://devpost.com/software/verbosey#updates)

Chrome extension to record audio from a tab, transcribe it and summarize it.
Be on top your meetings with Verbosey, get real time transcription and meetings notes.

## Install extension

Open a chromium browser and add the `build.crx` file to `chrome://extensions`


[Installation Video](https://www.youtube.com/watch?v=5aGAP5eAaq8)

Make sure you have the server running! 
Follow the instruction below: 
Before that you will need an API key from [AssemblyAI](https://www.assemblyai.com/)

## Setup

```bash
# Setup and run server locally
cd backend
# Add your Assembly API key to the .env file
npm install
npm run prod

#If above does not work on windows try
npm install typescript

# If you're developing the extension (Optional)
cd ui
npm install
npm run build
```

## Install dev build

In a chromium browser (Chrome, Brave, Edge).

1. Navigate to: [chrome://extensions](chrome://extensions).
2. Enable developer mode
3. Click `Load unpacked`
4. Select the `ui/build` folder.
5. Go to the extension menu (🧩), and click pin (📌).
