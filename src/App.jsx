import { useState, useEffect } from 'react'
import ApiKeySettings from './components/ApiKeySettings'
import BatchGenerator from './components/BatchGenerator'
import CardGrid from './components/CardGrid'
import CardEditor from './components/CardEditor'
import ComparisonDialog from './components/ComparisonDialog'
import StylePreviewGenerator from './components/StylePreviewGenerator'
import { initializeCards } from './data/tarotCards'
import { loadState, saveState } from './services/localStorage'

function App() {
  const [apiKey, setApiKey] = useState('')
  const [backCover, setBackCover] = useState(null)
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [comparisonData, setComparisonData] = useState(null)
  const [stylePrompt, setStylePrompt] = useState('')
  const [hasConfirmedStyle, setHasConfirmedStyle] = useState(false)

  useEffect(() => {
    const state = loadState()
    if (state.apiKey) setApiKey(state.apiKey)
    if (state.backCover) setBackCover(state.backCover)
    if (state.cards) setCards(state.cards)
    if (state.stylePrompt) setStylePrompt(state.stylePrompt)
    if (state.hasConfirmedStyle) setHasConfirmedStyle(state.hasConfirmedStyle)
  }, [])

  useEffect(() => {
    saveState({ apiKey, backCover, cards, stylePrompt, hasConfirmedStyle })
  }, [apiKey, backCover, cards, stylePrompt, hasConfirmedStyle])

  const handleApiKeyChange = (key) => {
    setApiKey(key)
  }

  const handleBatchGenerated = (generatedCards) => {
    setCards(generatedCards)
  }

  const handlePreviewConfirmed = ({ prompt, backCover: previewBackCover, card }) => {
    setStylePrompt(prompt)
    setBackCover(previewBackCover)

    const allCards = initializeCards()
    const previewIndex = allCards.findIndex(c => c.id === card.id)
    const previewCard = {
      ...allCards[previewIndex],
      image: card.image,
      previousVersions: [],
      isGenerating: false
    }

    const remainingCards = allCards
      .filter((_, index) => index !== previewIndex)
      .map(cardItem => ({
        ...cardItem,
        image: null,
        previousVersions: [],
        isGenerating: false
      }))

    setCards([previewCard, ...remainingCards])
    setHasConfirmedStyle(true)
  }

  const handleResetStyle = () => {
    setStylePrompt('')
    setBackCover(null)
    setCards([])
    setHasConfirmedStyle(false)
    setSelectedCard(null)
    setComparisonData(null)
  }

  const handleCardGenerated = (cardId, imageDataUrl, error) => {
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId
          ? { ...card, image: imageDataUrl, isGenerating: false, error: error || null }
          : card
      )
    )
  }

  const handleCardEdit = (cardId, newImage) => {
    const card = cards.find(c => c.id === cardId)
    setComparisonData({
      cardId,
      oldImage: card.image,
      newImage
    })
  }

  const handleComparisonChoice = (choice) => {
    if (choice === 'new' && comparisonData) {
      setCards(prevCards =>
        prevCards.map(card =>
          card.id === comparisonData.cardId
            ? { ...card, image: comparisonData.newImage, previousVersions: [...(card.previousVersions || []), card.image] }
            : card
        )
      )
    }
    setComparisonData(null)
    setSelectedCard(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Tarot Card Visual Asset Generator
        </h1>

        <ApiKeySettings apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />

        {apiKey && (
          <>
            {!hasConfirmedStyle ? (
              <StylePreviewGenerator
                apiKey={apiKey}
                onPreviewConfirmed={handlePreviewConfirmed}
              />
            ) : (
              <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-purple-400 mb-2">Style locked in</h2>
                    <p className="text-sm text-gray-300 max-w-2xl">
                      You can now generate the remaining cards in your deck using the confirmed style below. If you want to try a different look, reset the preview and start again.
                    </p>
                  </div>
                  <button
                    onClick={handleResetStyle}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    Reset style preview
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <div className="md:col-span-2">
                    <h3 className="text-sm text-gray-400 mb-2">Style prompt</h3>
                    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-200 whitespace-pre-wrap">
                      {stylePrompt}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-400 mb-2">Back cover preview</h3>
                    <div className="aspect-[2/3] bg-gray-900 rounded-lg border border-gray-700 overflow-hidden flex items-center justify-center">
                      {backCover ? (
                        <img src={backCover} alt="Confirmed tarot back cover" className="w-full h-full object-contain" />
                      ) : (
                        <p className="text-gray-500 text-center px-2">Back cover not available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hasConfirmedStyle && (
              <BatchGenerator
                apiKey={apiKey}
                prompt={stylePrompt}
                cards={cards}
                onBatchGenerated={handleBatchGenerated}
                onCardGenerated={handleCardGenerated}
              />
            )}

            <CardGrid
              cards={cards}
              backCover={backCover}
              onCardSelect={setSelectedCard}
            />

            {selectedCard && (
              <CardEditor
                card={selectedCard}
                apiKey={apiKey}
                onClose={() => setSelectedCard(null)}
                onImageGenerated={handleCardEdit}
              />
            )}

            {comparisonData && (
              <ComparisonDialog
                oldImage={comparisonData.oldImage}
                newImage={comparisonData.newImage}
                onChoice={handleComparisonChoice}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
