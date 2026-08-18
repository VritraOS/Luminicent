# 🐳 Luminicent Docker Integration & Deployment Guide

Luminicent is an interactive DevOps Deployment Simulator that ingests user application repositories (uploaded via `.zip` file or GitHub repo link), automatically detects or builds Dockerfiles, runs simulation containers, monitors real-time metrics, and produces production readiness reports.

---

## 🚀 Running Luminicent with Docker Compose

To containerize and launch the entire Luminicent application stack (Frontend UI + Backend API + Docker Orchestrator):

### Prerequisites
1. **Docker Desktop** installed and running on your host machine.
2. Node.js (v18+) if running outside containers.

### Quick Start Command
Run from the root directory of the project:

```bash
docker compose up --build
```

Access the applications:
- **Frontend Dashboard**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## ⚙️ Architecture & Docker Socket Mounting

```
+-----------------------------------------------------------------------+
| HOST MACHINE (Docker Engine running)                                  |
|                                                                       |
|   +--------------------------+     +-------------------------------+  |
|   | luminicent-frontend      |     | luminicent-backend            |  |
|   | (Nginx on Port 5173)     |---->| (Express/Socket.IO Port 5000)|  |
|   +--------------------------+     +---------------+---------------+  |
|                                                    |                  |
|                                      Mounts Docker | Socket           |
|                                      /var/run/docker.sock             |
|                                                    v                  |
|   +----------------------------------------------------------------+  |
|   | Host Docker Daemon (builds & runs uploaded user containers)    |  |
|   |  => devops-sim-172391234 (User Project Simulation Container)   |  |
|   +----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

---

## 🧪 Production Challenge Testing Workflow

When a user uploads a project `.zip` or connects a GitHub repo:

1. **Extraction & Context Discovery**:
   - Luminicent extracts the project into `uploads/<sessionId>`.
   - Locates target code (`package.json`, `requirements.txt`, etc.).

2. **Dockerfile Resolution (`dockerfileHelper.js`)**:
   - If user project has an existing `Dockerfile`, Luminicent uses it directly to test production specs.
   - If missing, Luminicent generates an optimized multi-stage `Dockerfile` based on project stack (Node, React, Express, Python, Flask).

3. **Container Building & Real-Time Log Streaming (`dockerOrchestrator.js`)**:
   - Builds image using host Docker Engine.
   - Streams build logs real-time to frontend over Socket.IO.
   - Starts container with CPU (`512` shares) and Memory (`512MB`) constraints.
   - Streams live container performance metrics (CPU %, Memory %, Network I/O).

4. **Production Readiness Analysis (`productionAnalyzer.js`)**:
   Evaluates production challenges:
   - 🔒 **Security**: Non-root `USER` instruction, secret/API key leaks in code.
   - 🩺 **Reliability**: `HEALTHCHECK` instructions, `.env` file handling.
   - ⚡ **Build Efficiency**: `.dockerignore` (`node_modules` exclusion), multi-stage builds, pin version tags (avoiding `:latest`), `npm ci` vs `npm install`.
   - 📦 **Image Size**: Alerts if image size exceeds `700 MB`.

---

## 🛠️ Local Development Without Docker Compose

If you want to run the project locally without containers:

1. Start Backend:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. Start Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
