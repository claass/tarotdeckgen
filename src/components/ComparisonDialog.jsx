export default function ComparisonDialog({ oldImage, newImage, onChoice }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg border border-gray-700 max-w-6xl w-full p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center text-purple-400">
          Choose Your Preferred Version
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-gray-300">Original</h3>
            <div className="aspect-[2/3] bg-gray-900 rounded-lg border border-gray-600 overflow-hidden flex items-center justify-center">
              {oldImage ? (
                <img
                  src={oldImage}
                  alt="Original version"
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-gray-500">No original image</p>
              )}
            </div>
            <button
              onClick={() => onChoice('old')}
              className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
            >
              Keep Original
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-gray-300">New Version</h3>
            <div className="aspect-[2/3] bg-gray-900 rounded-lg border border-gray-600 overflow-hidden flex items-center justify-center">
              {newImage ? (
                <img
                  src={newImage}
                  alt="New version"
                  className="w-full h-full object-contain"
                />
              ) : (
                <p className="text-gray-500">No new image</p>
              )}
            </div>
            <button
              onClick={() => onChoice('new')}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
            >
              Use New Version
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-400 text-center">
          The original version will be saved in the card's history regardless of your choice.
        </p>
      </div>
    </div>
  )
}
