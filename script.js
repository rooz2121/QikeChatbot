document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const landingPage = document.getElementById('landingPage');
    const chatContainer = document.getElementById('chatContainer');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');
    const apiKey = 'V2NiNfHiCxawfR1QeCp1KxZKjIkJDM52'; // Mistral AI API key
    const particlesContainer = document.getElementById('particles');
    const googleLoginBtn = document.querySelector('.google-login-btn');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const chatLayout = document.querySelector('.chat-layout');
    const sidebarPanel = document.getElementById('sidebarPanel');
    const appTitle = document.getElementById('appTitle');
    const newChatBtn = document.getElementById('newChatBtn');
    const historyList = document.querySelector('.history-list');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Initialize - hide chat container, show landing page
    chatContainer.style.display = 'none';
    
    // Create animated background particles
    createParticles();

    // Login Modal Elements
    const loginModal = document.getElementById('loginModal');
    const showLoginModalBtn = document.getElementById('showLoginModalBtn');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const tryQuikeBtn = document.getElementById('tryQuikeBtn');
    
    // Show login modal
    if (showLoginModalBtn) {
        showLoginModalBtn.addEventListener('click', () => {
            loginModal.style.visibility = 'visible';
            loginModal.style.opacity = '1';
            loginModal.classList.add('visible');
        });
    }
    
    // Close login modal
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => {
            loginModal.classList.remove('visible');
            setTimeout(() => {
                loginModal.style.visibility = 'hidden';
                loginModal.style.opacity = '0';
            }, 500);
        });
    }
    
    // Try Quike button (for guest users)
    if (tryQuikeBtn) {
        tryQuikeBtn.addEventListener('click', () => {
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
    }

    // Back button functionality removed
    
    // Google login button handler is now handled by supabase-auth.js
    
    // Sidebar toggle functionality
    sidebarToggle.addEventListener('click', () => {
        chatLayout.classList.toggle('sidebar-closed');
        
        // Update the toggle button icon
        const toggleIcon = sidebarToggle.querySelector('i');
        if (chatLayout.classList.contains('sidebar-closed')) {
            toggleIcon.classList.remove('fa-bars');
            toggleIcon.classList.add('fa-chevron-right');
        } else {
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-bars');
        }
    });
    
    // Mobile sidebar toggle functionality
    if (sidebarToggle && sidebarPanel && sidebarOverlay) {
        // Make sure sidebar is fully initialized
        sidebarPanel.style.pointerEvents = 'auto';
        sidebarOverlay.style.pointerEvents = 'auto';
        
        // More reliable click handler for mobile with debugging
        function toggleSidebar() {
            try {
                console.log('Toggle sidebar called');
                const sidebar = document.getElementById('sidebarPanel');
                const overlay = document.getElementById('sidebarOverlay');
                
                if (!sidebar) {
                    console.error('Sidebar panel element not found!');
                    return;
                }
                
                if (!overlay) {
                    console.error('Sidebar overlay element not found!');
                    return;
                }
                
                // Debug sidebar before toggle
                debugSidebar('Before toggle');
                
                // Toggle classes
                const isVisible = sidebar.classList.contains('visible');
                
                if (!isVisible) {
                    // Opening the sidebar
                    sidebar.classList.add('visible');
                    overlay.classList.add('visible');
                    
                    // FORCE the sidebar to be visible with inline styles
                    sidebar.style.cssText = 'left: 0 !important; ' +
                        'opacity: 1 !important; ' +
                        'visibility: visible !important; ' +
                        'display: block !important; ' +
                        'z-index: 99999 !important; ' +
                        'pointer-events: auto !important; ' +
                        'touch-action: auto !important; ' +
                        'transform: none !important; ' +
                        'position: fixed !important; ' +
                        'top: 0 !important; ' +
                        'width: 280px !important; ' +
                        'height: 100% !important; ' +
                        'background-color: var(--bg-color) !important;';
                    
                    // Force overlay to be visible
                    overlay.style.cssText = 'display: block !important; ' +
                        'opacity: 1 !important; ' +
                        'visibility: visible !important; ' +
                        'z-index: 99998 !important; ' +
                        'position: fixed !important; ' +
                        'top: 0 !important; ' +
                        'left: 0 !important; ' +
                        'width: 100% !important; ' +
                        'height: 100% !important; ' +
                        'background: rgba(0, 0, 0, 0.5) !important; ' +
                        'pointer-events: auto !important;';
                    
                    // Make all elements inside the sidebar interactive
                    makeAllChildrenInteractive(sidebar);
                    
                    // Set up the overlay click handler to close the sidebar
                    overlay.onclick = function(e) {
                        e.stopPropagation();
                        console.log('Overlay clicked - closing sidebar');
                        closeSidebar();
                        return false;
                    };
                    
                    // Double-check position after a short delay
                    setTimeout(() => {
                        const computedLeft = getComputedStyle(sidebar).left;
                        console.log('Sidebar computed left after timeout:', computedLeft);
                        
                        if (computedLeft !== '0px') {
                            console.warn('Sidebar position still not 0px, forcing again with !important');
                            document.body.insertAdjacentHTML('beforeend', 
                                '<style id="force-sidebar">' +
                                '#sidebarPanel.visible { left: 0 !important; transform: none !important; }' +
                                '</style>');
                            
                            // Try one more time with direct style manipulation
                            sidebar.style.setProperty('left', '0', 'important');
                        }
                    }, 50);
                } else {
                    // Closing the sidebar
                    closeSidebar();
                }
                
                // Debug sidebar after toggle
                setTimeout(() => {
                    debugSidebar('After toggle');
                }, 100);
            } catch (error) {
                console.error('Error in toggleSidebar:', error);
            }
        }

        // Function to close the sidebar
        function closeSidebar() {
            try {
                const sidebar = document.getElementById('sidebarPanel');
                const overlay = document.getElementById('sidebarOverlay');
                
                if (!sidebar || !overlay) {
                    console.error('Sidebar elements not found in closeSidebar');
                    return;
                }
                
                console.log('Closing sidebar');
                sidebar.classList.remove('visible');
                overlay.classList.remove('visible');
                
                // Reset inline styles when closing
                sidebar.style.cssText = 'left: -100% !important; ' +
                    'pointer-events: auto !important; ' +
                    'touch-action: auto !important;';
                
                overlay.style.cssText = 'display: none !important; ' +
                    'opacity: 0 !important; ' +
                    'visibility: hidden !important;';
                
                // Remove any force-sidebar style if it exists
                const forceStyle = document.getElementById('force-sidebar');
                if (forceStyle) {
                    forceStyle.remove();
                }
            } catch (error) {
                console.error('Error in closeSidebar:', error);
            }
        }

        // Function to debug sidebar state
        function debugSidebar(label) {
            try {
                const sidebar = document.getElementById('sidebarPanel');
                if (!sidebar) {
                    console.error('Cannot debug: Sidebar panel element not found!');
                    return;
                }
                
                const computedStyle = window.getComputedStyle(sidebar);
                console.group(`Sidebar Debug: ${label}`);
                console.log('Sidebar element:', sidebar);
                console.log('Has visible class:', sidebar.classList.contains('visible'));
                console.log('Display:', computedStyle.display);
                console.log('Visibility:', computedStyle.visibility);
                console.log('Opacity:', computedStyle.opacity);
                console.log('Left:', computedStyle.left);
                console.log('Z-index:', computedStyle.zIndex);
                console.log('Pointer-events:', computedStyle.pointerEvents);
                console.log('Touch-action:', computedStyle.touchAction);
                console.log('Position:', computedStyle.position);
                console.groupEnd();
            } catch (error) {
                console.error('Error in debugSidebar:', error);
            }
        }

        // Make all children of an element interactive
        function makeAllChildrenInteractive(element) {
            try {
                if (!element) return;
                
                const allChildren = element.querySelectorAll('*');
                allChildren.forEach(child => {
                    child.style.pointerEvents = 'auto';
                    child.style.touchAction = 'auto';
                });
                
                console.log(`Made ${allChildren.length} elements interactive inside sidebar`);
            } catch (error) {
                console.error('Error in makeAllChildrenInteractive:', error);
            }
        }

        // Add both click and touchend events for better mobile response
        sidebarToggle.addEventListener('click', toggleSidebar, {passive: false});
        sidebarToggle.addEventListener('touchend', function(e) {
            e.preventDefault(); // Prevent default touch behavior
            toggleSidebar(e);
        }, {passive: false});
        
        // Make sidebar elements directly interactable
        const makeInteractable = function(element) {
            if (element) {
                element.style.pointerEvents = 'auto';
                element.style.touchAction = 'auto';
            }
        };
        
        // Apply to sidebar and child elements
        makeInteractable(sidebarPanel);
        const historyItems = sidebarPanel.querySelectorAll('.history-item');
        historyItems.forEach(makeInteractable);
        
        // Ensure the history items are clickable
        sidebarPanel.addEventListener('click', function(e) {
            // Prevent click from bubbling to document
            e.stopPropagation();
        }, {passive: false});
        
        // Close sidebar when overlay is clicked
        sidebarOverlay.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebarPanel.classList.remove('visible');
            sidebarOverlay.classList.remove('visible');
        }, {passive: false});
        
        // Extra touch event for overlay
        sidebarOverlay.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sidebarPanel.classList.remove('visible');
            sidebarOverlay.classList.remove('visible');
        }, {passive: false});
        
        // Close sidebar when escape key is pressed
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebarPanel.classList.contains('visible')) {
                sidebarPanel.classList.remove('visible');
                sidebarOverlay.classList.remove('visible');
            }
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(e) {
            // Only run this on mobile screens
            if (window.innerWidth <= 767 && sidebarPanel.classList.contains('visible')) {
                // Check if the click is outside the sidebar
                if (!sidebarPanel.contains(e.target) && e.target !== sidebarToggle) {
                    sidebarPanel.classList.remove('visible');
                    sidebarOverlay.classList.remove('visible');
                }
            }
        });
        
        // Add listener to the panel to stop propagation for clicks inside it
        sidebarPanel.addEventListener('click', (event) => {
            // Prevent clicks inside the sidebar from bubbling up to the overlay
            event.stopPropagation();
        });
        
        // Optional: Add Escape key listener to close sidebar
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                sidebarPanel.classList.remove('visible');
                sidebarOverlay.classList.remove('visible');
            }
        });
    }
    
    // New Chat button functionality
    newChatBtn.addEventListener('click', () => {
        if (window.supabaseAuth && typeof window.supabaseAuth.createNewChatSession === 'function') {
            window.supabaseAuth.createNewChatSession();
        } else {
            createNewChat();
        }
    });
    
    // New Chat banner button functionality
    const newChatBannerBtn = document.getElementById('newChatBannerBtn');
    if (newChatBannerBtn) {
        newChatBannerBtn.addEventListener('click', () => {
            if (window.supabaseAuth && typeof window.supabaseAuth.createNewChatSession === 'function') {
                window.supabaseAuth.createNewChatSession();
            } else {
                createNewChat();
            }
        });
    }
    
    // Function to create a new chat
    function createNewChat() {
        // Clear the chat messages
        chatMessages.innerHTML = '';
        
        // Add the initial bot message
        addMessage("Hello! I'm Quike. How can I assist you today?", 'bot', false);
        
        // Create a new chat history item
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newChatId = 'chat-' + Date.now();
        
        // Create new chat history item
        const newChatItem = document.createElement('div');
        newChatItem.classList.add('history-item');
        newChatItem.dataset.chatId = newChatId;
        
        // Make the new chat active
        const currentActive = document.querySelector('.history-item.active');
        if (currentActive) {
            currentActive.classList.remove('active');
        }
        newChatItem.classList.add('active');
        
        newChatItem.innerHTML = `
            <div class="history-icon"><i class="fas fa-comment"></i></div>
            <div class="history-content">
                <div class="history-title">New Chat</div>
                <div class="history-preview">Hello! I'm Quike...</div>
            </div>
        `;
        
        // Add the new chat to the history list at the top
        if (historyList.firstChild) {
            historyList.insertBefore(newChatItem, historyList.firstChild);
        } else {
            historyList.appendChild(newChatItem);
        }
        
        // Focus on the input field
        userInput.value = '';
        userInput.focus();
        
        // Save the new chat to the database if supabase is available
        if (window.supabaseAuth && typeof window.supabaseAuth.createNewChat === 'function') {
            window.supabaseAuth.createNewChat(newChatId);
        }
        
        return newChatId;
    }

    // Listen for form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = userInput.value.trim();
        
        if (message.length === 0) return;
        
        // Display user message and save to database
        addMessage(message, 'user', true);
        
        // Clear input field
        userInput.value = '';
        
        // First check if this is a personality-related question
        const personalityResponse = checkPersonalityResponse(message);
        
        if (personalityResponse) {
            // If it's a personality question, respond immediately without API call
            setTimeout(() => {
                addMessage(personalityResponse, 'bot', true);
            }, 500); // Small delay for natural feeling
        } else {
            // Add loading indicator
            const loadingMessage = addLoadingIndicator();
            
            try {
                // Get response from API
                const response = await getAIResponse(message);
                
                // Remove loading indicator
                loadingMessage.remove();
                
                // Display bot message and save to database
                addMessage(response, 'bot', true);
            } catch (error) {
                // Remove loading indicator
                loadingMessage.remove();
                
                // Display error message and save to database
                addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'bot', true);
                console.error('Error:', error);
            }
        }
    });

    // Function to add a message to the chat
    function addMessage(text, sender, saveToDb = false) {
        console.log(`Adding message from ${sender}, saveToDb:`, saveToDb);
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // Update the active chat preview text if it's a user message
        if (sender === 'user' && saveToDb) {
            const activeChat = document.querySelector('.history-item.active');
            if (activeChat) {
                const previewElement = activeChat.querySelector('.history-preview');
                if (previewElement) {
                    // Truncate message for preview
                    const previewText = text.length > 25 ? text.substring(0, 25) + '...' : text;
                    previewElement.textContent = previewText;
                }
            }
        }
        
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        
        // Save to database if requested and user is logged in
        if (saveToDb && window.supabaseAuth && typeof window.supabaseAuth.saveMessageToDatabase === 'function') {
            // Check if this is a temporary chat (guest mode)
            const isTemporaryChat = document.querySelector('.history-item.active .history-title')?.textContent === 'Temporary Chat';
            
            if (isTemporaryChat) {
                console.log('In temporary chat mode, not saving message to database');
            } else {
                console.log('Saving message to database:', text);
                window.supabaseAuth.saveMessageToDatabase(text, sender === 'user' ? 'user' : 'assistant');
            }
        } else if (saveToDb) {
            console.error('Could not save message to database: supabaseAuth not available');
        }
        
        if (sender === 'bot') {
            // Extract code blocks
            const codeBlocks = [];
            let processedText = text;
            
            // Regular expression to find code blocks with language specification
            const codeBlockRegex = /```([\w-]*)(\n|\s)([\s\S]*?)```/g;
            let match;
            let lastIndex = 0;
            let tempText = '';
            
            // Process all code blocks in the text
            while ((match = codeBlockRegex.exec(text)) !== null) {
                // Add text before the code block
                tempText += text.substring(lastIndex, match.index);
                
                // Get language and code content
                const language = match[1].trim() || 'plaintext';
                const code = match[3];
                const codeId = `code-${Date.now()}-${codeBlocks.length}`;
                
                // Store code block info
                codeBlocks.push({
                    id: codeId,
                    language: language,
                    code: code
                });
                
                // Replace code block with placeholder
                tempText += `<div class="code-block-placeholder" data-code-id="${codeId}">
                    <div class="code-header">
                        <span class="code-language">${language}</span>
                        <button class="view-code-btn" data-code-id="${codeId}">
                            <i class="fas fa-code"></i> View Code
                        </button>
                    </div>
                    <div class="code-preview">${code.substring(0, 100)}${code.length > 100 ? '...' : ''}</div>
                </div>`;
                
                lastIndex = match.index + match[0].length;
            }
            
            // Add any remaining text
            tempText += text.substring(lastIndex);
            processedText = tempText;
            
            // Configure marked.js options
            marked.setOptions({
                breaks: true,
                gfm: true,
                headerIds: false,
                mangle: false
            });
            
            // Process bold text manually before passing to marked
            processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            // Parse markdown (excluding code blocks which we've already handled)
            contentDiv.innerHTML = marked.parse(processedText);
            
            // Add event listeners to code block view buttons
            setTimeout(() => {
                const viewCodeBtns = messageDiv.querySelectorAll('.view-code-btn');
                viewCodeBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const codeId = btn.getAttribute('data-code-id');
                        const codeBlock = codeBlocks.find(block => block.id === codeId);
                        if (codeBlock) {
                            showCodeViewer(codeBlock.code, codeBlock.language);
                        }
                    });
                });
            }, 0);
        } else {
            // For user messages, just use text content
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            contentDiv.appendChild(paragraph);
        }
        
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
                        { role: 'system', content: `You are Quike, an AI assistant created by the BlackCarbon Team. Your responses should be helpful, friendly, and conversational. If someone asks about who created you, always mention that you were made by the BlackCarbon Team.

You're responding via a web-based chatbot that supports Markdown rendering and displays code snippets in a separate code viewer with a "Copy" button.

✅ Your response structure:
- Use **Markdown** formatting only where appropriate.
- Use **plain paragraphs** for general explanations.
- Use **numbered lists** or **bulleted points** for listing.
- For any **code snippet**, wrap the code inside triple backticks (\`\`\`), and always include the correct language tag like \`javascript\`, \`python\`, etc., for easy parsing.

IMPORTANT GUIDELINES:
1. For simple greetings like "hi", "hello", "hey", etc., respond with a friendly greeting without providing code examples.
2. Only provide code examples when specifically asked about programming or when it's directly relevant to the user's question.
3. Do not randomly print "hello" or "hi" in different programming languages unless specifically asked to do so.
4. When using bold text with asterisks like **this**, make sure there are no spaces between the asterisks and the text.

Example of good response:
Here is a sample JavaScript function:

\`\`\`javascript
function greet(name) {
  return "Hello, " + name;
}
\`\`\`

Do not format regular paragraphs or answers as continuous text with numbers unless it's actually a list.` },
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
    
    // Function to show code viewer
    function showCodeViewer(code, language) {
        const codeViewer = document.getElementById('codeViewer');
        const codeContent = document.getElementById('codeContent');
        const codeLanguage = document.getElementById('codeLanguage');
        
        // Set code and language
        codeContent.textContent = code;
        codeContent.className = language ? `language-${language}` : '';
        codeLanguage.textContent = language || 'plaintext';
        
        // Apply syntax highlighting
        hljs.highlightElement(codeContent);
        
        // Show the code viewer
        codeViewer.classList.add('visible');
    }
    
    // Function to handle copy button
    document.getElementById('copyButton').addEventListener('click', () => {
        const codeContent = document.getElementById('codeContent');
        navigator.clipboard.writeText(codeContent.textContent)
            .then(() => {
                const copyButton = document.getElementById('copyButton');
                copyButton.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyButton.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });
    
    // Close code viewer
    document.getElementById('closeCodeViewer').addEventListener('click', () => {
        document.getElementById('codeViewer').classList.remove('visible');
    });
}); 