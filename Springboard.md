Orignal Project ideas: COD Stats Tracker, Ghost Encyclopedia, Loteria online app.

📄 Final Project Proposal – Lotería Online
Student: Tiace Joseph Ketelsen
Bootcamp: Springboard Software Engineering Career Track
Project Title: Lotería Online (Mexican Bingo Game)

1. Project Overview
Lotería Online is a full-stack web application that brings the traditional Mexican bingo game, Lotería, to the browser. The goal is to allow users to play the game either solo against an AI or with others in a multiplayer lobby. Users will be able to choose themed decks, get randomized boards, and interact in real time with the game logic, including card calling and win validation.

This project demonstrates my skills in authentication, full-stack development, real-time communication (via Socket.IO), and dynamic front-end rendering.

2. Problem Statement
While there are digital versions of Lotería, most are limited in functionality, lack multiplayer support, or aren’t mobile-friendly. My project aims to:

Make Lotería accessible on desktop and mobile devices

Support both solo play (vs. AI) and future multiplayer capabilities

Let users experience the game with modern visuals, deck customization, and smooth gameplay

3. Scope of the Project
What will be included:
User registration and login (JWT-based auth)

Solo game mode vs. AI opponent

4x4 randomized boards for each player

Manual or timed card calling

Lotería button to declare a win (with win validation)

Multiple themed card decks (Traditional, Anime, Paper Art, etc.)

Real-time updates using Socket.IO

Responsive design

Real-time multiplayer between human users (may be added later)

What will NOT be included (for MVP):

Full leaderboard or player stats

In-game chat

4. Technologies to Be Used
Area	Tools/Tech Stack
Frontend	Next.js 14 (App Router), React, Tailwind CSS
Backend	Node.js, Express.js, Socket.IO
Database	MongoDB Atlas, Mongoose
Auth	JSON Web Tokens (JWT)
Hosting	Vercel (frontend), Railway (backend)
Images	Cloudinary (card + avatar hosting)

5. APIs and Data
Cards will be fetched from a custom backend endpoint or pre-seeded in MongoDB

Decks will be pre-defined with images hosted via Cloudinary

No third-party public API usage is planned

Real-time gameplay will be handled via WebSocket events using Socket.IO

6. Planned Features and Timeline
Week	Goals
Week 1	Finalize proposal, wireframes, and models. Set up backend & MongoDB.
Week 2	Build out user auth, lobby system, and board generator.
Week 3	Implement real-time gameplay with Socket.IO, AI logic, and card calling.
Week 4	Add deck selection, polish UI, fix bugs, write documentation, and deploy.

7. Wireframes and Component Planning
Lobby screen: Create/join game

Game board: 4x4 grid, called cards section, Lotería button

Components: Board, Card, Timer, WinModal, Header, DeckSelector

(Optional: attach wireframes in submission repo if available)

8. Success Criteria
The project will be considered successful if:

A user can register, login, and play a solo game to completion

Each game board is randomized and matches the standard 4x4 layout

Cards are called without repeats and display their image

Clicking “Lotería!” successfully checks for a valid win

The site works responsively on desktop.

9. Stretch Goals (if time permits)
Add multiplayer with rooms/lobbies

Improve AI difficulty

Leaderboard tracking

User-generated decks

Frontend Planning:
Technology Stack Decisions:
Next.js 14 with App Router for modern React development
TypeScript for type safety and better development experience
Tailwind CSS for utility-first styling and rapid development
Vercel for frontend deployment and edge functions
State Management Strategy:
React Context API for global game state
Socket.IO client for real-time multiplayer synchronization
Local state for component-specific UI states
NextAuth for authentication state management
Responsive Design Planning:
Mobile-first approach with Tailwind breakpoints
iOS-specific optimizations (viewport handling, touch targets)
Dark mode support throughout the application
Cross-browser compatibility focus

DataBase Planning Model:
Users: username, email, passwordHash, gameStats

Games: players, boardState, currentCard, calledCards, status

Cards: name, imageUrl, deck

API Planning: 
Real-time API Planning (Socket.IO):
Image Services:
Cloudinary API - Image storage and optimization
ImagineArt API - AI-generated custom cards
Database:
MongoDB Atlas API - Database operations
Connection pooling for performance
