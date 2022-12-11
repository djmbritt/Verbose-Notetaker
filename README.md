# Verbosey

<p align="center"><img src="./assets/logo.png" width="200px"></p>

Assembly-AI Hackathon project 📢

Team: [devpost.com/software/verbosey](https://devpost.com/software/verbosey#updates)

Chrome extension to record audio from a tab, transcribe it and summarize it.
Be on top your meetings with Verbosey, get real time transcription and meetings notes.

## Setup

```bash
# To build the extension:
cd ui
npm install
npm run build

# If you want to run your own backend (optional):
cd backend
# Add your Assembly API key to the .env file
npm install
npm run prod
# If above does not work on Windows try
npm install typescript
```

## Install extension

In a chromium browser (Chrome, Brave, Edge).

1. Navigate to: [chrome://extensions](chrome://extensions).
2. Enable developer mode
3. Click `Load unpacked`
4. Select the `ui/build` folder.
5. Go to the extension menu (🧩), and click pin (📌).
