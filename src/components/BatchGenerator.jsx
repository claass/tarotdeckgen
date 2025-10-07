import { useState, useRef, useMemo } from 'react'
import { batchGenerateCards } from '../services/geminiApi'

export default function BatchGenerator({ apiKey, prompt, cards, onBatchGenerated, onCardGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)
  const cancelRef = useRef({ cancelled: false })

  const remainingCardCount = useMemo(() => cards.filter(card => !card.image).length, [cards])

  const handleGenerate = async () => {
    if (!prompt?.trim() || cards.length === 0 || remainingCardCount === 0) {
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress({ current: 0, total: remainingCardCount })
    cancelRef.current.cancelled = false

    try {
      const cardsWithStatus = cards.map(card => ({
        ...card,
        isGenerating: !!card.image ? false : true
      }))

      onBatchGenerated(cardsWithStatus)

      const generatedCards = await batchGenerateCards(
        apiKey,
        cardsWithStatus,
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

      if (!cancelRef.current.cancelled && onBatchGenerated) {
        onBatchGenerated(generatedCards)
      }

      // Prompt remains locked after preview confirmation
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

  const allCardsGenerated = remainingCardCount === 0

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-purple-400">Generate Remaining Cards</h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-300">
            The confirmed style will be applied to the rest of the deck. Your preview card will guide the model for consistent results.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Remaining cards to generate: {remainingCardCount}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || allCardsGenerated}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isGenerating
              ? `Generating... (${progress.current}/${progress.total})`
              : allCardsGenerated
                ? 'All cards generated'
                : `Generate ${remainingCardCount} Cards`}
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
          <p>⚠️ This will generate the remaining tarot cards and may take several minutes.</p>
          <p>✨ The confirmed preview card is used as a style reference for all remaining cards.</p>
          <p>⚡ Cards are generated in parallel batches of 5 for faster completion.</p>
          <p>💡 Generation progress is saved as each card completes, even if you cancel midway.</p>
        </div>
      </div>
    </div>
  )
}
