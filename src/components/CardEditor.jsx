import { useState } from 'react'
import { generateImage, editImage } from '../services/geminiApi'

export default function CardEditor({ apiKey, card, onClose, onImageGenerated }) {
  const [editPrompt, setEditPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (!editPrompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      let newImage
      if (card.image) {
        // Edit existing image
        newImage = await editImage(apiKey, card.image, editPrompt)
      } else {
        // Generate new image from scratch
        const fullPrompt = `Create a tarot card illustration for "${card.name}". ${editPrompt}. The card should be vertically oriented with mystical and symbolic imagery. IMPORTANT: Create this as a vertical portrait image with a 2:3 aspect ratio (width:height). The entire design should fit within this format without any cropping.`
        newImage = await generateImage(apiKey, fullPrompt)
      }
      onImageGenerated(card.id, newImage)
      setEditPrompt('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-purple-400">Edit Card: {card.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Current Image</label>
              <div className="aspect-[2/3] bg-gray-900 rounded-lg border border-gray-600 overflow-hidden flex items-center justify-center">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <p className="text-gray-500">No image yet</p>
                )}
              </div>

              {card.previousVersions && card.previousVersions.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Previous Versions</p>
                  <div className="grid grid-cols-3 gap-2">
                    {card.previousVersions.slice(-3).map((img, idx) => (
                      <div key={idx} className="aspect-[2/3] bg-gray-900 rounded border border-gray-600 overflow-hidden">
                        <img src={img} alt={`Previous ${idx + 1}`} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {card.image ? 'Edit Instructions' : 'Generation Prompt'}
              </label>
              <textarea
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder={card.image
                  ? "E.g., Make the colors more vibrant, add more stars in the background, change the figure's pose..."
                  : "E.g., Watercolor style with soft colors, mystical atmosphere..."
                }
                rows={8}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white resize-none"
              />

              <button
                onClick={handleGenerate}
                disabled={!editPrompt.trim() || isGenerating}
                className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isGenerating ? 'Generating...' : (card.image ? 'Generate Edit' : 'Generate Card')}
              </button>

              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-400 text-sm">
                <p className="font-semibold mb-1">💡 Tip:</p>
                <p>
                  {card.image
                    ? 'When you generate a new version, you\'ll be able to choose between the old and new images.'
                    : 'Describe the style, mood, colors, and specific elements you want in this card.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
