# ReqTrace Installation Guide

Complete step-by-step instructions for setting up ReqTrace locally.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Neo4j Database Setup](#neo4j-database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

#### 1. Python 3.11 or higher
- **Windows:** Download from [python.org](https://python.org/downloads/)
  - ⚠️ **Important:** Check "Add Python to PATH" during installation
- **macOS:** `brew install python@3.11` or download from python.org
- **Linux:** `sudo apt install python3.11 python3.11-venv python3-pip`

Verify installation:
```bash
python --version  # or python3 --version
```

#### 2. Node.js v16+ and npm
- Download from [nodejs.org](https://nodejs.org/) (LTS version recommended)
- Verify installation:
```bash
node --version
npm --version
```

#### 3. Git
- **Windows:** Download from [git-scm.com](https://git-scm.com/)
- **macOS:** `brew install git` or use Xcode Command Line Tools
- **Linux:** `sudo apt install git`

#### 4. Neo4j Database
- Download Neo4j Desktop from [neo4j.com/download](https://neo4j.com/download/)
- Install and launch Neo4j Desktop
- Create a new project and database (instructions below)

#### 5. FFmpeg (Optional - for audio upload features)
FFmpeg is only required if you want to use audio file upload and transcription features. You can skip this and use manual text input instead.

- **macOS:** `brew install ffmpeg`
- **Windows:** 
  1. Download from [gyan.dev/ffmpeg/builds](https://www.gyan.dev/ffmpeg/builds/)
  2. Download "ffmpeg-release-essentials.zip"
  3. Extract to `D:\ffmpeg\` (or any location)
  4. Add `D:\ffmpeg\bin` to System PATH
- **Linux:** `sudo apt install ffmpeg`

Verify (if installed):
```bash
ffmpeg -version
```

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/adityadeshpande09/Req-Trace.git
cd Req-Trace
```

---

## Backend Setup

### 2. Navigate to Backend Directory

```bash
cd backend
```

### 3. Create Python Virtual Environment

**Windows (PowerShell):**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv .venv
.venv\Scripts\activate.bat
```

**macOS/Linux or Git Bash:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

**Git Bash on Windows:**
```bash
python -m venv .venv
source .venv/Scripts/activate
```

You should see `(.venv)` at the start of your terminal prompt.

### 4. Upgrade pip

```bash
python -m pip install --upgrade pip
```

### 5. Install Python Dependencies

```bash
pip install -r requirements.txt
```

⏳ This takes 5-10 minutes. Wait for completion.

### 6. Install Missing Dependencies (if needed)

If `spacy` or other packages are missing from requirements.txt, install them manually:

```bash
# Install spacy and related packages
pip install spacy coreferee spacy-transformers

# Install other potentially missing packages
pip install python-multipart aiofiles python-jose[cryptography] passlib[bcrypt]
```

### 7. Download Spacy NLP Models

```bash
# Download small English model
python -m spacy download en_core_web_sm

# Install coreferee for coreference resolution
python -m coreferee install en

# Download large English model for better accuracy
pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_lg-3.4.1/en_core_web_lg-3.4.1-py3-none-any.whl
```

### 8. Install SSL Certificates (macOS only)

**On macOS:**
```bash
/Applications/Python\ 3.11/Install\ Certificates.command
```
(Adjust Python version number if different)

---

## Neo4j Database Setup

### 9. Set Up Neo4j Database

1. Open Neo4j Desktop
2. Click "New" → "Create Project"
3. Name your project (e.g., "ReqTrace")
4. Click "Add" → "Local DBMS"
5. Set DBMS name (e.g., "reqtrace-db")
6. Set password (remember this!)
7. Select Neo4j version (4.4+ recommended)
8. Click "Create"
9. Click "Start" to start the database
10. Wait until status shows "Active"

**Important:** Keep Neo4j running while using ReqTrace.

---

## Environment Configuration

### 10. Create Backend Environment File

In the `backend` directory, create a `.env` file:

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**macOS/Linux/Git Bash:**
```bash
touch .env
```

### 11. Configure Backend Environment Variables

Open `backend/.env` in your text editor and add:

```env
# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Neo4j Database Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_neo4j_password_here

# Google OAuth (optional for now, use placeholder)
GOOGLE_CLIENT_ID=placeholder
GOOGLE_CLIENT_SECRET=placeholder

# Application Secret Key
SECRET_KEY=your_random_secret_key_here
```

**Required Configurations:**
- `OPENAI_API_KEY`: Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- `NEO4J_PASSWORD`: The password you set when creating the Neo4j database
- `SECRET_KEY`: Any random string (e.g., `mysecretkey12345`)

**Optional (can use placeholders for initial setup):**
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Get from [Google Cloud Console](https://console.cloud.google.com/)

---

## Frontend Setup

### 12. Open New Terminal

Keep the backend terminal open. Open a **new terminal window** for the frontend.

### 13. Navigate to Frontend Directory

```bash
cd Req-Trace/frontend
```

### 14. Install Node Dependencies

```bash
npm install
```

⏳ This takes 5-10 minutes. Wait for completion.

### 15. Create Frontend Environment File

**Windows (PowerShell):**
```powershell
New-Item -Path .env -ItemType File
```

**macOS/Linux/Git Bash:**
```bash
touch .env
```

### 16. Configure Frontend Environment Variables

Open `frontend/.env` and add:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=placeholder
```

---

## Running the Application

### 17. Start Backend Server

In the **backend terminal** (with virtual environment activated):

**If main.py is in the backend root:**
```bash
uvicorn main:app --reload
```

**If main.py is in backend/app folder:**
```bash
cd app
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Keep this terminal running!**

### 18. Start Frontend Server

In the **frontend terminal**:

```bash
npm run dev
```

You should see:
```
VITE v4.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Keep this terminal running!**

---

## Verification

### 19. Test the Application

Open your web browser and navigate to:

1. **Backend API Documentation:** http://localhost:8000/docs
   - You should see FastAPI's interactive API documentation (Swagger UI)
   - Test endpoints to ensure backend is working

2. **Frontend Application:** http://localhost:5173
   - You should see the ReqTrace login/dashboard page
   - UI should load without errors

3. **Neo4j Browser:** http://localhost:7474
   - Verify database connection with your credentials
   - Should show empty database (ready for data)

---

## Troubleshooting

### Common Issues

#### Port Already in Use
If you see "Address already in use" error:

**Backend (port 8000):**
```bash
# Use different port
uvicorn main:app --reload --port 8001
```

**Frontend (port 5173):**
```bash
# Use different port
npm run dev -- --port 5174
```

#### Virtual Environment Activation Issues (Windows PowerShell)
If you get execution policy error:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### FFmpeg Not Found
- If you skipped FFmpeg installation, audio upload features won't work
- You can still use the application with manual text input
- Install FFmpeg later if needed

#### Spacy Module Not Found
Install spacy manually:
```bash
pip install spacy
python -m spacy download en_core_web_sm
```

#### Neo4j Connection Failed
- Verify Neo4j database is started (green indicator in Neo4j Desktop)
- Check NEO4J_PASSWORD in .env matches your database password
- Ensure NEO4J_URI is `bolt://localhost:7687`

#### Module Import Errors
Ensure all dependencies are installed:
```bash
# Reinstall requirements
pip install -r requirements.txt

# Install any missing packages
pip install <package_name>
```

#### Frontend Build Errors
Clear npm cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Development Tips

### Working with Multiple Terminals

**VS Code:**
- Use split terminal view (click split icon in terminal panel)
- Or use terminal dropdown to switch between terminals

**Terminal Management:**
- Terminal 1: Backend server (stays running)
- Terminal 2: Frontend server (stays running)
- Terminal 3: Run commands, git operations, etc.

### Stopping Servers

To stop either server:
- Press `Ctrl + C` in the respective terminal

### Deactivating Virtual Environment

When done working:
```bash
deactivate
```

### Updating Dependencies

If you add new packages:

**Backend:**
```bash
pip install <new-package>
pip freeze > requirements.txt
```

**Frontend:**
```bash
npm install <new-package>
```

---

## Next Steps

After successful installation:

1. Check out [USAGE.md](./USAGE.md) for how to use ReqTrace
2. Review [USE_CASES.md](./USE_CASES.md) for examples
3. Explore the API at http://localhost:8000/docs
4. Start creating requirement knowledge graphs!

---

## Getting Help

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review error messages carefully
3. Check that all prerequisites are installed correctly
4. Verify Neo4j database is running
5. Ensure .env files are configured correctly
6. Open an issue on GitHub with detailed error information

---

## System Requirements

**Minimum:**
- CPU: Dual-core processor
- RAM: 8GB
- Disk: 5GB free space
- OS: Windows 10+, macOS 10.15+, or modern Linux

**Recommended:**
- CPU: Quad-core processor
- RAM: 16GB
- Disk: 10GB free space
- SSD for better performance