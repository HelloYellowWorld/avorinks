class ChatRoom {
    constructor() {
        this.socket = null;
        this.username = '';
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isOwner = false;
        
        this.initializeElements();
        this.attachEventListeners();
        this.updateUI();
    }
    
    initializeElements() {
        // Input elements
        this.usernameInput = document.getElementById('username-input');
        this.messageInput = document.getElementById('message-input');
        
        // Button elements
        this.joinBtn = document.getElementById('join-btn');
        this.sendBtn = document.getElementById('send-btn');
        this.leaveBtn = document.getElementById('leave-btn');
        
        // Section elements
        this.usernameSection = document.getElementById('username-section');
        this.chatSection = document.getElementById('chat-section');
        
        // Display elements
        this.messagesContainer = document.getElementById('messages');
        this.statusElement = document.getElementById('status');
        this.userCountElement = document.getElementById('user-count');
        this.connectionInfo = document.getElementById('connection-info');
    }
    
    attachEventListeners() {
        // Join chat
        this.joinBtn.addEventListener('click', () => this.joinChat());
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinChat();
        });
        
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Leave chat
        this.leaveBtn.addEventListener('click', () => this.leaveChat());
        
        // Owner authentication - check for special command
        this.messageInput.addEventListener('input', () => {
            if (this.messageInput.value.startsWith('/owner ')) {
                this.messageInput.style.backgroundColor = '#2d1b4d';
                this.messageInput.style.color = '#e6b800';
            } else {
                this.messageInput.style.backgroundColor = '';
                this.messageInput.style.color = '';
            }
        });
        
        // Handle page unload
        window.addEventListener('beforeunload', () => {
            if (this.socket) {
                this.socket.close();
            }
        });
    }
    
    joinChat() {
        const username = this.usernameInput.value.trim();
        
        if (!username) {
            this.showMessage('error', 'Please enter a username');
            this.usernameInput.focus();
            return;
        }
        
        if (username.length > 20) {
            this.showMessage('error', 'Username must be 20 characters or less');
            return;
        }
        
        this.username = username;
        this.connectWebSocket();
    }
    
    connectWebSocket() {
        try {
            // Determine protocol and construct WebSocket URL
            const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            const wsUrl = `${protocol}//${window.location.host}/ws`;
            
            this.showMessage('system', 'Connecting to chat server...');
            
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.updateUI();
                this.showMessage('system', `Connected as ${this.username}`);
            };
            
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };
            
            this.socket.onclose = (event) => {
                console.log('WebSocket disconnected:', event.code, event.reason);
                this.isConnected = false;
                this.updateUI();
                
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.attemptReconnect();
                } else {
                    this.showMessage('system', 'Disconnected from chat server');
                }
            };
            
            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.showMessage('error', 'Connection error occurred');
            };
            
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.showMessage('error', 'Failed to connect to chat server');
        }
    }
    
    attemptReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        this.showMessage('system', `Reconnecting in ${delay/1000} seconds... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.connectWebSocket();
            }
        }, delay);
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'chat':
                this.displayChatMessage(data);
                break;
                
            case 'system':
                this.showMessage('system', data.message);
                break;
                
            case 'error':
                this.showMessage('error', data.message);
                break;
                
            case 'history':
                this.clearMessages();
                data.messages.forEach(msg => this.displayChatMessage(msg));
                break;
                
            case 'owner_status':
                this.isOwner = data.isOwner;
                this.showMessage('system', data.message);
                this.updateOwnerUI();
                break;
                
            case 'owner_data':
                if (data.command === 'ips') {
                    this.displayIPData(data.data);
                }
                break;
                
            default:
                console.warn('Unknown message type:', data.type);
        }
    }
    
    displayChatMessage(data) {
        const messageElement = document.createElement('div');
        messageElement.className = `message chat ${data.isOwner ? 'owner-message' : ''}`;
        
        const timestamp = new Date(data.timestamp).toLocaleTimeString();
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="username ${data.isOwner ? 'owner-badge' : ''}">${this.escapeHtml(data.username)}${data.isOwner ? ' 👑' : ''}</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">${this.escapeHtml(data.content)}</div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    showMessage(type, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        
        if (type === 'system' || type === 'error') {
            messageElement.innerHTML = `
                <div class="message-content">
                    <i class="fas ${type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                    ${this.escapeHtml(message)} 
                    <span class="timestamp">${timestamp}</span>
                </div>
            `;
        }
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
    
    sendMessage() {
        const content = this.messageInput.value.trim();
        
        if (!content) {
            this.messageInput.focus();
            return;
        }
        
        if (!this.isConnected || !this.socket) {
            this.showMessage('error', 'Not connected to chat server');
            return;
        }
        
        // Check for owner authentication command
        if (content.startsWith('/owner ')) {
            const code = content.substring(7).trim();
            const authMessage = {
                type: 'owner_auth',
                code: code
            };
            
            try {
                this.socket.send(JSON.stringify(authMessage));
                this.messageInput.value = '';
                this.messageInput.style.backgroundColor = '';
                this.messageInput.style.color = '';
                this.messageInput.focus();
            } catch (error) {
                console.error('Error sending auth:', error);
                this.showMessage('error', 'Failed to authenticate');
            }
            return;
        }
        
        // Check for owner commands (only if authenticated as owner)
        if (this.isOwner && content.startsWith('/')) {
            if (content === '/ips') {
                const commandMessage = {
                    type: 'owner_command',
                    command: 'ips'
                };
                
                try {
                    this.socket.send(JSON.stringify(commandMessage));
                    this.messageInput.value = '';
                    this.messageInput.focus();
                } catch (error) {
                    console.error('Error sending command:', error);
                    this.showMessage('error', 'Failed to execute command');
                }
                return;
            }
        }
        
        const message = {
            type: 'chat',
            username: this.username,
            content: content
        };
        
        try {
            this.socket.send(JSON.stringify(message));
            this.messageInput.value = '';
            this.messageInput.focus();
        } catch (error) {
            console.error('Error sending message:', error);
            this.showMessage('error', 'Failed to send message');
        }
    }
    
    leaveChat() {
        if (this.socket) {
            this.socket.close(1000, 'User left chat');
        }
        
        this.isConnected = false;
        this.username = '';
        this.usernameInput.value = '';
        this.messageInput.value = '';
        this.clearMessages();
        this.updateUI();
        
        // Show welcome message again
        this.messagesContainer.innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-rocket"></i>
                <h2>Welcome to AvoRinks!</h2>
                <p>Enter your username below and start chatting with others in real-time.</p>
            </div>
        `;
    }
    
    clearMessages() {
        this.messagesContainer.innerHTML = '';
    }
    
    updateUI() {
        if (this.isConnected) {
            // Show chat interface
            this.usernameSection.style.display = 'none';
            this.chatSection.style.display = 'block';
            
            // Update status
            this.statusElement.innerHTML = '<i class="fas fa-circle"></i> Connected';
            this.statusElement.className = 'status online';
            
            // Enable/disable buttons
            this.sendBtn.disabled = false;
            this.messageInput.disabled = false;
            this.messageInput.focus();
            
        } else {
            // Show username interface
            this.usernameSection.style.display = 'block';
            this.chatSection.style.display = 'none';
            
            // Update status
            this.statusElement.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
            this.statusElement.className = 'status offline';
            
            // Enable/disable buttons
            this.joinBtn.disabled = false;
            this.usernameInput.disabled = false;
            this.usernameInput.focus();
        }
        
        // Update connection info
        if (this.isConnected) {
            this.connectionInfo.textContent = ` • Connected as ${this.username}`;
        } else {
            this.connectionInfo.textContent = '';
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    updateOwnerUI() {
        if (this.isOwner) {
            // Add owner indicator to status
            this.statusElement.innerHTML = '<i class="fas fa-crown"></i> Connected as Owner';
            this.statusElement.className = 'status owner';
            
            // Add owner styling to message input
            this.messageInput.placeholder = 'Type a message... (Owner privileges: /ips)';
        }
    }
    
    displayIPData(connections) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message owner-data';
        
        const timestamp = new Date().toLocaleTimeString();
        
        let connectionList = connections.map(conn => 
            `• ${conn.username} - ${conn.ip} (connected ${conn.connectTime})`
        ).join('<br>');
        
        if (connections.length === 0) {
            connectionList = 'No active connections found.';
        }
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="username owner-badge">👑 SYSTEM (Owner Only)</span>
                <span class="timestamp">${timestamp}</span>
            </div>
            <div class="message-content">
                <strong>Active Connections (${connections.length}):</strong><br>
                ${connectionList}
            </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }
}

// Initialize the chatroom when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatRoom();
});

// Health check function for debugging
window.checkHealth = async function() {
    try {
        const response = await fetch('/health');
        const data = await response.json();
        console.log('Server health:', data);
        return data;
    } catch (error) {
        console.error('Health check failed:', error);
        return null;
    }
};

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('boot-screen').style.display = 'none';
    document.querySelector('.container').style.display = 'block';
  }, 4500); // boot duration
});