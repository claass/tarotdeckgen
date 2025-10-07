// Complete Tarot deck with 78 cards

export const MAJOR_ARCANA = [
  { id: 'major-0', name: 'The Fool', arcana: 'major', number: 0 },
  { id: 'major-1', name: 'The Magician', arcana: 'major', number: 1 },
  { id: 'major-2', name: 'The High Priestess', arcana: 'major', number: 2 },
  { id: 'major-3', name: 'The Empress', arcana: 'major', number: 3 },
  { id: 'major-4', name: 'The Emperor', arcana: 'major', number: 4 },
  { id: 'major-5', name: 'The Hierophant', arcana: 'major', number: 5 },
  { id: 'major-6', name: 'The Lovers', arcana: 'major', number: 6 },
  { id: 'major-7', name: 'The Chariot', arcana: 'major', number: 7 },
  { id: 'major-8', name: 'Strength', arcana: 'major', number: 8 },
  { id: 'major-9', name: 'The Hermit', arcana: 'major', number: 9 },
  { id: 'major-10', name: 'Wheel of Fortune', arcana: 'major', number: 10 },
  { id: 'major-11', name: 'Justice', arcana: 'major', number: 11 },
  { id: 'major-12', name: 'The Hanged Man', arcana: 'major', number: 12 },
  { id: 'major-13', name: 'Death', arcana: 'major', number: 13 },
  { id: 'major-14', name: 'Temperance', arcana: 'major', number: 14 },
  { id: 'major-15', name: 'The Devil', arcana: 'major', number: 15 },
  { id: 'major-16', name: 'The Tower', arcana: 'major', number: 16 },
  { id: 'major-17', name: 'The Star', arcana: 'major', number: 17 },
  { id: 'major-18', name: 'The Moon', arcana: 'major', number: 18 },
  { id: 'major-19', name: 'The Sun', arcana: 'major', number: 19 },
  { id: 'major-20', name: 'Judgement', arcana: 'major', number: 20 },
  { id: 'major-21', name: 'The World', arcana: 'major', number: 21 }
]

const SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles']
const RANKS = [
  { value: 'ace', name: 'Ace' },
  { value: '2', name: 'Two' },
  { value: '3', name: 'Three' },
  { value: '4', name: 'Four' },
  { value: '5', name: 'Five' },
  { value: '6', name: 'Six' },
  { value: '7', name: 'Seven' },
  { value: '8', name: 'Eight' },
  { value: '9', name: 'Nine' },
  { value: '10', name: 'Ten' },
  { value: 'page', name: 'Page' },
  { value: 'knight', name: 'Knight' },
  { value: 'queen', name: 'Queen' },
  { value: 'king', name: 'King' }
]

export const MINOR_ARCANA = SUITS.flatMap(suit =>
  RANKS.map(rank => ({
    id: `minor-${suit.toLowerCase()}-${rank.value}`,
    name: `${rank.name} of ${suit}`,
    arcana: 'minor',
    suit: suit,
    rank: rank.value
  }))
)

export const ALL_CARDS = [...MAJOR_ARCANA, ...MINOR_ARCANA]

export const initializeCards = () => {
  return ALL_CARDS.map(card => ({
    ...card,
    image: null,
    previousVersions: []
  }))
}
