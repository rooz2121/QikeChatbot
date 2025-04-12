// Quike Chatbot - History Page JavaScript with Supabase Integration

// Global variables
let selectedSessionId = null;
const urlParams = new URLSearchParams(window.location.search);
const sessionIdFromUrl = urlParams.get('id');

document.addEventListener('DOMContentLoaded', function() {
    // Add animation to the background
    animateBackground();
    
    // The rest of the initialization is handled by the checkAuth function in the HTML
    // which calls loadChatHistory() after confirming the user is authenticated
});

// Initialize the conversation view
function initConversationView(sessionId, title, date) {
    const conversationTitle = document.getElementById('conversationTitle');
    const conversationDate = document.getElementById('conversationDate');
    const conversationMessages = document.getElementById('conversationMessages');
    
    // Set title and date
    conversationTitle.textContent = title || 'Untitled Chat';
    conversationDate.textContent = date || '';
    
    // Clear messages container
    conversationMessages.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Loading messages...</p></div>';
    
    // Load messages for this session
    loadSessionMessages(sessionId);
}

// Load chat history from Supabase
async function loadChatHistory() {
    try {
        // Get user's chat sessions from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            window.location.href = '../index.html';
            return;
        }
        
        const { data: sessions, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .order('updated_at', { ascending: false });
            
        if (error) throw error;
        
        // Get the history list container
        const historyList = document.getElementById('historyList');
        
        // Clear existing items
        historyList.innerHTML = '';
        
        if (sessions && sessions.length > 0) {
            // Create history items for each session
            const historyPromises = sessions.map(async (chatSession) => {
                const historyItem = await createHistoryItem(chatSession);
                historyList.appendChild(historyItem);
                
                // If this is the session from the URL, select it
                if (sessionIdFromUrl && chatSession.id === sessionIdFromUrl) {
                    selectChatSession(chatSession);
                }
                
                return historyItem;
            });
            
            // Wait for all history items to be created
            await Promise.all(historyPromises);
            
            // If no session was selected from URL, select the first one
            if (!sessionIdFromUrl && sessions.length > 0) {
                selectChatSession(sessions[0]);
            }
        } else {
            // No sessions found
            historyList.innerHTML = '<div class="no-history">No chat history found</div>';
        }
    } catch (error) {
        console.error('Error loading chat history:', error);
        document.getElementById('historyList').innerHTML = 
            `<div class="error-message">Error loading chat history: ${error.message}</div>`;
    }
}

// Load messages for a specific session
async function loadSessionMessages(sessionId) {
    try {
        console.log('Loading messages for session:', sessionId);
        const conversationMessages = document.getElementById('conversationMessages');
        conversationMessages.innerHTML = '<div class="loading-indicator"><div class="spinner"></div><p>Loading messages...</p></div>';
        
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        console.log('Retrieved messages:', messages);
        conversationMessages.innerHTML = '';
        
        if (messages && messages.length > 0) {
            // Group messages by date for better organization
            const messagesByDate = {};
            messages.forEach(message => {
                const date = new Date(message.created_at).toLocaleDateString();
                if (!messagesByDate[date]) {
                    messagesByDate[date] = [];
                }
                messagesByDate[date].push(message);
            });
            
            // Iterate through dates and create date separators and messages
            Object.keys(messagesByDate).forEach(date => {
                // Add date separator
                const dateSeparator = document.createElement('div');
                dateSeparator.classList.add('date-separator');
                dateSeparator.textContent = date;
                conversationMessages.appendChild(dateSeparator);
                
                // Add messages for this date
                messagesByDate[date].forEach(message => {
                    const messageElement = createMessageElement(message);
                    conversationMessages.appendChild(messageElement);
                });
            });
            
            // Scroll to the bottom after adding all messages
            setTimeout(() => {
                conversationMessages.scrollTop = conversationMessages.scrollHeight;
            }, 100);
        } else {
            conversationMessages.innerHTML = '<div class="no-messages">No messages in this conversation</div>';
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        document.getElementById('conversationMessages').innerHTML = 
            `<div class="error-message">Error loading messages: ${error.message}</div>`;
    }
}

// Function to process code blocks separately from regular text
function processCodeBlocks(content) {
    const codeBlockRegex = /```([\w-]*)?\n?([\s\S]*?)```/g;
    const codeBlocks = [];
    let processedText = content;
    
    // Extract code blocks
    let match;
    while ((match = codeBlockRegex.exec(content)) !== null) {
        const language = match[1] || 'plaintext';
        const code = match[2];
        codeBlocks.push({ language, code });
    }
    
    return { text: processedText, codeBlocks };
}

// Create a message element
function createMessageElement(message) {
    console.log('Creating message element:', message);
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(message.role === 'user' ? 'user-message' : 'bot-message');
    messageDiv.dataset.messageId = message.id;
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    // Add role indicator for better visual distinction
    const roleIndicator = document.createElement('div');
    roleIndicator.classList.add('role-indicator');
    roleIndicator.innerHTML = message.role === 'user' ? 
        '<i class="fas fa-user"></i>' : 
        '<i class="fas fa-robot"></i>';
    messageDiv.appendChild(roleIndicator);
    
    if (message.role === 'assistant') {
        // Extract code blocks for special handling
        const processedContent = processCodeBlocks(message.content);
        
        // Configure marked.js options
        marked.setOptions({
            breaks: true,
            gfm: true,
            headerIds: false,
            mangle: false
        });
        
        // Process markdown
        contentDiv.innerHTML = marked.parse(processedContent.text);
        
        // Apply syntax highlighting to code blocks
        contentDiv.querySelectorAll('pre code').forEach(block => {
            hljs.highlightElement(block);
            
            // Add copy button to code blocks
            const preElement = block.parentElement;
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';
            
            const header = document.createElement('div');
            header.className = 'code-block-header';
            
            // Detect language
            let language = block.className.replace('language-', '');
            if (!language || language === 'hljs') {
                language = 'code';
            }
            
            const langIndicator = document.createElement('span');
            langIndicator.className = 'code-language';
            langIndicator.textContent = language;
            header.appendChild(langIndicator);
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent);
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            });
            header.appendChild(copyBtn);
            
            // Replace pre with wrapper
            const parent = preElement.parentElement;
            wrapper.appendChild(header);
            wrapper.appendChild(preElement);
            parent.appendChild(wrapper);
        });
    } else {
        // For user messages, just use text content
        const paragraph = document.createElement('p');
        paragraph.textContent = message.content;
        contentDiv.appendChild(paragraph);
    }
    
    const timeDiv = document.createElement('div');
    timeDiv.classList.add('message-time');
    timeDiv.textContent = formatDate(new Date(message.created_at));
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timeDiv);
    
    return messageDiv;
}

// Select a chat session to display
function selectChatSession(session) {
    selectedSessionId = session.id;
    
    // Update URL with session ID without reloading the page
    const url = new URL(window.location);
    url.searchParams.set('id', session.id);
    window.history.pushState({}, '', url);
    
    // Highlight the selected session in the sidebar
    document.querySelectorAll('.history-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.sessionId === session.id) {
            item.classList.add('active');
        }
    });
    
    // Initialize the conversation view
    initConversationView(
        session.id, 
        session.title, 
        formatDate(new Date(session.updated_at))
    );
}

// Create a history item element
async function createHistoryItem(session) {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.dataset.sessionId = session.id;
    
    // Get the last message for this session to show as preview
    let previewText = 'No messages';
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('content, role')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (!error && messages && messages.length > 0) {
            // Truncate message preview to 30 characters
            previewText = messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : '');
        }
    } catch (error) {
        console.error('Error fetching message preview:', error);
    }
    
    // Format date
    const date = new Date(session.updated_at);
    const formattedDate = formatDate(date);
    
    item.innerHTML = `
        <div class="history-icon">
            <i class="fas fa-comment"></i>
        </div>
        <div class="history-content">
            <div class="history-title">${session.title || 'Untitled Chat'}</div>
            <div class="history-preview">${previewText}</div>
            <div class="history-date">${formattedDate}</div>
        </div>
        <div class="history-actions">
            <a href="../index.html?session=${session.id}" class="history-action-btn" title="Continue Chat">
                <i class="fas fa-arrow-right"></i>
            </a>
            <button class="history-action-btn delete-btn" title="Delete Chat" data-id="${session.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add click event to select this chat session
    item.addEventListener('click', (e) => {
        // Don't trigger if clicking on action buttons
        if (e.target.closest('.history-actions')) {
            return;
        }
        
        selectChatSession(session);
    });
    
    // Add delete button handler
    const deleteBtn = item.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await deleteChatSession(session.id, item);
        });
    }
    
    return item;
}

// Format date for display
function formatDate(date) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    } else {
        return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
}

// Delete a chat session
async function deleteChatSession(sessionId, historyItemElement) {
    if (confirm('Are you sure you want to delete this chat?')) {
        try {
            // Delete from Supabase
            const { error } = await supabase
                .from('chat_sessions')
                .delete()
                .eq('id', sessionId);
                
            if (error) throw error;
            
            // Remove from UI with animation
            historyItemElement.classList.add('deleting');
            setTimeout(() => {
                historyItemElement.remove();
            }, 300);
            
            // If this was the selected session, clear the conversation view
            if (selectedSessionId === sessionId) {
                selectedSessionId = null;
                document.getElementById('conversationTitle').textContent = 'Select a chat to view';
                document.getElementById('conversationDate').textContent = '';
                document.getElementById('conversationMessages').innerHTML = `
                    <div class="select-chat-prompt">
                        <i class="fas fa-comments"></i>
                        <p>Select a chat from the sidebar to view the conversation</p>
                    </div>
                `;
                
                // Update URL
                const url = new URL(window.location);
                url.searchParams.delete('id');
                window.history.pushState({}, '', url);
            }
        } catch (error) {
            console.error('Error deleting chat session:', error);
            alert(`Error deleting chat: ${error.message}`);
        }
    }
}

// Animate the background
function animateBackground() {
    const bg = document.querySelector('.background-animation');
    
    // Create animated gradient
    if (bg) {
        let gradientPos = 0;
        
        setInterval(() => {
            gradientPos = (gradientPos + 1) % 200;
            bg.style.backgroundPosition = `${gradientPos}% 50%`;
        }, 50);
    }
}
