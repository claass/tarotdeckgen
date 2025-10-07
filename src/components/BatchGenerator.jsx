import { useState, useRef } from 'react'
import { batchGenerateCards } from '../services/geminiApi'
import { initializeCards } from '../data/tarotCards'

export default function BatchGenerator({ onBatchGenerated, onCardGenerated }) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)
  const cancelRef = useRef({ cancelled: false })

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)
    setProgress({ current: 0, total: 78 })
    cancelRef.current.cancelled = false

    try {
      const cards = initializeCards().map(card => ({
        ...card,
        image: null,
        previousVersions: [],
        isGenerating: true
      }))

      // Initialize cards immediately to show placeholders
      onBatchGenerated(cards)

      await batchGenerateCards(
        cards,
        prompt,
        (current, total) => setProgress({ current, total }),
        (cardId, imageDataUrl, error) => {
          // Update individual card as it's generated
          if (onCardGenerated) {
            onCardGenerated(cardId, imageDataUrl, error)
          }
        },
        cancelRef
      )

      if (!cancelRef.current.cancelled) {
        setPrompt('')
      }
    } catch (err) {
      if (err.message !== 'Generation cancelled by user') {
        setError(err.message)
      }
    } finally {
      setIsGenerating(false)
      setProgress({ current: 0, total: 0 })

      // Clean up any remaining placeholder cards (those still marked as isGenerating)
      // This happens when generation is cancelled
      if (cancelRef.current.cancelled && onBatchGenerated) {
        // We'll let App.jsx filter out the placeholder cards
      }
    }
  }

  const handleCancel = () => {
    cancelRef.current.cancelled = true
    setError('Generation cancelled. Already generated cards have been saved.')
  }

  const progressPercentage = progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-purple-400">Batch Card Generator</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Style Prompt for All 78 Cards
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g., Art Nouveau style with clean line work and ornate borders. Soft watercolor textures with warm color palette. Symmetrical composition. Consistent, cohesive series with uniform artistic style across all cards..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white resize-none"
            disabled={isGenerating}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isGenerating ? `Generating... (${progress.current}/${progress.total})` : 'Generate All 78 Cards'}
          </button>

          {isGenerating && (
            <button
              onClick={handleCancel}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {isGenerating && (
          <div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2 text-center">
              {progressPercentage}% complete
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>⚠️ This will generate 78 images and may take several minutes.</p>
          <p>✨ The first card generated will be used as a style reference for all remaining cards to ensure consistency.</p>
          <p>⚡ Cards are generated in parallel batches of 5 for faster completion.</p>
          <p>💡 For best consistency, be very specific about artistic style, technique, colors, and composition.</p>
          <p>🎨 Example: "Art Nouveau with clean line work, ornate braided borders, soft watercolor textures, warm muted palette (cream, soft blue, brown, gold), symmetrical layout, vintage poster aesthetic"</p>
        </div>
      </div>
    </div>
  )
}
