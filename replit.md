# Talkora — Language as a Way of Life

## Project Overview
Talkora is an immersive language learning web app featuring a 3D interactive background (Three.js), an AI chatbot assistant (Anthropic/Claude), and three built-in mini-games (Type Racer, Word Flash, Glyph Match).

## Tech Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **3D Graphics:** Three.js v128 via CDN
- **AI Chatbot:** Anthropic API (Claude 3.5 Sonnet)
- **Server:** Node.js HTTP server (server.js)

## Project Structure
- `index.html` — Main entry point
- `main.js` — Core application logic (Three.js scene, chatbot, games engine)
- `style.css` — All styles and animations
- `talkora.html` — Self-contained single-file version
- `server.js` — Simple static file server for Replit

## Running the App
The app is served via a Node.js HTTP server on port 5000 (`node server.js`).

## Architecture Notes
- No build tools or bundlers — pure static site served by a minimal HTTP server
- Three.js loaded via CDN (no npm packages needed)
- Anthropic API key required for the chatbot feature (ANTHROPIC_API_KEY environment variable)
- Supports 8 languages: Spanish, French, Japanese, Arabic, German, Italian, Chinese, Greek

## Deployment
- Target: autoscale
- Run command: `node server.js`
