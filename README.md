# Quike Chatbot

A beautiful, responsive chatbot interface with a dark-themed aesthetic similar to Grok AI, featuring personality-driven responses.

## Features

- Stylish landing page with "Chat with Quike" button
- Smooth transition animations between screens
- Elegant card-based design with gradient accents
- Responsive layout that works on all devices
- Scrollable chat window displaying both user and bot messages in chat bubbles
- Fixed input bar with a rounded input field and a "Send" button
- Smooth transitions and minimalistic design
- Automatic scrolling to the latest message
- Loading states with elegant animation
- Mobile-responsive design with optimized layouts for different screen sizes

## Personality Features

The Quike chatbot comes with a built-in personality system that:

- Responds to identity questions like "What is your name?" or "Who are you?"
- Correctly identifies itself as a creation of the BlackCarbon Team
- Uses varied, conversational responses with a friendly tone
- Greets users with different friendly messages each time
- Handles common questions without calling the API for faster response times
- Uses fuzzy matching to understand misspelled questions (e.g., "whta is your name")
- Implements Levenshtein distance algorithm to handle typos and input variations
- Performs word-level similarity matching for robust understanding of queries

## Technologies Used

- HTML5
- CSS3 (with modern animations and transitions)
- Vanilla JavaScript (no frameworks)
- Mistral AI API for the chatbot responses
- Modular design with separate personality handling
- Custom fuzzy matching algorithm for natural language understanding

## Setup

1. Clone this repository
2. Open `index.html` in your browser
3. Click "Chat with Quike" to begin chatting with the Quike Chatbot!

## API Key

The application uses a Mistral AI API key. It's currently hardcoded, but for production, you should:
- Store the API key in environment variables
- Implement a backend service to handle API requests securely

## Browser Support

- Chrome
- Firefox
- Safari
- Edge
- Opera

## License

This project is open source and available under the MIT License. 