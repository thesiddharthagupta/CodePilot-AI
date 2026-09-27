# Production Deployment Guide

## 1. Docker Deployment (Recommended)

Build and run using Docker Compose:

```bash
docker-compose up -d --build
```

The container handles multi-stage compilation:
- **Stage 1**: Builds Vite + React assets into `client/dist`.
- **Stage 2**: Launches the lightweight Node.js Alpine runtime with SQLite database persistence under `/app/data`.

Access at `http://localhost:4000`.

---

## 2. Bare-Metal / VPS Deployment (Ubuntu/Debian)

1. **Install Node.js 20+ and build essentials**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs build-essential python3
   ```

2. **Clone and Install**:
   ```bash
   git clone <repo-url> /opt/collabcode
   cd /opt/collabcode
   npm install
   npm --prefix client install
   npm run build
   ```

3. **Configure Systemd Service**:
   Create `/etc/systemd/system/collabcode.service`:
   ```ini
   [Unit]
   Description=CollabCode Online IDE Platform
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/opt/collabcode
   ExecStart=/usr/bin/npm start
   Restart=always
   Environment=NODE_ENV=production
   Environment=PORT=4000
   Environment=JWT_SECRET=your_production_secret_key_here

   [Install]
   WantedBy=multi-user.target
   ```

4. **Enable & Start**:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable collabcode
   sudo systemctl start collabcode
   ```

5. **Configure NGINX Reverse Proxy**:
   ```nginx
   server {
       server_name ide.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:4000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
