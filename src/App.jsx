import { useState, useEffect } from 'react'
import ApiKeySettings from './components/ApiKeySettings'
import BackCoverGenerator from './components/BackCoverGenerator'
import BatchGenerator from './components/BatchGenerator'
import CardGrid from './components/CardGrid'
import CardEditor from './components/CardEditor'
import ComparisonDialog from './components/ComparisonDialog'
import { loadState, saveState } from './services/localStorage'
import { getConfiguredApiKey } from './services/geminiApi'

function App() {
  const apiKey = getConfiguredApiKey()
  const [backCover, setBackCover] = useState(null)
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [comparisonData, setComparisonData] = useState(null)

  useEffect(() => {
    const state = loadState()
    if (state.backCover) setBackCover(state.backCover)
    if (state.cards) setCards(state.cards)
  }, [])

  useEffect(() => {
    saveState({ backCover, cards })
  }, [backCover, cards])

  const handleBackCoverGenerated = (imageData) => {
    setBackCover(imageData)
  }

  const handleBatchGenerated = (generatedCards) => {
    setCards(generatedCards)
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

        <ApiKeySettings apiKey={apiKey} />

        {apiKey && (
          <>
            <BackCoverGenerator
              currentBackCover={backCover}
              onBackCoverGenerated={handleBackCoverGenerated}
            />

            <BatchGenerator
              onBatchGenerated={handleBatchGenerated}
              onCardGenerated={handleCardGenerated}
            />

            <CardGrid
              cards={cards}
              backCover={backCover}
              onCardSelect={setSelectedCard}
            />

            {selectedCard && (
              <CardEditor
                card={selectedCard}
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
