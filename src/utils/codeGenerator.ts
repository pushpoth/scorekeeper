
// List of simple English words for generating readable codes
const words = [
  'apple', 'banana', 'cherry', 'date', 'elder', 'fig', 'grape', 'honey', 'ivy', 'jam', 
  'kiwi', 'lemon', 'mango', 'nut', 'orange', 'plum', 'quail', 'rice', 'sugar', 'tea', 
  'ugli', 'vine', 'wheat', 'yam', 'zest', 'almond', 'bean', 'corn', 'donut', 'egg', 
  'flour', 'garlic', 'herb', 'ice', 'jelly', 'kale', 'lime', 'mint', 'noodle', 'olive', 
  'pizza', 'quiche', 'radish', 'salad', 'tomato', 'umbrella', 'vanilla', 'waffle', 'yogurt', 
  'zebra', 'apricot', 'berry', 'carrot', 'dragon', 'eggplant', 'fennel', 'ginger', 'hazelnut', 
  'iris', 'jasmine', 'ketchup', 'lettuce', 'mushroom', 'nutmeg', 'onion', 'peach', 'quinoa', 
  'raspberry', 'spinach', 'turnip', 'unicorn', 'violet', 'wasabi', 'xylophone', 'yellow', 'zucchini'
];

/**
 * Generates a unique code consisting of three random words separated by hyphens
 * @returns A unique code string (e.g., "cherry-banana-grape")
 */
export const generateUniqueCode = (): string => {
  // Pick three random words from the list
  const randomWords: string[] = [];
  
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    randomWords.push(words[randomIndex]);
  }
  
  // Join the words with hyphens
  return randomWords.join('-');
};

/**
 * Validates if a string matches the format of a generated code
 * @param code The code string to validate
 * @returns True if the code is in the correct format
 */
export const isValidCodeFormat = (code: string): boolean => {
  // Check if the code consists of three words separated by hyphens
  const parts = code.split('-');
  return parts.length === 3 && parts.every(part => part.length > 0);
};
