export default function ApiKeySettings({ apiKey }) {
  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}` : null

  return (
    <div className="mb-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-purple-400">API Configuration</h2>

      {apiKey ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            The Gemini API key is automatically loaded from the <code>GEMINI_API_KEY</code> environment variable.
          </p>
          <div>
            <p className="text-sm text-gray-400 mb-1">Active API key</p>
            <p className="font-mono text-gray-200 break-all">{maskedKey}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-red-300 font-semibold">No API key detected.</p>
          <p className="text-sm text-gray-300">
            Set the <code>GEMINI_API_KEY</code> environment variable before starting the app to enable image generation.
          </p>
          <p className="text-xs text-gray-500">
            API keys can be created in{' '}
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
      )}
    </div>
  )
}
