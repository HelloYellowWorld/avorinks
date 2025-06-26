# AvoRinks - Real-time Chat Application

## Overview

AvoRinks is a real-time chatroom application built with Node.js, Express, and WebSocket technology. The application provides a simple web-based interface for users to join chat rooms and communicate in real-time with other connected users.

## System Architecture

The application follows a client-server architecture with real-time bidirectional communication:

- **Backend**: Node.js server using Express for HTTP requests and WebSocket Server (ws) for real-time communication
- **Frontend**: Vanilla HTML, CSS, and JavaScript with modern ES6+ features
- **Communication**: WebSocket protocol for real-time messaging between clients and server
- **Deployment**: Configured for Replit environment with automatic port management

## Key Components

### Backend Components

1. **Express Server** (`server.js`)
   - Serves static files from the `public` directory
   - Handles HTTP requests for the web interface
   - Creates HTTP server instance for WebSocket integration

2. **WebSocket Server**
   - Manages real-time connections on `/ws` path
   - Handles client connections, message broadcasting, and disconnections
   - Maintains chat history (up to 100 messages)
   - Tracks connected clients and provides user count

3. **Message Management**
   - Stores chat history in memory
   - Validates and sanitizes user input (username: 20 chars, messages: 500 chars)
   - Broadcasts messages to all connected clients

4. **Owner Authentication System**
   - Special code recognition for admin privileges (default: 'avomaster123')
   - Owner messages display with crown icon and golden styling
   - Owner-only commands for server management and monitoring

5. **IP Address Tracking**
   - Logs all user connections with IP addresses and timestamps
   - Stores connection data in `ip_logs.txt` for security monitoring
   - Owner-accessible endpoint at `/admin/ips?code=<owner_code>`
   - In-chat IP viewing with `/ips` command (owner only)

### Frontend Components

1. **Chat Interface** (`public/index.html`)
   - Responsive design with modern UI elements
   - Username input section and chat message interface
   - Status indicators for connection state and user count
   - Font Awesome icons for enhanced UX

2. **Chat Client** (`public/script.js`)
   - ES6 class-based architecture (`ChatRoom` class)
   - WebSocket connection management with auto-reconnection
   - Message handling and DOM manipulation
   - Real-time UI updates for connection status

3. **Styling** (`public/style.css`)
   - Modern gradient background design
   - Responsive layout with flexbox
   - Status indicators and message styling
   - Mobile-friendly interface

## Data Flow

1. **User Connection**:
   - User loads the webpage → Static files served by Express
   - User enters username → WebSocket connection established
   - Server sends chat history and welcome message to new client

2. **Message Broadcasting**:
   - User types message → Sent via WebSocket to server
   - Server validates and stores message → Broadcasts to all connected clients
   - All clients receive message → DOM updated in real-time

3. **Connection Management**:
   - Server tracks active connections in a Set
   - Clients attempt auto-reconnection on disconnect
   - User count updated and broadcast to all clients

## External Dependencies

### Runtime Dependencies
- **express** (^5.1.0): Web framework for serving static files and creating HTTP server
- **ws** (^8.18.2): WebSocket library for real-time communication

### Frontend Dependencies
- **Font Awesome 6.0.0**: Icon library loaded via CDN for UI enhancement

## Deployment Strategy

The application is configured for Replit deployment:

- **Environment**: Node.js 20 runtime
- **Workflow**: Automated startup with `npm install express ws && node server.js`
- **Port Configuration**: 
  - Internal port 5000 for WebSocket server
  - External port 80 mapping to internal port 3000
- **Process Management**: Parallel workflow execution for seamless deployment

The server automatically handles both HTTP requests for static file serving and WebSocket connections for real-time messaging on the same port, avoiding port conflicts.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- June 26, 2025: Initial AvoRinks chatroom setup
- June 26, 2025: Successfully deployed to Render at free hosting
- June 26, 2025: Configured ping bot service for 24/7 uptime
- June 26, 2025: Fixed port configuration for Render deployment (port 10000)
- June 26, 2025: Added deployment files (render.yaml, railway.json, Procfile)
- June 26, 2025: Implemented owner authentication system with code recognition
- June 26, 2025: Added IP address tracking for security monitoring

## Changelog

Changelog:
- June 26, 2025. Initial setup and successful deployment to Render