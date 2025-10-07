# Tarot Card Visual Asset Generator

A React application for generating visual assets for tarot card reading apps using Google's Gemini 2.5 Flash Image API (Nano Banana).

## Features

- 🎨 **Back Cover Generation**: Create a unified back cover design for your entire tarot deck
- 🔮 **Batch Card Generation**: Generate all 78 tarot cards at once with a consistent style
- ✏️ **Individual Card Editing**: Select any card and provide edit instructions to refine it
- 🔄 **Version Comparison**: Compare old and new versions side-by-side before choosing
- 💾 **Local Storage**: All images and state are saved in your browser's localStorage
- 🔑 **Secure API Key Management**: API key loaded automatically from environment variables

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (or configure your hosting provider's secrets) with your Gemini key. The application reads from `GEMINI_API_KEY` (or Vite's `VITE_GEMINI_API_KEY` during local development), so add:
   ```bash
   GEMINI_API_KEY=your-key-here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

## How to Use

### 1. Generate a Back Cover

- Navigate to the "Back Cover Generator" section
- Enter a prompt describing your desired back cover design
- Click "Generate Back Cover"
- The back cover will be applied to all cards without custom images

### 2. Generate All Cards (Batch)

- Go to "Batch Card Generator"
- Enter a style prompt that will apply to all 78 cards
- Click "Generate All 78 Cards"
- Wait for the generation to complete (this may take several minutes)
- Progress is shown with a percentage bar

### 3. Edit Individual Cards

- Click on any card in the grid to open the editor
- Enter your edit instructions or generation prompt
- Click "Generate Edit" or "Generate Card"
- A comparison dialog will appear with the old and new versions
- Choose which version to keep

### 4. Version History

- Each card keeps a history of previous versions
- View the last 3 versions in the card editor
- Original images are preserved when you choose a new version

## The 78 Tarot Cards

The application includes the complete tarot deck:

**Major Arcana (22 cards):**
- The Fool, The Magician, The High Priestess, The Empress, The Emperor, The Hierophant, The Lovers, The Chariot, Strength, The Hermit, Wheel of Fortune, Justice, The Hanged Man, Death, Temperance, The Devil, The Tower, The Star, The Moon, The Sun, Judgement, The World

**Minor Arcana (56 cards):**
- Four suits: Wands, Cups, Swords, Pentacles
- Each suit contains: Ace, 2-10, Page, Knight, Queen, King

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **API**: Google Gemini 2.5 Flash Image (Nano Banana)
- **Storage**: Browser localStorage

## Project Structure

```
veil3/
├── src/
│   ├── components/
│   │   ├── ApiKeySettings.jsx
│   │   ├── BackCoverGenerator.jsx
│   │   ├── BatchGenerator.jsx
│   │   ├── CardGrid.jsx
│   │   ├── CardEditor.jsx
│   │   └── ComparisonDialog.jsx
│   ├── services/
│   │   ├── geminiApi.js
│   │   └── localStorage.js
│   ├── data/
│   │   └── tarotCards.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
└── package.json
```

## API Usage Notes

- The Gemini API has rate limits - the batch generator includes a 500ms delay between requests
- Images are returned as base64 data URLs for easy storage and display
- Failed generations are logged with error messages in the card data

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Troubleshooting

**Issue**: Images not loading
- Check that your API key is valid
- Verify you have internet connection
- Check browser console for error messages

**Issue**: localStorage full
- Clear old data from browser settings
- Export/backup important cards before clearing

**Issue**: Batch generation slow
- This is normal - 78 cards takes time
- Do not close the browser during generation
- Progress is saved incrementally

## License

MIT
