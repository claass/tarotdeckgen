const STORAGE_KEY = 'tarot-card-generator-state'

/**
 * Load the application state from localStorage
 * @returns {Object} - The saved state or empty object
 */
export function loadState() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)
    if (serializedState === null) {
      return {}
    }
    return JSON.parse(serializedState)
  } catch (error) {
    console.error('Error loading state from localStorage:', error)
    return {}
  }
}

/**
 * Save the application state to localStorage
 * @param {Object} state - The state to save
 */
export function saveState(state) {
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serializedState)
  } catch (error) {
    console.error('Error saving state to localStorage:', error)
  }
}

/**
 * Clear all saved state
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing state from localStorage:', error)
  }
}

/**
 * Save API key separately for security
 * @param {string} apiKey - The API key to save
 */
export function saveApiKey(apiKey) {
  try {
    localStorage.setItem('tarot-api-key', apiKey)
  } catch (error) {
    console.error('Error saving API key:', error)
  }
}

/**
 * Load API key
 * @returns {string|null} - The saved API key or null
 */
export function loadApiKey() {
  try {
    return localStorage.getItem('tarot-api-key')
  } catch (error) {
    console.error('Error loading API key:', error)
    return null
  }
}
