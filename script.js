document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const landingPage = document.getElementById('landingPage');
    const chatContainer = document.getElementById('chatContainer');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const backButton = document.getElementById('backButton');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const apiKey = 'V2NiNfHiCxawfR1QeCp1KxZKjIkJDM52'; // Mistral AI API key
    const particlesContainer = document.getElementById('particles');

    // Initialize - hide chat container, show landing page
    chatContainer.style.display = 'none';
    
    // Create animated background particles
    createParticles();

    // Button click handlers
    getStartedBtn.addEventListener('click', () => {
        // Hide landing page with animation
        landingPage.classList.add('hidden');
        
        // Show chat container after a slight delay
        setTimeout(() => {
            landingPage.style.display = 'none';
            chatContainer.style.display = 'flex';
            
            // Add visible class after a slight delay to trigger the animation
            setTimeout(() => {
                chatContainer.classList.add('visible');
                // Focus on the input field
                userInput.focus();
                // Scroll to the bottom
                scrollToBottom();
            }, 50);
        }, 500);
    });

    backButton.addEventListener('click', () => {
        // Hide chat container
        chatContainer.classList.remove('visible');
        
        // Show landing page after a slight delay
        setTimeout(() => {
            chatContainer.style.display = 'none';
            landingPage.style.display = 'flex';
            landingPage.classList.remove('hidden');
        }, 500);
    });

    // Listen for form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        
        if (message.length === 0) return;
        
        // Display user message
        addMessage(message, 'user');
        
        // Clear input field
        userInput.value = '';
        
        // First check if this is a personality-related question
        const personalityResponse = checkPersonalityResponse(message);
        
        if (personalityResponse) {
            // If it's a personality question, respond immediately without API call
            setTimeout(() => {
                addMessage(personalityResponse, 'bot');
            }, 500); // Small delay for natural feeling
        } else {
            // Add loading indicator
            const loadingMessage = addLoadingIndicator();
            
            try {
                // Get response from API
                const response = await getAIResponse(message);
                
                // Remove loading indicator
                loadingMessage.remove();
                
                // Display bot message
                addMessage(response, 'bot');
            } catch (error) {
                // Remove loading indicator
                loadingMessage.remove();
                
                // Display error message
                addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'bot');
                console.error('Error:', error);
            }
        }
    });

    // Function to add a message to the chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        contentDiv.appendChild(paragraph);
        
        const timeDiv = document.createElement('div');
        timeDiv.classList.add('message-time');
        timeDiv.textContent = getCurrentTime();
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom
        scrollToBottom();
        
        return messageDiv;
    }

    // Function to add loading indicator
    function addLoadingIndicator() {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'bot-message');
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('loading-dots');
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            loadingDiv.appendChild(dot);
        }
        
        contentDiv.appendChild(loadingDiv);
        messageDiv.appendChild(contentDiv);
        
        chatMessages.appendChild(messageDiv);
        
        // Scroll to the bottom
        scrollToBottom();
        
        return messageDiv;
    }

    // Function to get the current time
    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        
        return `${hours}:${minutes} ${ampm}`;
    }

    // Function to scroll to the bottom of the chat
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Function to get AI response from Mistral API
    async function getAIResponse(message) {
        const endpoint = 'https://api.mistral.ai/v1/chat/completions';
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'mistral-medium',
                    messages: [
                        { role: 'system', content: `You are Quike, an AI assistant created by the BlackCarbon Team. Your responses should be helpful, friendly, and conversational. If someone asks about who created you, always mention that you were made by the BlackCarbon Team.` },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Initialize the first bot message with a random greeting
    // Replace the default first message with a personality-driven greeting
    const firstBotMessage = document.querySelector('.bot-message .message-content p');
    if (firstBotMessage) {
        firstBotMessage.textContent = getRandomGreeting();
    }

    // Add typewriter effect to preview message in landing page
    const previewMessages = document.querySelectorAll('.preview-message');
    previewMessages.forEach((message, index) => {
        setTimeout(() => {
            message.style.opacity = '1';
        }, index * 300);
    });
    
    // Function to create animated background particles
    function createParticles() {
        if (!particlesContainer) return;
        
        // Clear existing particles
        particlesContainer.innerHTML = '';
        
        // Number of particles to create
        const particleCount = window.innerWidth < 768 ? 15 : 25;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random size
            const size = Math.random() * 10 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // Random starting position
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            particle.style.left = `${posX}%`;
            particle.style.bottom = `${-10}%`; // Start below screen
            
            // Random animation properties
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 10;
            particle.style.animation = `float-particle ${duration}s ${delay}s infinite linear`;
            
            // Add particle to container
            particlesContainer.appendChild(particle);
        }
    }
    
    // Handle window resize for particles
    window.addEventListener('resize', () => {
        createParticles();
    });
}); 