# EduSpace - Educational Social Network Platform

EduSpace is a comprehensive, full-stack educational social networking platform designed to connect students, educators, and peers. It provides real-time communication, community forums, and interactive learning environments.

## 🚀 Tech Stack

### Backend
- **Framework:** Java, Spring Boot 3
- **Security:** Spring Security, JWT (JSON Web Tokens), OAuth2 (Google Login)
- **Real-time Communication:** Spring WebSocket (STOMP)
- **Database:** PostgreSQL
- **ORM:** Hibernate / Spring Data JPA
- **Build Tool:** Maven

### Frontend
- **Framework:** React 18 (Vite)
- **UI Component Library:** Chakra UI
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Real-time Client:** SockJS, StompJS
- **Routing:** React Router DOM

## 📁 Directory Structure

```text
EduSpace/
├── Edu/                    # Backend API (Spring Boot)
│   ├── .mvn/               # Maven wrapper
│   ├── src/                # Backend Source Code
│   │   ├── main/java/com/example/edu/
│   │   │   ├── config/     # App configurations (WebSocket, Cloudinary, etc.)
│   │   │   ├── controller/ # REST APIs & WebSocket message handlers
│   │   │   ├── dto/        # Data Transfer Objects (Requests/Responses)
│   │   │   ├── entity/     # JPA Database Entities
│   │   │   ├── enums/      # Enumerations (Role, Status, MessageType)
│   │   │   ├── repository/ # Spring Data JPA Repositories
│   │   │   ├── security/   # Security filters, JWT logic, OAuth2 services
│   │   │   └── service/    # Business logic implementation
│   │   └── resources/      # application.properties & static files
│   └── pom.xml             # Maven dependencies
│
├── frontend/               # Frontend Application (React + Vite)
│   ├── public/             # Static public assets
│   ├── src/                # Frontend Source Code
│   │   ├── assets/         # Images, global styles
│   │   ├── components/     # Reusable UI components (NavBar, PostCard, etc.)
│   │   ├── contexts/       # React Context providers (AuthContext)
│   │   ├── pages/          # Page views (Auth, Community, Messenger, Profile, etc.)
│   │   ├── services/       # Axios API client integrations
│   │   └── theme/          # Chakra UI custom theme configurations
│   ├── index.html          # HTML entry point
│   ├── package.json        # Node.js dependencies
│   └── vite.config.js      # Vite build configuration
│
├── Dockerfile              # Docker multi-stage build configuration
└── database_init.sql       # Initial database schema and mock data
```

## ✨ Key Features

### 1. Authentication & Security
- **Local Login/Register:** Secure email and password authentication with robust validations.
- **OAuth2 Integration:** Quick "Sign in with Google" support.
- **JWT Protection:** All APIs (except public ones) are secured with token-based authentication.
- **Role-based Access Control:** Distinct roles (e.g., GUEST, ADMIN).

### 2. Real-Time Community Feed
- **Dynamic Posts:** Create, edit, and delete text and media-rich posts.
- **Live Interactions:** Like and comment on posts in real-time.
- **WebSocket Broadcast:** Any interactions on the community feed are instantly broadcasted to all connected users without page reloads.

### 3. Messenger (Real-Time Chat)
- **1-on-1 Conversations:** Instant private messaging between friends.
- **Group Chats:** Support for multi-user chat rooms.
- **Instant Delivery:** Real-time message dispatch and delivery via STOMP/WebSockets.
- **Read/Unread Status & Notifications:** Real-time push notifications for incoming messages.
- **Smart Sidebar:** Searchable conversation history and an integrated friends list for quickly starting new chats.

### 4. Friendship System
- **Friend Requests:** Send, accept, or decline friend requests.
- **Relationship Management:** Unfriend capability and viewing pending/sent requests.

### 5. Interactive UI / UX
- **Responsive Layout:** Optimized for both mobile devices and desktop screens.
- **Dark/Light Mode:** Full support for theming and color mode toggling.
- **Smooth Animations:** Integrated with Framer Motion for premium user interactions.

## 🛠️ Local Development Setup

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL Server (v14+)

### Backend Setup
1. Create a PostgreSQL database named `eduspace`, then execute the `database_init.sql` script to create the schema and seed data (if applicable).
2. Update the `Edu/src/main/resources/application.properties` with your database credentials and secret keys.
3. Navigate to the `Edu` folder:
   ```bash
   cd Edu
   ./mvnw spring-boot:run
   ```
   The backend will start on `http://localhost:8080`.

### Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (create a `.env` file based on `.env.example`).
   ```env
   VITE_API_BASE_URL=http://localhost:8080
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## 🚢 Deployment

The project includes a `Dockerfile` that sets up a multi-stage build to compile the Java backend. 
- Ensure that the frontend build is integrated into the Spring Boot static resources, or deploy them separately (e.g., Backend on Render/Railway, Frontend on Vercel/Netlify).

## 📄 License
This project is for educational purposes.
