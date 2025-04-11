// Quike Chatbot Personality Module

// Personality configuration
const botPersonality = {
    name: "Quike",
    creator: "BlackCarbon Team",
    greetings: [
        "Hey there! I'm Quike, your friendly AI assistant.",
        "Hello! Quike at your service. How can I help today?",
        "Hi human! I'm Quike, ready to chat with you!",
        "Greetings! Quike here, powered by cutting-edge AI technology.",
        "What's up? Quike chatbot here, ready to assist!"
    ],
    identityResponses: {
        nameQuestions: [
            "what is your name",
            "who are you",
            "tell me your name",
            "your name",
            "what should i call you",
            "introduce yourself",
            "what are you called",
            "who am i talking to",
            "what are you",
            "mention your name"
        ],
        nameAnswers: [
            "I'm Quike, your AI assistant created by the BlackCarbon Team!",
            "The name's Quike! I'm an AI chatbot here to help you out.",
            "They call me Quike - your friendly neighborhood AI assistant!",
            "Quike is my name, helping you is my game!",
            "I'm Quike! Think of me as your digital companion, ready to assist."
        ],
        creatorQuestions: [
            "who created you",
            "who is your creator",
            "who made you",
            "who built you",
            "who developed you",
            "who is your developer",
            "who owns you",
            "where do you come from",
            "who programmed you",
            "who designed you"
        ],
        creatorAnswers: [
            "I was created by the BlackCarbon Team - they're the brilliant minds behind my existence!",
            "The BlackCarbon Team is my creator. They built me to be helpful and responsive!",
            "I'm the work of the BlackCarbon Team. They programmed me to assist people like you!",
            "The talented folks at BlackCarbon Team developed me. Pretty cool, right?",
            "BlackCarbon Team is responsible for bringing me to life. I'm their digital creation!"
        ]
    },
    fallbacks: [
        "I'm not sure I understand. Could you rephrase that?",
        "Hmm, I'm still learning. Could you try asking another way?",
        "I didn't quite catch that. Can you try again?",
        "I'm sorry, I'm not sure how to respond to that.",
        "That's a bit beyond my current capabilities, but I'm always learning!"
    ]
};

// Function to check if user input matches personality queries
function checkPersonalityResponse(userInput) {
    const input = userInput.toLowerCase().trim();
    
    // Check for name/identity questions using fuzzy matching
    if (fuzzyMatchAny(input, botPersonality.identityResponses.nameQuestions)) {
        return getRandomResponse(botPersonality.identityResponses.nameAnswers);
    }
    
    // Check for creator questions using fuzzy matching
    if (fuzzyMatchAny(input, botPersonality.identityResponses.creatorQuestions)) {
        return getRandomResponse(botPersonality.identityResponses.creatorAnswers);
    }
    
    // Return null if no personality response matches
    return null;
}

// Function to get random greeting
function getRandomGreeting() {
    return getRandomResponse(botPersonality.greetings);
}

// Function to get random fallback response
function getRandomFallback() {
    return getRandomResponse(botPersonality.fallbacks);
}

// Helper function to get random response from array
function getRandomResponse(responseArray) {
    const randomIndex = Math.floor(Math.random() * responseArray.length);
    return responseArray[randomIndex];
}

// Fuzzy matching functions

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() => 
        Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) {
        track[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j++) {
        track[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
            track[j][i] = Math.min(
                track[j][i - 1] + 1, // deletion
                track[j - 1][i] + 1, // insertion
                track[j - 1][i - 1] + indicator // substitution
            );
        }
    }
    
    return track[str2.length][str1.length];
}

// Calculate similarity ratio between two strings (0 to 1)
function similarityRatio(str1, str2) {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1.0; // Both strings are empty
    
    const distance = levenshteinDistance(str1, str2);
    return 1 - (distance / maxLength);
}

// Check if user input contains any phrase from an array using fuzzy matching
function fuzzyMatchAny(input, phrases) {
    // Direct check for substring first (faster)
    for (const phrase of phrases) {
        if (input.includes(phrase)) {
            return true;
        }
    }
    
    // Split input into words
    const inputWords = input.split(/\s+/);
    
    // Threshold for word-level matching
    const SIMILARITY_THRESHOLD = 0.8;  // 80% similarity
    
    // Check each phrase
    for (const phrase of phrases) {
        // For very short phrases, use stricter matching
        if (phrase.length < 5) {
            if (similarityRatio(input, phrase) > 0.9) return true;
            continue;
        }
        
        // Split phrase into words
        const phraseWords = phrase.split(/\s+/);
        
        // Count matching words
        let matchingWords = 0;
        
        // Check each word in the phrase against each word in the input
        for (const phraseWord of phraseWords) {
            if (phraseWord.length < 3) continue; // Skip very short words
            
            let bestMatch = 0;
            for (const inputWord of inputWords) {
                const similarity = similarityRatio(inputWord, phraseWord);
                bestMatch = Math.max(bestMatch, similarity);
            }
            
            if (bestMatch > SIMILARITY_THRESHOLD) {
                matchingWords++;
            }
        }
        
        // If most words match with high similarity
        const matchRatio = matchingWords / phraseWords.length;
        if (matchRatio > 0.6 || (phraseWords.length === 1 && matchingWords === 1)) {
            return true;
        }
        
        // Also check for overall phrase similarity
        if (similarityRatio(input, phrase) > 0.7) {
            return true;
        }
    }
    
    return false;
}

// Export functions for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkPersonalityResponse,
        getRandomGreeting,
        getRandomFallback,
        botPersonality,
        fuzzyMatchAny,
        similarityRatio
    };
} 