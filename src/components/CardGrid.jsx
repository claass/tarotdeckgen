export default function CardGrid({ cards, backCover, onCardSelect }) {
  if (cards.length === 0) {
    return (
      <div className="p-8 bg-gray-800 rounded-lg border border-gray-700 text-center">
        <p className="text-gray-400">
          No cards generated yet. Use the Batch Generator above to create your tarot deck.
        </p>
      </div>
    )
  }

  const majorArcana = cards.filter(card => card.arcana === 'major')
  const minorArcana = cards.filter(card => card.arcana === 'minor')

  const minorBySuit = {
    Wands: minorArcana.filter(card => card.suit === 'Wands'),
    Cups: minorArcana.filter(card => card.suit === 'Cups'),
    Swords: minorArcana.filter(card => card.suit === 'Swords'),
    Pentacles: minorArcana.filter(card => card.suit === 'Pentacles')
  }

  const CardItem = ({ card }) => (
    <div
      onClick={() => !card.isGenerating && onCardSelect(card)}
      className={`group ${card.isGenerating ? 'cursor-wait' : 'cursor-pointer'}`}
    >
      <div className="aspect-[2/3] bg-gray-900 rounded-lg border border-gray-600 overflow-hidden transition-all group-hover:border-purple-500 group-hover:shadow-lg group-hover:shadow-purple-500/50 relative">
        {card.image ? (
          <img
            src={card.image}
            alt={card.name}
            className="w-full h-full object-contain"
          />
        ) : card.isGenerating ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-400 text-xs">Generating...</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {backCover ? (
              <img
                src={backCover}
                alt="Card back"
                className="w-full h-full object-contain opacity-50"
              />
            ) : (
              <p className="text-gray-500 text-sm text-center px-2">No image</p>
            )}
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-300 text-center truncate group-hover:text-purple-400 transition-colors">
        {card.name}
      </p>
      {card.error && (
        <p className="text-xs text-red-400 text-center">Error</p>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      {majorArcana.length > 0 && (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-purple-400">Major Arcana</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {majorArcana.map(card => (
              <CardItem key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}

      {Object.entries(minorBySuit).map(([suit, suitCards]) => {
        if (suitCards.length === 0) return null
        return (
          <div key={suit} className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-purple-400">Minor Arcana - {suit}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
              {suitCards.map(card => (
                <CardItem key={card.id} card={card} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
