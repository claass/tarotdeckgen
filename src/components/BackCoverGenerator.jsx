import { useState } from 'react'
import { generateImage } from '../services/geminiApi'

export default function BackCoverGenerator({ currentBackCover, onBackCoverGenerated }) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const imageDataUrl = await generateImage(
        `Create a tarot card back cover design. ${prompt}. The design should be mystical, ornate, and symmetrical, suitable for the back of all tarot cards in a deck. IMPORTANT: Create this as a vertical portrait image with a 2:3 aspect ratio (width:height). The entire design should fit within this format without any cropping.`
      )
      onBackCoverGenerated(imageDataUrl)
      setPrompt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-purple-400">Back Cover Generator</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Back Cover Design Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Celestial pattern with stars and moon, deep purple and gold colors..."
            rows={4}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white resize-none"
          />

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Back Cover'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Current Back Cover
          </label>
          <div className="aspect-[2/3] bg-gray-900 rounded-lg border border-gray-600 flex items-center justify-center overflow-hidden">
            {currentBackCover ? (
              <img
                src={currentBackCover}
                alt="Tarot back cover"
                className="w-full h-full object-contain"
              />
            ) : (
              <p className="text-gray-500">No back cover generated</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
