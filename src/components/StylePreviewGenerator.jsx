import { useState } from 'react'
import { generateImage } from '../services/geminiApi'
import { initializeCards } from '../data/tarotCards'

export default function StylePreviewGenerator({ apiKey, onPreviewConfirmed, onReset }) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)

  const handleGeneratePreview = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const allCards = initializeCards()
      const randomCard = allCards[Math.floor(Math.random() * allCards.length)]

      const backCoverPrompt = `Create a tarot card back cover design. ${prompt}. The design should be mystical, ornate, and symmetrical, suitable for the back of all tarot cards in a deck. IMPORTANT: Create this as a vertical portrait image with a 2:3 aspect ratio (width:height). The entire design should fit within this format without any cropping.`

      const cardPrompt = `${prompt}. Create a tarot card illustration for "${randomCard.name}". The card should be vertically oriented with mystical and symbolic imagery. Focus on achieving the exact style, palette, and rendering quality described above. Create this as a vertical portrait image with a 2:3 aspect ratio (width:height). The entire design should fit within this format without any cropping.`

      const [backCoverImage, cardImage] = await Promise.all([
        generateImage(apiKey, backCoverPrompt),
        generateImage(apiKey, cardPrompt)
      ])

      setPreview({
        prompt,
        backCover: backCoverImage,
        card: {
          ...randomCard,
          image: cardImage
        }
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleConfirm = () => {
    if (preview) {
      onPreviewConfirmed(preview)
    }
  }

  const handleReset = () => {
    setPreview(null)
    if (onReset) {
      onReset()
    }
  }

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-purple-400">Style Preview</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Describe the style for your tarot deck
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Art Nouveau with ornate borders, soft watercolor textures, muted jewel tones, ethereal lighting..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white resize-none"
            disabled={isGenerating}
          />

          <button
            onClick={handleGeneratePreview}
            disabled={!prompt.trim() || isGenerating}
            className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isGenerating ? 'Generating preview...' : 'Generate Style Preview'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {preview && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Back Cover</h3>
              <div className="aspect-[2/3] bg-gray-900 rounded-lg border border-gray-600 overflow-hidden flex items-center justify-center">
                <img src={preview.backCover} alt="Tarot back cover preview" className="w-full h-full object-contain" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-3">Sample Card — {preview.card.name}</h3>
              <div className="aspect-[2/3] bg-gray-900 rounded-lg border border-gray-600 overflow-hidden flex items-center justify-center">
                <img src={preview.card.image} alt={preview.card.name} className="w-full h-full object-contain" />
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Use this style for the full deck
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Try a different preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
