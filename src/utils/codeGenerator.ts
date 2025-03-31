
/**
 * Utility for generating and working with unique game codes
 */

// Word list for generating three-word codes
const words = [
  "apple", "banana", "cherry", "date", "elder", "fig", "grape", "honey", 
  "iris", "jazz", "kiwi", "lemon", "mango", "ninja", "olive", "peach", 
  "queen", "ruby", "spark", "tiger", "umbra", "vital", "waltz", "xenon", 
  "yacht", "zebra", "amber", "birch", "coral", "daisy", "eagle", "fern",
  "glow", "harbor", "indigo", "juniper", "koala", "lotus", "meadow", "noble",
  "ocean", "pearl", "quartz", "river", "silver", "tulip", "unite", "velvet",
  "willow", "xylophone", "zephyr", "azure", "breeze", "crimson", "dusk"
];

/**
 * Generates a unique three-word code with hyphens
 * @returns A string with three random words separated by hyphens
 */
export const generateUniqueCode = (): string => {
  // Select three random words from the array
  const selectedWords = Array(3)
    .fill(0)
    .map(() => words[Math.floor(Math.random() * words.length)]);
  
  // Join with hyphens
  return selectedWords.join('-');
};

/**
 * Checks if a string is a valid three-word code format
 * @param code The string to validate
 * @returns True if the code follows the three-word-with-hyphens format
 */
export const isValidCode = (code: string): boolean => {
  if (!code) return false;
  
  const parts = code.split('-');
  return parts.length === 3 && parts.every(part => part.trim().length > 0);
};
