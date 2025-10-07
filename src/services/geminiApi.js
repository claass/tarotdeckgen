import { cropAndRoundImage } from '../utils/imageProcessing'

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'

const importMetaEnv = typeof import.meta !== 'undefined' ? import.meta.env ?? {} : {}

const possibleEnvKeys = [
  importMetaEnv?.VITE_GEMINI_API_KEY,
  importMetaEnv?.GEMINI_API_KEY
]

if (typeof process !== 'undefined' && process?.env) {
  possibleEnvKeys.push(
    process.env.VITE_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY
  )
}

const ENV_API_KEY = possibleEnvKeys.find(key => typeof key === 'string' && key.trim().length > 0) || ''

function resolveApiKey(providedKey) {
  if (typeof providedKey === 'string' && providedKey.trim().length > 0) {
    return providedKey.trim()
  }
  if (ENV_API_KEY) {
    return ENV_API_KEY
  }
  throw new Error('Gemini API key is not configured. Please set it via environment variables.')
}

export function getConfiguredApiKey() {
  return ENV_API_KEY
}

/**
 * Generate an image using Gemini 2.5 Flash Image (Nano Banana)
 * @param {string} apiKey - Optional Gemini API key (falls back to environment configuration)
 * @param {string} prompt - The text prompt for image generation
 * @param {string} referenceImage - Optional data URL of reference image for style consistency
 * @returns {Promise<string>} - Base64 encoded image data URL
 */
export async function generateImage(apiKey, prompt, referenceImage = null) {
  try {
    const resolvedApiKey = resolveApiKey(apiKey)
    // Build parts array
    const parts = []

    // If reference image provided, add it first for style transfer
    if (referenceImage) {
      // Extract base64 data and mime type from data URL
      const matches = referenceImage.match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        const [, mimeType, base64Data] = matches
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        })
      }
    }

    // Add text prompt
    parts.push({
      text: referenceImage
        ? `Create this in the EXACT same artistic style, color palette, composition, and visual technique as the reference image. ${prompt}`
        : prompt
    })

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'x-goog-api-key': resolvedApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: parts
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to generate image')
    }

    const data = await response.json()

    // Log the response for debugging
    console.log('API Response:', JSON.stringify(data, null, 2))

    if (!data.candidates || !data.candidates[0]?.content?.parts) {
      console.error('Unexpected API response structure:', data)
      throw new Error(`Invalid response format from API. Response: ${JSON.stringify(data)}`)
    }

    // Find the part with image data (API may return text + image)
    const responseParts = data.candidates[0].content.parts
    const imagePart = responseParts.find(part => part.inlineData?.data)

    if (!imagePart) {
      console.error('No image data found in response:', data)
      throw new Error('No image data returned from API')
    }

    const imageBase64 = imagePart.inlineData.data
    const mimeType = imagePart.inlineData.mimeType || 'image/png'

    // Convert to data URL
    const dataUrl = `data:${mimeType};base64,${imageBase64}`

    // Crop white margins and add rounded corners
    const processedDataUrl = await cropAndRoundImage(dataUrl, 12)

    return processedDataUrl
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}

/**
 * Generate an edited version of an image
 * @param {string} apiKey - Optional Gemini API key (falls back to environment configuration)
 * @param {string} baseImageDataUrl - The base64 data URL of the original image
 * @param {string} editPrompt - The edit instructions
 * @returns {Promise<string>} - Base64 encoded image data URL
 */
export async function editImage(apiKey, baseImageDataUrl, editPrompt) {
  try {
    const resolvedApiKey = resolveApiKey(apiKey)
    // Extract base64 data and mime type from data URL
    const matches = baseImageDataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid image data URL format')
    }

    const [, mimeType, base64Data] = matches

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'x-goog-api-key': resolvedApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: editPrompt
            }
          ]
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to edit image')
    }

    const data = await response.json()

    // Log the response for debugging
    console.log('Edit Image API Response:', JSON.stringify(data, null, 2))

    if (!data.candidates || !data.candidates[0]?.content?.parts) {
      console.error('Unexpected API response structure:', data)
      throw new Error(`Invalid response format from API. Response: ${JSON.stringify(data)}`)
    }

    // Find the part with image data (API may return text + image)
    const responseParts = data.candidates[0].content.parts
    const imagePart = responseParts.find(part => part.inlineData?.data)

    if (!imagePart) {
      console.error('No image data found in response:', data)
      throw new Error('No image data returned from API')
    }

    const imageBase64 = imagePart.inlineData.data
    const responseMimeType = imagePart.inlineData.mimeType || 'image/png'

    // Convert to data URL
    const dataUrl = `data:${responseMimeType};base64,${imageBase64}`

    // Crop white margins and add rounded corners
    const processedDataUrl = await cropAndRoundImage(dataUrl, 12)

    return processedDataUrl
  } catch (error) {
    console.error('Error editing image:', error)
    throw error
  }
}

/**
 * Batch generate images for multiple cards
 * @param {string} apiKey - Optional Gemini API key (falls back to environment configuration)
 * @param {Array} cards - Array of card objects
 * @param {string} basePrompt - Base prompt to generate consistent style
 * @param {Function} onProgress - Callback for progress updates (current, total)
 * @param {Function} onCardGenerated - Callback when each card is generated (cardId, imageDataUrl)
 * @param {Object} cancelRef - Reference object with cancelled flag
 * @returns {Promise<Array>} - Array of cards with generated images
 */
export async function batchGenerateCards(apiKey, cards, basePrompt, onProgress, onCardGenerated, cancelRef = null) {
  const resolvedApiKey = resolveApiKey(apiKey)
  const results = []
  let referenceImage = null
  let completedCount = 0

  // Helper function to generate a single card
  const generateCard = async (card, useReference = false) => {
    const cardPrompt = `${basePrompt}. Create a tarot card illustration for "${card.name}". The card should be vertically oriented with mystical and symbolic imagery. ${useReference ? 'Match the style of the reference image exactly.' : ''} Create this as a vertical portrait image with a 2:3 aspect ratio (width:height). The entire design should fit within this format without any cropping.`

    try {
      const imageDataUrl = await generateImage(resolvedApiKey, cardPrompt, useReference ? referenceImage : null)

      const generatedCard = {
        ...card,
        image: imageDataUrl,
        previousVersions: [],
        isGenerating: false
      }

      // Notify that this card is ready
      if (onCardGenerated) {
        onCardGenerated(card.id, imageDataUrl)
      }

      completedCount++
      if (onProgress) {
        onProgress(completedCount, cards.length)
      }

      return generatedCard
    } catch (error) {
      console.error(`Failed to generate image for ${card.name}:`, error)
      const errorCard = {
        ...card,
        image: null,
        previousVersions: [],
        error: error.message,
        isGenerating: false
      }

      if (onCardGenerated) {
        onCardGenerated(card.id, null, error.message)
      }

      completedCount++
      if (onProgress) {
        onProgress(completedCount, cards.length)
      }

      return errorCard
    }
  }

  // Step 1: Generate first card sequentially to get reference image
  console.log('Generating first card as style reference...')
  const firstCard = await generateCard(cards[0], false)
  referenceImage = firstCard.image
  results.push(firstCard)

  if (referenceImage) {
    console.log('First card generated - now generating remaining 77 cards in parallel batches of 5')
  }

  // Step 2: Generate remaining cards in parallel batches of 5
  const remainingCards = cards.slice(1)
  const BATCH_SIZE = 5

  for (let i = 0; i < remainingCards.length; i += BATCH_SIZE) {
    // Check for cancellation before each batch
    if (cancelRef?.current?.cancelled) {
      console.log('Generation cancelled by user')
      throw new Error('Generation cancelled by user')
    }

    const batch = remainingCards.slice(i, i + BATCH_SIZE)

    // Generate batch in parallel
    const batchResults = await Promise.all(
      batch.map(card => generateCard(card, true))
    )

    results.push(...batchResults)

    // Small delay between batches to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  return results
}
