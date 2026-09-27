# Local Developer Setup Guide

## System Requirements
- Node.js 18.0.0 or newer
- npm 9.0.0 or newer
- Python 3.9+ (optional for local Python runner fallback)

## Step-by-Step Setup

1. **Install Root and Client Dependencies**:
   ```bash
   npm install
   npm --prefix client install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Run in Development Mode**:
   Starts both server (with watch mode on port 4000) and client (Vite dev server on port 5173 with proxying):
   ```bash
   npm run dev
   ```

4. **Verify in Browser**:
   Open [http://localhost:5173](http://localhost:5173).

5. **Run Test Suite**:
   ```bash
   npm test
   ```
