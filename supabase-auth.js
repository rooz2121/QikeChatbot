// Supabase Authentication and Chat History Management

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignupLink = document.getElementById('showSignupLink');
    const showLoginLink = document.getElementById('showLoginLink');
    const authMessage = document.getElementById('authMessage');
    const signOutBtn = document.getElementById('signOutBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const historyList = document.querySelector('.history-list');
    
    // Global variable to store current session ID
    window.currentSessionId = null;
    
    // Check if user is already logged in
    checkUserSession();
    
    // Toggle between login and signup forms
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        authMessage.style.display = 'none';
    });
    
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'flex';
        authMessage.style.display = 'none';
    });
    
    // Login form handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('emailInput').value;
        const password = document.getElementById('passwordInput').value;
        
        try {
            // Show loading state
            const loginBtn = document.getElementById('loginBtn');
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            loginBtn.disabled = true;
            
            // Sign in with email and password
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            // Clear form
            loginForm.reset();
            
        } catch (error) {
            console.error('Error signing in:', error.message);
            authMessage.textContent = error.message;
            authMessage.className = 'auth-message error';
            authMessage.style.display = 'block';
            
            // Reset button
            const loginBtn = document.getElementById('loginBtn');
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            loginBtn.disabled = false;
        }
    });
    
    // Signup form handler
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signupEmailInput').value;
        const password = document.getElementById('signupPasswordInput').value;
        const confirmPassword = document.getElementById('confirmPasswordInput').value;
        
        // Validate passwords match
        if (password !== confirmPassword) {
            authMessage.textContent = 'Passwords do not match';
            authMessage.className = 'auth-message error';
            authMessage.style.display = 'block';
            return;
        }
        
        try {
            // Show loading state
            const signupBtn = document.getElementById('signupBtn');
            signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            signupBtn.disabled = true;
            
            // Sign up with email and password
            const { data, error } = await window.supabaseClient.auth.signUp({
                email,
                password
            });
            
            if (error) throw error;
            
            // Show success message
            authMessage.textContent = 'Account created successfully! You can now sign in.';
            authMessage.className = 'auth-message success';
            authMessage.style.display = 'block';
            
            // Switch to login form
            signupForm.style.display = 'none';
            loginForm.style.display = 'flex';
            
            // Clear form
            signupForm.reset();
            
        } catch (error) {
            console.error('Error signing up:', error.message);
            authMessage.textContent = error.message;
            authMessage.className = 'auth-message error';
            authMessage.style.display = 'block';
            
            // Reset button
            const signupBtn = document.getElementById('signupBtn');
            signupBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            signupBtn.disabled = false;
        }
    });
    
    // Sign out button handler
    signOutBtn.addEventListener('click', async () => {
        try {
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) throw error;
            
            // Show landing page, hide chat interface
            document.getElementById('chatContainer').classList.remove('visible');
            setTimeout(() => {
                document.getElementById('chatContainer').style.display = 'none';
                document.getElementById('landingPage').style.display = 'flex';
                document.getElementById('landingPage').classList.remove('hidden');
            }, 500);
        } catch (error) {
            console.error('Error signing out:', error.message);
        }
    });
    
    // New chat button handler
    newChatBtn.addEventListener('click', () => {
        createNewChatSession();
    });
    
    // Listen for auth state changes
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            console.log('User signed in:', session.user);
            
            // Check if user settings exist, create if not
            checkUserSettings(session.user.id);
            
            // Load chat history
            loadChatHistory(session.user.id);
            
            // Update user profile information
            updateUserProfile(session.user);
            
            // Hide landing page, show chat interface
            document.getElementById('landingPage').classList.add('hidden');
            setTimeout(() => {
                document.getElementById('landingPage').style.display = 'none';
                document.getElementById('chatContainer').style.display = 'flex';
                setTimeout(() => {
                    document.getElementById('chatContainer').classList.add('visible');
                }, 50);
            }, 500);
        } else if (event === 'SIGNED_OUT') {
            console.log('User signed out');
            
            // Clear chat messages
            document.getElementById('chatMessages').innerHTML = '';
            
            // Clear history list
            historyList.innerHTML = '';
            
            // Reset current session ID
            window.currentSessionId = null;
        }
    });
});

// Function to check user session
async function checkUserSession() {
    try {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        
        if (session) {
            // User is logged in
            const user = session.user;
            console.log('Logged in as:', user.email);
            
            // Update user profile information first
            updateUserProfile(user);
            
            // Hide login section, show chat interface
            document.getElementById('landingPage').classList.add('hidden');
            setTimeout(() => {
                document.getElementById('landingPage').style.display = 'none';
                document.getElementById('chatContainer').style.display = 'flex';
                setTimeout(() => {
                    document.getElementById('chatContainer').classList.add('visible');
                    
                    // Check if user settings exist, create if not
                    checkUserSettings(user.id);
                    
                    // Load user's chat history
                    loadChatHistory(user.id);
                }, 50);
            }, 500);
            
            return user;
        }
        return null;
    } catch (error) {
        console.error('Error checking user session:', error);
        return null;
    }
}

// Function to check if user settings exist
async function checkUserSettings(userId) {
    const { data, error } = await window.supabaseClient
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
        
    if (error && error.code === 'PGRST116') {
        // Settings don't exist, create default settings
        await window.supabaseClient
            .from('user_settings')
            .insert([{ user_id: userId }]);
    }
}

// Function to load user's chat history
async function loadChatHistory(userId) {
    console.log('Loading chat history for user ID:', userId);
    try {
        // Get all chat sessions for the user
        const { data: sessions, error } = await window.supabaseClient
            .from('chat_sessions')
            .select('*')
            .eq('user_id', userId) // Filter by user_id
            .order('updated_at', { ascending: false });
            
        if (error) throw error;
        
        console.log('Retrieved chat sessions:', sessions);
        
        // Clear existing history items
        const historyList = document.querySelector('.history-list');
        
        if (!historyList) {
            console.error('History list element not found');
            return;
        }
        
        // Add loading indicator
        historyList.innerHTML = '<div class="loading-history"><div class="spinner"></div>Loading chat history...</div>';
        
        // Add each session to the history list
        if (sessions && sessions.length > 0) {
            // Clear the loading indicator
            historyList.innerHTML = '';
            
            // Group sessions by date: today, yesterday, older
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const todaySessions = [];
            const yesterdaySessions = [];
            const olderSessions = [];
            
            // Sort sessions into date groups
            sessions.forEach(session => {
                const sessionDate = new Date(session.updated_at || session.created_at);
                sessionDate.setHours(0, 0, 0, 0);
                
                if (sessionDate.getTime() === today.getTime()) {
                    todaySessions.push(session);
                } else if (sessionDate.getTime() === yesterday.getTime()) {
                    yesterdaySessions.push(session);
                } else {
                    olderSessions.push(session);
                }
            });
            
            // Create a document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Add date headers and sessions for each group
            if (todaySessions.length > 0) {
                const todayHeader = document.createElement('div');
                todayHeader.className = 'date-header';
                todayHeader.innerHTML = '<span>Today</span>';
                fragment.appendChild(todayHeader);
                
                const todayPromises = todaySessions.map(async (session) => {
                    const historyItem = await createHistoryItem(session);
                    fragment.appendChild(historyItem);
                    return { session, element: historyItem };
                });
                
                await Promise.all(todayPromises);
            }
            
            if (yesterdaySessions.length > 0) {
                const yesterdayHeader = document.createElement('div');
                yesterdayHeader.className = 'date-header';
                yesterdayHeader.innerHTML = '<span>Yesterday</span>';
                fragment.appendChild(yesterdayHeader);
                
                const yesterdayPromises = yesterdaySessions.map(async (session) => {
                    const historyItem = await createHistoryItem(session);
                    fragment.appendChild(historyItem);
                    return { session, element: historyItem };
                });
                
                await Promise.all(yesterdayPromises);
            }
            
            if (olderSessions.length > 0) {
                const olderHeader = document.createElement('div');
                olderHeader.className = 'date-header';
                olderHeader.innerHTML = '<span>Older</span>';
                fragment.appendChild(olderHeader);
                
                const olderPromises = olderSessions.map(async (session) => {
                    const historyItem = await createHistoryItem(session);
                    fragment.appendChild(historyItem);
                    return { session, element: historyItem };
                });
                
                await Promise.all(olderPromises);
            }
            
            // Append all items at once
            historyList.appendChild(fragment);
            
            // If there are sessions, load the most recent one
            if (sessions.length > 0) {
                loadChatSession(sessions[0].id);
            }
        } else {
            // No sessions, either show a message or create a new one
            historyList.innerHTML = '<div class="no-history">No chat history yet.<br>Start a new conversation!</div>';
            // Create a new session after a short delay
            setTimeout(() => {
                createNewChatSession();
            }, 500);
        }
    } catch (error) {
        console.error('Error loading chat history:', error.message);
        const historyList = document.querySelector('.history-list');
        if (historyList) {
            historyList.innerHTML = `<div class="error-loading">Error loading chat history: ${error.message}</div>`;
        }
    }
}

// Function to create a history item element
async function createHistoryItem(session) {
    console.log('Creating history item for session:', session);
    const historyItem = document.createElement('div');
    historyItem.classList.add('history-item');
    historyItem.dataset.sessionId = session.id;
    
    // Get the last message for this session to show as preview
    let previewText = 'Click to view this chat';
    let lastMessageTime = new Date(session.updated_at || session.created_at);
    
    try {
        const { data: messages, error } = await window.supabaseClient
            .from('messages')
            .select('content, role, created_at')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1);
            
        console.log('Message preview query results for session', session.id, ':', messages, error);
            
        if (!error && messages && messages.length > 0) {
            // Update timestamp from the most recent message
            if (messages[0].created_at) {
                lastMessageTime = new Date(messages[0].created_at);
            }
            
            // Only show preview for bot messages as they contain the meaningful responses
            if (messages[0].role === 'assistant') {
                // Clean up content by removing markdown and code blocks for preview
                let cleanContent = messages[0].content
                    .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
                    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                    .replace(/\*(.*?)\*/g, '$1') // Remove italic
                    .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove links
                    .replace(/\n/g, ' '); // Replace newlines with spaces
                    
                // Truncate message preview to 40 characters
                previewText = cleanContent.substring(0, 40) + (cleanContent.length > 40 ? '...' : '');
            } else if (messages[0].role === 'user') {
                // For user messages, show the question
                previewText = messages[0].content.substring(0, 40) + (messages[0].content.length > 40 ? '...' : '');
            }
        }
    } catch (error) {
        console.error('Error fetching message preview for session', session.id, ':', error);
    }
    
    // Format the date
    const date = new Date(session.updated_at);
    const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
    historyItem.innerHTML = `
        <div class="history-icon"><i class="fas fa-comment"></i></div>
        <div class="history-content">
            <div class="history-title">${session.title}</div>
            <div class="history-preview">${previewText}</div>
            <div class="history-date">${formattedDate}</div>
        </div>
        <div class="history-actions">
            <button class="delete-chat-btn" title="Delete Chat">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add click event to load this chat session
    historyItem.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-chat-btn')) {
            loadChatSession(session.id);
            
            // Set this item as active
            document.querySelectorAll('.history-item').forEach(item => {
                item.classList.remove('active');
            });
            historyItem.classList.add('active');
        }
    });
    
    // Add delete button handler
    historyItem.querySelector('.delete-chat-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChatSession(session.id);
    });
    
    return historyItem;
}

// Function to load a specific chat session
async function loadChatSession(sessionId) {
    try {
        // Get all messages for this session
        const { data: messages, error } = await window.supabaseClient
            .from('messages')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true });
            
        if (error) throw error;
        
        // Clear chat messages
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.innerHTML = '';
        
        // Add each message to the chat
        if (messages && messages.length > 0) {
            messages.forEach(message => {
                addMessageToUI(message.content, message.role);
            });
        } else {
            // Add a welcome message if no messages
            addMessageToUI("Hello! I'm Quike, your AI assistant. How can I help you today?", 'assistant');
        }
        
        // Store current session ID
        window.currentSessionId = sessionId;
        
        // Scroll to bottom
        scrollToBottom();
    } catch (error) {
        console.error('Error loading chat session:', error.message);
    }
}

// Function to create a new chat session
async function createNewChatSession() {
    try {
        console.log('Creating new chat session');
        
        // Get current user session
        const { data: { session: userSession } } = await window.supabaseClient.auth.getSession();
        
        if (!userSession || !userSession.user) {
            console.error('No user session found when creating chat session');
            return null;
        }
        
        const userId = userSession.user.id;
        console.log('Creating chat session for user:', userId);
        
        // Create new chat session with user_id
        const { data: session, error } = await window.supabaseClient
            .from('chat_sessions')
            .insert([{ 
                title: 'New Chat', 
                user_id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();
            
        if (error) {
            console.error('Error inserting new chat session:', error);
            throw error;
        }
        
        console.log('Successfully created new chat session:', session);
        
        // Update UI with new session
        const historyItem = await createHistoryItem(session);
        const historyList = document.querySelector('.history-list');
        
        if (!historyList) {
            console.error('History list not found');
            return session.id;
        }
        
        historyList.innerHTML = historyList.innerHTML.replace('<div class="no-history">No chat history yet.<br>Start a new conversation!</div>', '');
        historyList.prepend(historyItem);
        
        // Set as active session
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
        });
        historyItem.classList.add('active');
        
        // Clear chat messages
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            
            // Add welcome message
            addMessageToUI("Hello! I'm Quike, your AI assistant. How can I help you today?", 'assistant');
        }
        
        // Store current session ID
        window.currentSessionId = session.id;
        
        return session.id;
    } catch (error) {
        console.error('Error creating new chat session:', error.message);
        return null;
    }
}

// Function to delete a chat session
async function deleteChatSession(sessionId) {
    if (confirm('Are you sure you want to delete this chat?')) {
        try {
            const { error } = await window.supabaseClient
                .from('chat_sessions')
                .delete()
                .eq('id', sessionId);
                
            if (error) throw error;
            
            // Remove from UI
            const historyItem = document.querySelector(`.history-item[data-session-id="${sessionId}"]`);
            historyItem.remove();
            
            // If this was the active session, create a new one
            if (window.currentSessionId === sessionId) {
                createNewChatSession();
            }
        } catch (error) {
            console.error('Error deleting chat session:', error.message);
        }
    }
}

// Function to add a message to the UI only (no DB save)
function addMessageToUI(text, sender) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender === 'user' ? 'user' : 'bot'}-message`);
    
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    
    // Process the message content (this is a simplified version)
    if (sender === 'assistant') {
        // Use the existing markdown processing if available
        if (window.marked) {
            contentDiv.innerHTML = window.marked.parse(text);
        } else {
            contentDiv.textContent = text;
        }
    } else {
        contentDiv.textContent = text;
    }
    
    // Add to UI
    messageDiv.appendChild(contentDiv);
    document.getElementById('chatMessages').appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();
    
    return messageDiv;
}

// Function to save a message to the database
async function saveMessageToDatabase(text, role) {
    console.log(`Saving message to database. Role: ${role}, CurrentSessionId: ${window.currentSessionId}`);
    
    if (!window.currentSessionId) {
        console.log('No current session ID found, creating new chat session');
        // Create a new session if none exists
        const sessionId = await createNewChatSession();
        if (!sessionId) {
            console.error('Failed to create new chat session');
            return;
        }
        window.currentSessionId = sessionId;
        console.log('Created new session ID:', sessionId);
    }
    
    try {
        // Prepare message data
        const messagePayload = {
            session_id: window.currentSessionId,
            content: text,
            role: role,
            created_at: new Date().toISOString()
        };
        
        console.log('Inserting message with data:', messagePayload);
        
        // Insert message
        const { data: savedMessage, error: messageError } = await window.supabaseClient
            .from('messages')
            .insert([messagePayload])
            .select();
            
        if (messageError) {
            console.error('Error inserting message:', messageError);
            throw messageError;
        }
        
        console.log('Message saved successfully:', savedMessage);
        
        // Update the session's updated_at timestamp
        const { error: updateError } = await window.supabaseClient
            .from('chat_sessions')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', window.currentSessionId);
            
        if (updateError) {
            console.error('Error updating session timestamp:', updateError);
        } else {
            console.log('Session timestamp updated successfully');
        }
        
        // Return the saved message data
        return savedMessage;
    } catch (error) {
        console.error('Error saving message:', error.message);
        return null;
    }
}

// Function to update user profile in the UI
function updateUserProfile(user) {
    console.log('Updating user profile with:', user);
    
    const userNameElement = document.getElementById('userName');
    const userEmailElement = document.getElementById('userEmail');
    const userAvatarElement = document.getElementById('userAvatar');
    
    if (userNameElement && userEmailElement && userAvatarElement) {
        // Set user name - use user_metadata.full_name if available, otherwise use email
        const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        userNameElement.textContent = displayName;
        
        // Set user email
        userEmailElement.textContent = user.email || '';
        
        // Set user avatar if available from Google
        if (user.user_metadata?.avatar_url) {
            userAvatarElement.src = user.user_metadata.avatar_url;
        } else {
            // Generate initials-based avatar as fallback
            const initials = displayName.split(' ').map(name => name[0]).join('').toUpperCase();
            userAvatarElement.src = `https://ui-avatars.com/api/?name=${initials}&background=7C3AED&color=fff`;
        }
    } else {
        console.error('User profile elements not found in the DOM');
        // Try again after a short delay in case the DOM isn't fully loaded
        setTimeout(() => {
            const retryUserName = document.getElementById('userName');
            const retryUserEmail = document.getElementById('userEmail');
            const retryUserAvatar = document.getElementById('userAvatar');
            
            if (retryUserName && retryUserEmail && retryUserAvatar) {
                console.log('Retrying update user profile');
                updateUserProfile(user);
            }
        }, 500);
    }
}

// Function to scroll to the bottom of the chat
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to check and create user settings if needed
async function checkUserSettings(userId) {
    try {
        // Check if user settings exist
        const { data: settings, error } = await window.supabaseClient
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();
        
        if (error && error.code === 'PGRST116') { // Record not found
            // Create default settings for the user
            const { data: newSettings, error: insertError } = await window.supabaseClient
                .from('user_settings')
                .insert([{
                    user_id: userId,
                    theme: 'dark',
                    notification_enabled: true,
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (insertError) throw insertError;
            console.log('Created default settings for user:', userId);
            return newSettings;
        } else if (error) {
            throw error;
        }
        
        return settings;
    } catch (error) {
        console.error('Error checking/creating user settings:', error.message);
        return null;
    }
}

// Expose functions to be used by the main script
window.supabaseAuth = {
    saveMessageToDatabase,
    createNewChatSession,
    loadChatHistory,
    checkUserSession,
    updateUserProfile,
    checkUserSettings
};
