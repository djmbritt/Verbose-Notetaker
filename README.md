# Verbosey

<p align="center"><img src="./assets/logo.png" width="200px"></p>


Assembly-AI Hackathon project 📢

Team: [devpost.com/software/verbosey](https://devpost.com/software/verbosey#updates)

Chrome extension to record audio from a tab, transcribe it and summarize it.
Be on top your meetings with Verbosey, get real time transcription and meetings notes.

## Install extension

Open a chromium browser and add the `build.crx` file to `chrome://extensions`

<iframe width="560" height="315" src="https://www.youtube.com/embed/5aGAP5eAaq8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Setup

```bash
# Setup and run server locally
cd backend
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
