import { useEffect, useMemo, useState } from 'react'

export default function ApiKeySettings({ apiKey, onApiKeyChange }) {
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (onApiKeyChange) {
      onApiKeyChange(apiKey || '')
    }
  }, [apiKey, onApiKeyChange])

  const displayKey = useMemo(() => {
    if (!apiKey) return 'Not configured'
    if (showKey) return apiKey
    if (apiKey.length <= 12) return apiKey
    return `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`
  }, [apiKey, showKey])

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-purple-400">API Configuration</h2>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-sm text-gray-400 mb-1">Gemini API Key</p>
            <p className="font-mono text-gray-200 break-all">{displayKey}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            disabled={!apiKey}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-700/50 disabled:text-gray-500 rounded-lg transition-colors"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>

        {apiKey ? (
          <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg text-sm text-green-300">
            <p className="font-semibold">Environment key detected ✅</p>
            <p className="mt-1 text-green-200/80">
              The application will use the Gemini API key provided via environment variables. Update the <code className="bg-green-800/40 px-1 rounded">GEMINI_API_KEY</code> secret to change the key.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-sm text-red-300">
            <p className="font-semibold">Environment key missing ⚠️</p>
            <p className="mt-1 text-red-200/80">
              Set an environment variable named{' '}
              <code className="bg-red-800/40 px-1 rounded">GEMINI_API_KEY</code> before running the app. When using Vite locally,
              ensure the key is exposed to the client (for example by also defining{' '}
              <code className="bg-red-800/40 px-1 rounded">VITE_GEMINI_API_KEY</code>).
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Manage your Gemini API keys from{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Google AI Studio
          </a>
          .
        </p>
      </div>
    </div>
  )
}
