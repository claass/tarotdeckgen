import { useState } from 'react'

export default function ApiKeySettings({ apiKey, onApiKeyChange }) {
  const [isEditing, setIsEditing] = useState(!apiKey)
  const [tempKey, setTempKey] = useState(apiKey || '')
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    if (tempKey.trim()) {
      onApiKeyChange(tempKey.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setTempKey(apiKey || '')
    setIsEditing(false)
  }

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : ''

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-purple-400">API Configuration</h2>

      {!isEditing ? (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">Gemini API Key</p>
            <p className="font-mono text-gray-200">{maskedKey}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Enter your Gemini API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIza..."
                className="flex-1 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-purple-500 text-white"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                {showKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!tempKey.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Save
            </button>
            {apiKey && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Get your API key from{' '}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Google AI Studio
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
