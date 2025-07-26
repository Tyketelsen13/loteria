🎴 Lotería Online - Capstone Project
Welcome to Lotería Online, a modern, full-stack reimagining of the classic Mexican bingo game. Built as a capstone project for the Springboard Software Engineering Bootcamp, this app brings together real-time multiplayer gameplay, AI opponents, custom-themed decks, and user authentication — all wrapped in a sleek, responsive design.

📌 Features
🔒 User Authentication (JWT-based)

🎮 Real-Time Multiplayer (with Socket.IO)

🤖 AI Opponents for solo play

🎨 Multiple Custom Decks with themed card artwork

🧠 Win Validation with traditional "Lotería!" logic

⏱️ Timed Card Calling or Manual Control

🎲 Board Generator (random, fair 4x4 boards)

🖼️ Image Rendering via custom card API or static fallback

📱 Fully Responsive across desktop and mobile devices

🚀 Tech Stack
🧩 Frontend
Next.js 14 (App Router)

React

Tailwind CSS

Socket.IO Client

🔧 Backend
Node.js

Express

Socket.IO Server

MongoDB Atlas

Mongoose ODM

Cloudinary (for card + avatar hosting)

🖼️ Card API & Themes
Players can choose from several themed card decks:

🎨 Paper Art

🌌 Anime Fantasy

🕷️ Horror

🤖 AI Sci-Fi (WIP)

Each deck contains 54 unique cards and can be selected before starting the game. Card images are served from a custom card API or pre-generated assets using AI image models.

🧪 Installation & Local Dev
1. Clone the repo
bash
Copy
Edit
git clone https://github.com/yourusername/loteria-online.git
cd loteria-online
2. Install dependencies
bash
Copy
Edit
npm install
# or
pnpm install
3. Add environment variables
Create a .env.local file in the root and set:

ini
Copy
Edit
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
CLOUDINARY_URL=your_cloudinary_url
4. Start backend server
bash
Copy
Edit
cd backend
npm install
npm run dev
5. Start frontend app
bash
Copy
Edit
cd ..
npm run dev
App will be available at: https://loteria-frontend-ten.vercel.app/

🎯 Future Features
📱 PWA support for mobile app-like experience

🧠 Smarter AI with difficulty levels

🏆 Leaderboards & player stats

🧑‍🎨 Player-generated decks via AI prompt form

🌐 Language toggle: English / Español

📸 Screenshots
<p align="center"> <img src="https://yourcloudinary.com/loteria-board-preview.png" width="400" alt="Lotería Board Screenshot" /> <img src="https://yourcloudinary.com/loteria-lobby.png" width="400" alt="Lobby Screenshot" /> </p>
📄 License
This project is licensed under the MIT License.

🧑‍💻 Author
Tiace Joseph Ketelsen
Full-Stack Developer | Springboard SWE Grad
GitHub • LinkedIn

