# 🔧 Tools Issue Management System (IMS)

A high-fidelity, full-stack digital solution for workshop toolrooms, designed to streamline inventory tracking, simplify mechanic authorization, and automate tool issuances and returns. 

---

## 🌐 Live Deployments

*   **Frontend (Vite + React Client)**: Deployed on Vercel ➔ **[https://tools-issue-management-system.vercel.app/](https://tools-issue-management-system.vercel.app/)**
*   **Backend API (Express + MongoDB)**: Deployed on Render ➔ **[https://tools-issue-management-system-fkgd.onrender.com](https://tools-issue-management-system-fkgd.onrender.com)**

---

## ✨ Key Features

### 👨‍🔧 Mechanic Portal
*   **Secure Registration**: Form validation requiring unique emails, exactly 10-digit mobile numbers, and alphanumeric passwords with special characters. Support for Base64 picture uploads and custom experience levels (*Expert, Medium, New Recruit, Trainee*).
*   **Available Inventory**: Clean, responsive grid display showing category-filtered tools, real-time available quantities, and interactive issue trigger buttons.
*   **Tool Issue & Return**: Increments/decrements stock numbers automatically, locking down issues if a tool goes out of stock. Features a dedicated "Currently Issued Tools" view for instant restock returns.
*   **Transaction Registry**: Personal audit logger detailing the user's completed lifecycles (Issue date ➔ Return date).

### 🛠️ Administrator Panel
*   **Real-time Statistics Overview**: High-end statistics cards showcasing total unique tool categories, physical store stock count, and active issued items in circulation.
*   **Inventory Restocking**: Advanced uploader interface allowing admins to add new tools with custom titles, categories (*Screwdriver, Wrench, Plier, Hammer, Saw, Drill, Other*), stock quantities, and visual reference photos.
*   **Global Issue Register (Audit Log)**: Full chronological transaction ledger tracking mechanic contact data, experience level, tool details, exact timestamps, and green/red status indicators.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Libraries |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | `react-router-dom`, Modular CSS Stylesheets, HMR, HTML5 FileReader |
| **Backend** | Node.js (Express) | `mongoose` ODM, `jsonwebtoken` (JWT), `bcryptjs`, `cors`, `dotenv` |
| **Database** | MongoDB | MongoDB Atlas (Hosted Cluster) |
| **Hosting** | Vercel (UI) & Render (API) | Custom deployment workflows |

---

## 📂 Architecture and Directory Structure

The project has been split into two isolated, highly structured folders:

```
Tools Issue Management System/
├── backend/                  # Isolated Express.js & MongoDB Server
│   ├── .env                  # PORT, MONGODB_URI, and JWT_SECRET settings
│   ├── package.json          # Node server descriptor & dependencies
│   ├── server.js             # Express bootstrap, Mongoose connection, & Admin seed
│   ├── models.js             # Mongoose schemas (User, Tool, IssueRecord)
│   └── routes.js             # JWT auth middleware and API endpoint routes
│
└── frontend/                 # Isolated Vite + React Frontend
    ├── package.json          # React descriptor & dependencies
    ├── vite.config.js        # Vite compiler parameters
    ├── index.html            # Main HTML driver page
    └── src/
        ├── main.jsx          # App wrapper (BrowserRouter setup)
        ├── App.jsx           # Routing architecture and views mapping
        ├── config.js         # Centralized API configuration (Render base url)
        ├── index.css         # Global root layout styles & dark theme variables
        ├── components/
        │   ├── Header.jsx    # Sticky navigation with profile slots (Header.css)
        │   └── Footer.jsx    # Minimalist branding footer (Footer.css)
        └── pages/
            ├── Home.jsx      # Landing page detailing features (Home.css)
            ├── Login.jsx     # Floating key badge credentials entry (Login.css)
            ├── Signup.jsx    # Mechanic registration with live checkers (Signup.css)
            ├── MechanicDashboard.jsx # Tools issuing & returning grids (MechanicDashboard.css)
            └── AdminDashboard.jsx    # Inventory restocking & Issue Register (AdminDashboard.css)
```

---

## 🔑 Default Seeded Admin Credentials

For quick evaluation of the administrator role, the backend automatically seeds a default manager account upon startup:
*   **Email**: `admin@toolroom.com`
*   **Password**: `Admin@12345`
*   *Note: All data entered in Vercel is safely processed, stored, and retrieved in real-time from your live Atlas Database.*

---

## 🚀 Running the Project Locally

### 1. Prerequisites
*   Node.js installed on your computer.
*   MongoDB installed and running locally, OR access to a custom MongoDB Atlas cluster.

### 2. Launch Backend API
1.  Navigate to the `/backend` directory.
2.  Configure your database connection in `backend/.env` (already contains your live Atlas credentials).
3.  Install dependencies and start:
    ```bash
    cd backend
    npm install
    npm start
    ```
    *The API will start running on `http://localhost:5000`.*

### 3. Launch Frontend Client
1.  Navigate to the `/frontend` directory.
2.  Install dependencies and start:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *Open `http://localhost:5173` in your browser to view.*
