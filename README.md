# LearnSpace – AI-Based Learning Management System

**LearnSpace** is a complete, full-stack AI-powered Learning Management System (LMS) designed for university and college students. It combines structured Computer Science coursework, interactive lesson readers, instant-graded online quizzes, real-time Recharts performance analytics, and a 24/7 context-aware **Google Gemini AI Tutor**.

---

## 1. Key Modules & Features

1. **Authentication & Security (`JWT` + `bcrypt`)**
   - Student registration, login, logout, and one-click Demo Student sign-in.
   - Passwords hashed with `bcryptjs` (`10` salt rounds); private APIs protected via Bearer JWT middleware.
2. **Interactive Student Dashboard (`Overview`)**
   - Displays personalized welcome banner, enrolled course count, completed courses, overall learning progress percentage, average quiz score, Recharts bar/area visualizations, active course cards, and recent learning activity feed.
3. **Course Catalogue & Lesson Reader (`My Courses`)**
   - Pre-seeded with 4 university Computer Science courses (**Data Structures & Algorithms**, **Database Management Systems**, **Computer Networks**, and **Artificial Intelligence**) containing 16 full lessons with code examples and exam takeaways.
   - Browse, search, filter by category/enrollment status, enroll with one click, read lessons, and mark lessons as completed.
4. **Google Gemini AI Tutor (`AI Tutor`)**
   - Dedicated backend endpoint (`POST /api/chat`) powered by the official `@google/genai` SDK.
   - Explains technical concepts step-by-step, provides code/SQL examples, generates revision notes, and preserves multi-turn conversation history.
   - Includes a resilient built-in academic tutor fallback if `GEMINI_API_KEY` is not yet configured or temporarily rate-limited.
5. **Online Quiz System (`Quizzes`)**
   - Multi-question multiple-choice assessments (4 options per question) for every seeded course.
   - Question navigation strip, live timer, progress bar, server-side answer evaluation (preventing client-side score tampering), instant score/percentage calculation, and full question-by-question explanation review.
6. **Student Progress & Analytics (`My Progress`)**
   - Subject-wise completion and quiz mastery charts, chronological quiz score trend line, course completion breakdown table, and activity log—all driven by live MongoDB records.
7. **Profile & Application Settings (`Profile` & `Settings`)**
   - Update student name, department, semester, and academic bio.
   - Change password securely and customize AI Tutor explanation style (`step-by-step`, `concise`, `detailed`), weekly study hour goals, and sidebar preferences.

---

## 2. Technology Stack

- **Frontend**: React 18, Vite, React Router v6, Recharts, Lucide Icons, Modern Responsive CSS3
- **Backend**: Node.js, Express.js, RESTful API Architecture
- **Database**: MongoDB Atlas & Mongoose ODM (with automatic embedded MongoDB fallback for zero-config local demos)
- **Artificial Intelligence**: Google Gemini API via official `@google/genai` SDK
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`

---

## 3. Required Software Installation

Ensure the following tools are installed on your machine:
- **Node.js** (v18.0.0 or higher recommended) & **npm** — [Download Node.js](https://nodejs.org/)
- **MongoDB Atlas Account** (or local MongoDB Community Server) — [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** (optional, for version control)

---

## 4. How to Configure MongoDB Atlas

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free **M0 Cluster**.
2. Under **Database Access**, create a database user with username and password.
3. Under **Network Access**, click **Add IP Address** and allow access from your IP (or `0.0.0.0/0` for development).
4. Click **Connect** → **Drivers** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/learnspace?retryWrites=true&w=majority
   ```
5. Paste this URI as `MONGODB_URI` inside `server/.env`.
   *(Note: If a local or Atlas MongoDB server is not reachable, LearnSpace automatically boots an embedded MongoDB instance and seeds all courses so live demonstrations work out-of-the-box.)*

---

## 5. How to Obtain & Configure a Google Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and sign in with your Google account.
2. Click **Create API Key** and copy the generated key.
3. Open `server/.env` (or copy `server/.env.example` to `server/.env`) and set:
   ```env
   PORT=5001
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/learnspace?retryWrites=true&w=majority
   JWT_SECRET=replace_with_a_strong_random_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your_google_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ```
   > **Security Note**: Never place `GEMINI_API_KEY` in the `client/` directory. All AI calls execute strictly on the backend via `POST /api/chat`.

---

## 6. How to Install Dependencies

Open two terminals from the project root directory:

### Backend Dependencies
```bash
cd server
npm install
```

### Frontend Dependencies
```bash
cd client
npm install
```

---

## 7. How to Seed the Database

To populate (or reset) the MongoDB database with the 4 sample courses (**Data Structures**, **Database Management Systems**, **Computer Networks**, **Artificial Intelligence**), 16 lessons, 4 quizzes, and the demo student account:

```bash
cd server
npm run seed
```
*(The backend server also checks on startup and automatically seeds the database if it is empty.)*

---

## 8. How to Start the Backend & Frontend

### Step 1: Start the Backend API Server
```bash
cd server
npm start
```
The Express REST API will start on `http://localhost:5001` (Health check: `GET http://localhost:5001/api/health`).

### Step 2: Start the React + Vite Frontend
In a second terminal:
```bash
cd client
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 9. How to Test the Application

1. **Quick Demo Login**: On the Sign In page (`/login`), click **"Sign In as Demo Student (Twinkal Golhani)"** (Credentials: `student@learnspace.edu` / `Password123!`), or register a brand-new account on `/register`.
2. **Verify Overview Dashboard**: Inspect the KPI cards, Recharts bar/area charts, active course progress bars, and recent activity feed.
3. **Browse & Enroll in Courses**: Open **My Courses** (`/courses`), filter or search from the top bar, and click **Enroll Now** on **Artificial Intelligence (CS-401)**.
4. **Complete a Lesson**: Open any course, click **Open Lesson**, read the structured lecture notes and code snippet, and click **Mark Lesson as Completed**—watch the course completion percentage update immediately.
5. **Ask the AI Tutor**: Navigate to **AI Tutor** (`/ai-tutor`), select a course context, and click a starter prompt or type a custom question to receive a step-by-step response.
6. **Take an Online Quiz**: Navigate to **Quizzes** (`/quizzes`), start any quiz, answer all 5 multiple-choice questions, click **Submit Quiz**, and review your instant score percentage and question explanations.
7. **Update Profile & Settings**: Visit **Profile** (`/profile`) and **Settings** (`/settings`) to update your academic bio, AI explanation style, or password.

