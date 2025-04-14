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
            
            // Show success notification
            showNotification('Signed in successfully!', 'success');
            
            // Clear form
            loginForm.reset();
            
            // Get user data from the session
            const user = data.user;
            
            // Update user profile information
            updateUserProfile(user);
            
            // Hide landing page, show chat interface
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
            
        } catch (error) {
            console.error('Error signing in:', error.message);
            authMessage.textContent = error.message;
            authMessage.className = 'auth-message error';
            authMessage.style.display = 'block';
            
            // Reset button
            const loginBtn = document.getElementById('loginBtn');
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            loginBtn.disabled = false;
            
            // Show error notification
            showNotification('Login failed: ' + error.message, 'error');
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
            
            // Show success notification
            showNotification('Account created successfully!', 'success');
            
            // Show success message in the form
            authMessage.textContent = 'Account created successfully! You can now sign in.';
            authMessage.className = 'auth-message success';
            authMessage.style.display = 'block';
            
            // Auto-fill the login form with the email
            document.getElementById('emailInput').value = email;
            
            // Switch to login form after a short delay
            setTimeout(() => {
                signupForm.style.display = 'none';
                loginForm.style.display = 'flex';
                
                // Focus on password field
                document.getElementById('passwordInput').focus();
            }, 1500);
            
            // Clear form
            signupForm.reset();
            
        } catch (error) {
            console.error('Error signing up:', error.message);
            authMessage.textContent = error.message;
            authMessage.className = 'auth-message error';
            authMessage.style.display = 'block';
            
            // Show error notification
            showNotification('Signup failed: ' + error.message, 'error');
            
            // Reset button
            const signupBtn = document.getElementById('signupBtn');
            signupBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
            signupBtn.disabled = false;
        }
    });
    
    // Sign out button handler
    signOutBtn.addEventListener('click', async () => {
        try {
            // Show loading state
            const originalContent = signOutBtn.innerHTML;
            signOutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            signOutBtn.disabled = true;
            
            // Check if there's an active session first
            const { data: { session } } = await window.supabaseClient.auth.getSession();
            
            if (!session) {
                // No active session, just redirect to landing page
                showNotification('No active session found', 'info');
                handleSignOutUI();
                return;
            }
            
            // Sign out from Supabase
            const { error } = await window.supabaseClient.auth.signOut();
            if (error) throw error;
            
            // Show success notification
            showNotification('Signed out successfully', 'success');
            
            // Handle UI transition
            handleSignOutUI();
            
        } catch (error) {
            console.error('Error signing out:', error.message);
            // Show error notification
            showNotification('Error signing out: ' + error.message, 'error');
            // Reset button state
            signOutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
            signOutBtn.disabled = false;
            
            // If there was an error, still try to redirect to landing page
            handleSignOutUI();
        }
    });
    
    // Helper function to handle sign out UI transitions
    function handleSignOutUI() {
        // Reset global state
        window.currentSessionId = null;
        
        // Smooth transition to landing page
        document.getElementById('chatContainer').classList.remove('visible');
        setTimeout(() => {
            document.getElementById('chatContainer').style.display = 'none';
            document.getElementById('landingPage').style.display = 'flex';
            setTimeout(() => {
                document.getElementById('landingPage').classList.remove('hidden');
                // Reset login form
                if (document.getElementById('loginForm')) {
                    document.getElementById('loginForm').reset();
                }
                // Reset button state
                const signOutBtn = document.getElementById('signOutBtn');
                if (signOutBtn) {
                    signOutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
                    signOutBtn.disabled = false;
                }
            }, 50);
        }, 500);
    }
    
    // New chat button handler
    newChatBtn.addEventListener('click', () => {
        createNewChatSession();
    });
    
    // Listen for auth state changes
    let isHandlingAuthChange = false; // Flag to prevent multiple simultaneous auth change handlers
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            console.log('User signed in:', session.user);
            
            // Prevent duplicate handling
            if (isHandlingAuthChange) {
                console.log('Already handling auth change, skipping duplicate event');
                return;
            }
            
            isHandlingAuthChange = true;
            
            // Reset login button state
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                loginBtn.disabled = false;
            }
            
            // Close login modal if it's open
            const loginModal = document.getElementById('loginModal');
            if (loginModal && loginModal.classList.contains('visible')) {
                loginModal.classList.remove('visible');
                setTimeout(() => {
                    loginModal.style.visibility = 'hidden';
                    loginModal.style.opacity = '0';
                }, 300);
            }
            
            // Hide login prompt banner, show new chat banner
            const loginPromptBanner = document.getElementById('loginPromptBanner');
            const newChatBanner = document.getElementById('newChatBanner');
            if (loginPromptBanner) loginPromptBanner.style.display = 'none';
            if (newChatBanner) newChatBanner.style.display = 'block';
            
            // Check if user settings exist, create if not
            checkUserSettings(session.user.id);
            
            // Load user's chat history
            loadChatHistory(session.user.id).then(() => {
                // Reset the flag after all operations are complete
                setTimeout(() => {
                    isHandlingAuthChange = false;
                }, 1000);
            });
            
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
            
            // Hide login prompt banner, show new chat banner
            const loginPromptBanner = document.getElementById('loginPromptBanner');
            const newChatBanner = document.getElementById('newChatBanner');
            if (loginPromptBanner) loginPromptBanner.style.display = 'none';
            if (newChatBanner) newChatBanner.style.display = 'block';
            
            // Make sure the user email doesn't show the guest message
            const userEmail = document.getElementById('userEmail');
            if (userEmail && userEmail.textContent === 'Sign in to save chats') {
                userEmail.textContent = user.email || 'User';
            }
            
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
        } else {
            // User is not logged in
            setupGuestMode();
        }
        return null;
    } catch (error) {
        console.error('Error checking user session:', error);
        setupGuestMode();
        return null;
    }
}

// Function to setup guest mode
function setupGuestMode() {
    console.log('Setting up guest mode');
    
    // Show login prompt banner, hide new chat banner
    const loginPromptBanner = document.getElementById('loginPromptBanner');
    const newChatBanner = document.getElementById('newChatBanner');
    if (loginPromptBanner) loginPromptBanner.style.display = 'flex';
    if (newChatBanner) newChatBanner.style.display = 'none';
    
    // Clear history list and show temporary chat
    const historyList = document.querySelector('.history-list');
    
    if (historyList) {
        historyList.innerHTML = `
            <div class="history-item active">
                <div class="history-icon"><i class="fas fa-comment"></i></div>
                <div class="history-content">
                    <div class="history-title">Temporary Chat</div>
                    <div class="history-preview">Your chat won't be saved</div>
                </div>
            </div>
        `;
    }
    
    // Update user profile section
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userName) userName.textContent = 'Guest User';
    if (userEmail) userEmail.textContent = 'Sign in to save chats';
    if (userAvatar) userAvatar.src = 'https://api.dicebear.com/6.x/bottts/svg?seed=guest';
    
    // Add click event to the sidebar login button
    const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
    if (sidebarLoginBtn) {
        sidebarLoginBtn.addEventListener('click', () => {
            // Hide chat container, show landing page
            document.getElementById('chatContainer').classList.remove('visible');
            setTimeout(() => {
                document.getElementById('chatContainer').style.display = 'none';
                document.getElementById('landingPage').style.display = 'flex';
                setTimeout(() => {
                    document.getElementById('landingPage').classList.remove('hidden');
                }, 50);
            }, 500);
        });
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
        // Get all chat sessions for the user with message counts
        const { data: sessions, error } = await window.supabaseClient
            .from('chat_sessions')
            .select(`
                *,
                messages:messages(count)
            `)
            .eq('user_id', userId) // Filter by user_id
            .order('updated_at', { ascending: false });
            
        if (error) throw error;
        
        console.log('Retrieved chat sessions with message counts:', sessions);
        
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
            
            // Group sessions by date: today, yesterday, this week, this month, older
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            const thisWeekStart = new Date(today);
            thisWeekStart.setDate(today.getDate() - today.getDay());
            
            const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            
            const todaySessions = [];
            const yesterdaySessions = [];
            const thisWeekSessions = [];
            const thisMonthSessions = [];
            const olderSessions = [];
            
            // Sort sessions into date groups
            sessions.forEach(session => {
                // Skip sessions with no messages
                if (session.messages && session.messages.length === 0 && 
                    session.title === 'New Chat') {
                    return;
                }
                
                const sessionDate = new Date(session.updated_at || session.created_at);
                sessionDate.setHours(0, 0, 0, 0);
                
                if (sessionDate.getTime() === today.getTime()) {
                    todaySessions.push(session);
                } else if (sessionDate.getTime() === yesterday.getTime()) {
                    yesterdaySessions.push(session);
                } else if (sessionDate >= thisWeekStart) {
                    thisWeekSessions.push(session);
                } else if (sessionDate >= thisMonthStart) {
                    thisMonthSessions.push(session);
                } else {
                    olderSessions.push(session);
                }
            });
            
            // Create a document fragment for better performance
            const fragment = document.createDocumentFragment();
            
            // Helper function to add a date group
            const addDateGroup = async (title, sessions) => {
                if (sessions.length === 0) return;
                
                const header = document.createElement('div');
                header.className = 'date-header';
                header.innerHTML = `<span>${title}</span>`;
                fragment.appendChild(header);
                
                // Sort sessions by updated_at within each group
                sessions.sort((a, b) => {
                    return new Date(b.updated_at) - new Date(a.updated_at);
                });
                
                const promises = sessions.map(async (session) => {
                    const historyItem = await createHistoryItem(session);
                    fragment.appendChild(historyItem);
                    return { session, element: historyItem };
                });
                
                await Promise.all(promises);
            };
            
            // Add all date groups
            await addDateGroup('Today', todaySessions);
            await addDateGroup('Yesterday', yesterdaySessions);
            await addDateGroup('This Week', thisWeekSessions);
            await addDateGroup('This Month', thisMonthSessions);
            await addDateGroup('Older', olderSessions);
            
            // Append all items at once
            historyList.appendChild(fragment);
            
            // If there are sessions, load the most recent one
            if (sessions.length > 0) {
                // Find the first session with messages or just use the first one
                const sessionToLoad = sessions.find(s => 
                    s.messages && s.messages.length > 0
                ) || sessions[0];
                
                loadChatSession(sessionToLoad.id);
            }
        } else {
            // No sessions, either show a message or create a new one
            historyList.innerHTML = `
                <div class="no-history">
                    <p>No chat history</p>
                    <button class="new-chat-btn" id="emptyChatNewBtn" style="padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(99, 102, 241, 0.3); margin: 10px; display: inline-block;">
                        Start a new chat
                    </button>
                </div>
            `;
            
            // Add event listener to the new chat button
            setTimeout(() => {
                const emptyChatNewBtn = document.getElementById('emptyChatNewBtn');
                if (emptyChatNewBtn) {
                    emptyChatNewBtn.addEventListener('click', () => {
                        createNewChatSession();
                    });
                }
            }, 0);
            
            // Show empty state in the chat area instead of creating a new session
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = `
                    <div class="empty-chat-message">
                        <div class="empty-chat-icon">
                            <i class="fas fa-comments"></i>
                        </div>
                        <h3>No active chat</h3>
                        <p>Start a new chat or select one from the history panel</p>
                    </div>
                `;
            }
            
            // Reset current session ID
            window.currentSessionId = null;
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
    let messageRole = 'assistant';
    
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
            
            messageRole = messages[0].role;
            
            // Clean up content by removing markdown and code blocks for preview
            let cleanContent = messages[0].content
                .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                .replace(/\*(.*?)\*/g, '$1') // Remove italic
                .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove links
                .replace(/\n/g, ' '); // Replace newlines with spaces
                
            // Truncate message preview to 40 characters
            previewText = cleanContent.substring(0, 40) + (cleanContent.length > 40 ? '...' : '');
            
            // If it's a user message, add a prefix
            if (messages[0].role === 'user') {
                previewText = 'You: ' + previewText;
            }
        }
    } catch (error) {
        console.error('Error fetching message preview for session', session.id, ':', error);
    }
    
    // Format the date and time intelligently
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let timeString;
    
    // Format time based on how recent it is
    if (lastMessageTime >= today) {
        // Today - show time only
        timeString = lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (lastMessageTime >= yesterday) {
        // Yesterday - show "Yesterday"
        timeString = 'Yesterday';
    } else if (lastMessageTime >= new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)) {
        // Within last week - show day name
        timeString = lastMessageTime.toLocaleDateString([], { weekday: 'short' });
    } else if (lastMessageTime.getFullYear() === now.getFullYear()) {
        // This year - show month and day
        timeString = lastMessageTime.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else {
        // Different year - show month, day, year
        timeString = lastMessageTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
    
    // Create a title if it's just "New Chat"
    let chatTitle = session.title;
    if (chatTitle === 'New Chat' && previewText !== 'Click to view this chat') {
        // Use the first few words of the first message as the title
        const words = previewText.split(' ');
        chatTitle = words.slice(0, 3).join(' ');
        if (words.length > 3) chatTitle += '...';
    }
    
    // Add appropriate icon based on last message role
    let iconClass = 'fa-comment';
    if (messageRole === 'user') {
        iconClass = 'fa-user';
    } else if (messageRole === 'assistant') {
        iconClass = 'fa-robot';
    }
    
    historyItem.innerHTML = `
        <div class="history-icon"><i class="fas ${iconClass}"></i></div>
        <div class="history-content">
            <div class="history-title">${chatTitle}</div>
            <div class="history-preview">${previewText}</div>
            <div class="history-date">${timeString}</div>
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
async function createNewChatSession(isCalledFromSaveMessage = false) {
    try {
        console.log('Creating new chat session');
        
        // Get current user session
        const { data: { session: userSession } } = await window.supabaseClient.auth.getSession();
        
        if (!userSession || !userSession.user) {
            console.error('No user session found when creating chat session');
            // Show a notification to the user
            showNotification('Please sign in to save your chat history', 'info');
            
            // For guest users, just create a temporary chat in the UI without database operations
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
                
                // Add welcome message to UI only (no database save)
                const welcomeMessage = "Hello! I'm Quike, your AI assistant. How can I help you today?";
                addMessageToUI(welcomeMessage, 'assistant');
            }
            
            // Set a temporary session ID for the UI
            window.currentSessionId = 'temp_' + Date.now();
            
            return window.currentSessionId; // Return the temporary ID
        }
        
        const userId = userSession.user.id;
        console.log('Creating chat session for user:', userId);
        
        // Show loading state on the new chat button
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            newChatBtn.disabled = true;
        }
        
        // Generate a timestamp and unique ID for the session
        const now = new Date();
        const timestamp = now.toISOString();
        const sessionUniqueId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
        
        // Create new chat session with user_id
        const { data: session, error } = await window.supabaseClient
            .from('chat_sessions')
            .insert([{ 
                title: 'New Chat', 
                user_id: userId,
                created_at: timestamp,
                updated_at: timestamp
            }])
            .select()
            .single();
            
        if (error) {
            console.error('Error inserting new chat session:', error);
            // Reset new chat button
            if (newChatBtn) {
                newChatBtn.innerHTML = '<i class="fas fa-plus"></i>';
                newChatBtn.disabled = false;
            }
            showNotification('Failed to create new chat: ' + error.message, 'error');
            throw error;
        }
        
        console.log('Successfully created new chat session:', session);
        
        // Check if we need to add a date header
        const historyList = document.querySelector('.history-list');
        
        if (!historyList) {
            console.error('History list not found');
            return session.id;
        }
        
        // Remove no-history message if present
        const noHistoryMsg = historyList.querySelector('.no-history');
        if (noHistoryMsg) {
            noHistoryMsg.remove();
        }
        
        // Check if we need to add a "Today" header
        let todayHeader = historyList.querySelector('.date-header:first-child');
        if (!todayHeader || todayHeader.textContent.trim() !== 'Today') {
            todayHeader = document.createElement('div');
            todayHeader.className = 'date-header';
            todayHeader.innerHTML = '<span>Today</span>';
            historyList.prepend(todayHeader);
        }
        
        // Create and add the new history item
        const historyItem = await createHistoryItem(session);
        
        // Insert after the Today header
        if (todayHeader.nextSibling) {
            historyList.insertBefore(historyItem, todayHeader.nextSibling);
        } else {
            historyList.appendChild(historyItem);
        }
        
        // Set as active session
        document.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
        });
        historyItem.classList.add('active');
        
        // Clear chat messages
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = '';
            
            // Add welcome message with timestamp
            const welcomeMessage = "Hello! I'm Quike, your AI assistant. How can I help you today?";
            addMessageToUI(welcomeMessage, 'assistant');
            
            // Save welcome message to database
            if (!isCalledFromSaveMessage) {
                await saveMessageToDatabase(welcomeMessage, 'assistant', true);
            }
        }
        
        // Store current session ID
        window.currentSessionId = session.id;
        
        // Reset new chat button
        if (newChatBtn) {
            newChatBtn.innerHTML = '<i class="fas fa-plus"></i>';
            newChatBtn.disabled = false;
        }
        
        // Show success notification
        showNotification('New chat created successfully', 'success');
        
        return session.id;
    } catch (error) {
        console.error('Error creating new chat session:', error.message);
        // Reset new chat button
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.innerHTML = '<i class="fas fa-plus"></i>';
            newChatBtn.disabled = false;
        }
        return null;
    }
}

// Function to delete a chat session
async function deleteChatSession(sessionId) {
    // Show the custom confirmation modal instead of using the default confirm dialog
    const modal = document.getElementById('deleteConfirmationModal');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const closeBtn = document.getElementById('closeDeleteModal');
    
    // Show the modal
    modal.classList.add('visible');
    
    // Set up event handlers
    const handleCancel = () => {
        modal.classList.remove('visible');
        // Clean up event listeners
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        closeBtn.removeEventListener('click', handleCancel);
    };
    
    const handleConfirm = async () => {
        // Hide the modal first
        modal.classList.remove('visible');
        
        // Clean up event listeners
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
        closeBtn.removeEventListener('click', handleCancel);
        
        try {
            // Show loading state on the delete button
            const deleteBtn = document.querySelector(`.history-item[data-session-id="${sessionId}"] .delete-chat-btn`);
            if (deleteBtn) {
                const originalContent = deleteBtn.innerHTML;
                deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                deleteBtn.disabled = true;
            }
            
            // Delete the session from the database
            const { error } = await window.supabaseClient
                .from('chat_sessions')
                .delete()
                .eq('id', sessionId);
                
            if (error) throw error;
            
            // Remove from UI
            const historyItem = document.querySelector(`.history-item[data-session-id="${sessionId}"]`);
            if (historyItem) {
                historyItem.style.height = `${historyItem.offsetHeight}px`;
                historyItem.style.overflow = 'hidden';
                
                // Animate removal
                setTimeout(() => {
                    historyItem.style.height = '0';
                    historyItem.style.padding = '0';
                    historyItem.style.margin = '0';
                    historyItem.style.opacity = '0';
                    
                    setTimeout(() => {
                        historyItem.remove();
                        
                        // If this was the active session, clear the chat area
                        if (window.currentSessionId === sessionId) {
                            // Clear the chat messages
                            const chatMessages = document.getElementById('chatMessages');
                            if (chatMessages) {
                                chatMessages.innerHTML = '';
                            }
                            
                            // Reset the current session ID
                            window.currentSessionId = null;
                            
                            // Check if there are any remaining chat sessions
                            const remainingChats = document.querySelectorAll('.history-item');
                            if (remainingChats.length > 0) {
                                // If there are other chats, load the first one
                                const firstChat = remainingChats[0];
                                const firstChatId = firstChat.dataset.sessionId;
                                if (firstChatId) {
                                    loadChatSession(firstChatId);
                                    firstChat.classList.add('active');
                                }
                            } else {
                                // If no chats remain, show empty state in the history panel
                                const historyList = document.querySelector('.history-list');
                                if (historyList) {
                                    historyList.innerHTML = `
                                        <div class="no-history">
                                            <p>No chat history</p>
                                            <button class="new-chat-btn" id="emptyChatNewBtn" style="border-radius: 4px; border: 1px solid rgba(99, 102, 241, 0.3); margin: 10px;">
                                                <i class="fas fa-plus"></i> Start a new chat
                                            </button>
                                        </div>
                                    `;
                                    
                                    // Add event listener to the new chat button
                                    setTimeout(() => {
                                        const emptyChatNewBtn = document.getElementById('emptyChatNewBtn');
                                        if (emptyChatNewBtn) {
                                            emptyChatNewBtn.addEventListener('click', () => {
                                                createNewChatSession();
                                            });
                                        }
                                    }, 0);
                                }
                                
                                // Show a welcome message in the empty chat area
                                const chatMessages = document.getElementById('chatMessages');
                                if (chatMessages) {
                                    chatMessages.innerHTML = `
                                        <div class="empty-chat-message">
                                            <div class="empty-chat-icon">
                                                <i class="fas fa-comments"></i>
                                            </div>
                                            <h3>No active chat</h3>
                                            <p>Start a new chat or select one from the history panel</p>
                                        </div>
                                    `;
                                }
                            }
                        }
                    }, 300);
                }, 10);
            }
            
            // Show success notification
            showNotification('Chat deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting chat session:', error.message);
            showNotification('Error deleting chat: ' + error.message, 'error');
        }
    };
    
    // Add event listeners
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleCancel);
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
async function saveMessageToDatabase(text, role, isWelcomeMessage = false) {
    console.log(`Saving message to database. Role: ${role}, CurrentSessionId: ${window.currentSessionId}, isWelcomeMessage: ${isWelcomeMessage}`);
    
    if (!window.currentSessionId) {
        // Only create a new session if this is not a welcome message (to prevent recursion)
        if (!isWelcomeMessage) {
            console.log('No current session ID found, creating new chat session');
            // Create a new session if none exists
            const sessionId = await createNewChatSession(true); // Pass true to indicate this is being called from saveMessageToDatabase
            if (!sessionId) {
                console.error('Failed to create new chat session');
                return;
            }
            window.currentSessionId = sessionId;
            console.log('Created new session ID:', sessionId);
        } else {
            console.log('Welcome message with no session ID - skipping to prevent recursion');
            return;
        }
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

// Function to show notifications to the user
function showNotification(message, type = 'info') {
    // Create notification container if it doesn't exist
    let notificationContainer = document.getElementById('notificationContainer');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">${message}</div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Add close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('notification-hiding');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('notification-visible');
    }, 10);
}

// Expose functions to be used by the main script
window.supabaseAuth = {
    saveMessageToDatabase,
    createNewChatSession,
    loadChatHistory,
    checkUserSession,
    updateUserProfile,
    checkUserSettings,
    showNotification
};
