# VPS Deployment - Simplest Solution!

**Concept:** Get a virtual server (like your own computer in the cloud), install everything, run the same commands you run locally.

**Result:** Public IP address you can share with anyone!

---

## 🏆 Best FREE VPS Options

### **Option 1: Oracle Cloud Free Tier (RECOMMENDED)**

**Why it's PERFECT for you:**
- ✅ **FREE FOREVER** (not a trial!)
- ✅ No credit card required for free tier
- ✅ 24GB RAM total (enough for all your services!)
- ✅ 200GB storage
- ✅ Public IP included
- ✅ Ubuntu/Windows available
- ✅ Always-on (no sleeping!)

**What you get FREE forever:**
- 2 AMD VMs (1GB RAM each) OR
- 4 ARM VMs (24GB RAM total!) ← **Use this!**
- 200 GB total storage
- 10 TB bandwidth/month
- Public IPv4 address

**Perfect for:** Running your entire app exactly like localhost!

---

### **Option 2: Google Cloud Platform (GCP)**

**Free Tier:**
- $300 credit for 90 days (trial)
- After trial: e2-micro instance free forever (0.25 GB RAM)
- Requires credit card

**Good for:** Testing, but too limited for your app long-term

---

### **Option 3: DigitalOcean**

**Free Tier:**
- $200 credit for 60 days
- After that: $4-6/month
- Requires credit card

**Good for:** If willing to pay after trial

---

## 🎯 RECOMMENDED: Oracle Cloud Free Tier

**Let's use Oracle Cloud because:**
1. ✅ Actually free forever
2. ✅ Enough resources (24GB RAM!)
3. ✅ Simple - just like your local computer
4. ✅ No credit card needed
5. ✅ Public IP included

---

## 🚀 Oracle Cloud Setup (30 minutes)

### **Phase 1: Create Account (5 minutes)**

**Step 1:** Go to https://www.oracle.com/cloud/free/

**Step 2:** Click "Start for free"

**Step 3:** Fill in:
- Email address
- Country (select your country)
- Click "Verify my email"

**Step 4:** Check email and verify

**Step 5:** Fill in account details:
- Name, password
- Home region (choose closest to you)
- **Account Type:** Personal Use (no credit card needed!)

**Step 6:** Verify phone number

✅ **Account created!**

---

### **Phase 2: Create VM Instance (10 minutes)**

**Step 1:** In Oracle Cloud Console, go to:
- Hamburger menu (☰) → **Compute** → **Instances**

**Step 2:** Click "Create Instance"

**Step 3:** Configure VM:

| Setting | Value |
|---------|-------|
| **Name** | `multilingual-chat-server` |
| **Image** | Ubuntu 22.04 |
| **Shape** | Ampere (ARM) - VM.Standard.A1.Flex |
| **OCPU** | 2 |
| **Memory (GB)** | 12 GB (you can use up to 24GB free!) |
| **Boot Volume** | 100 GB |

**Step 4:** Networking
- ✅ Use default VCN
- ✅ Assign public IP (should be checked)

**Step 5:** Add SSH Keys
- Click "Generate SSH key pair"
- **Download private key** (save it somewhere safe!)
- **Download public key** (optional)

**Step 6:** Click "Create"

⏳ Wait 2-3 minutes for VM to provision...

✅ **VM Created!**

**Copy the Public IP address** - looks like: `123.456.78.90`

---

### **Phase 3: Configure Firewall (5 minutes)**

**Step 1:** In your instance details, click your **Subnet** link

**Step 2:** Click **Default Security List**

**Step 3:** Click "Add Ingress Rules"

Add these rules (click "Add" for each):

**Rule 1: HTTP**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `80`

**Rule 2: HTTPS**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `443`

**Rule 3: Frontend**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `5173`

**Rule 4: Backend**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `3001`

**Rule 5: All Services**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `3001-3005`

✅ **Firewall configured!**

---

### **Phase 4: Connect to VM (3 minutes)**

**On Windows, use PuTTY or WSL:**

**Option A: Using WSL/Git Bash**
```bash
# Save your private key as oracle-key.pem
chmod 400 oracle-key.pem
ssh -i oracle-key.pem ubuntu@YOUR_PUBLIC_IP
```

**Option B: Using PuTTY**
1. Download PuTTY
2. Convert private key using PuTTYgen
3. Connect to your IP

✅ **You're connected to your server!**

---

### **Phase 5: Setup Server (10 minutes)**

Now you're on your Ubuntu server. Run these commands:

**Step 1: Update system**
```bash
sudo apt update && sudo apt upgrade -y
```

**Step 2: Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v20.x
```

**Step 3: Install Python & pip**
```bash
sudo apt install -y python3 python3-pip python3-venv
python3 --version
```

**Step 4: Install Git**
```bash
sudo apt install -y git
```

**Step 5: Clone your repository**
```bash
git clone https://github.com/Koshai/MultiLingualChat.git
cd MultiLingualChat
git checkout feature/tunneling-alternatives
```

**Step 6: Install dependencies**

Backend (Chat Service):
```bash
cd backend/services/chat-service
npm install
cd ../../..
```

Frontend:
```bash
cd frontend
npm install
cd ..
```

Translation Service:
```bash
cd backend/services/translation-service
pip3 install -r requirements.txt
cd ../../..
```

STT Service:
```bash
cd backend/services/stt-service
pip3 install -r requirements.txt
cd ../../..
```

TTS Service:
```bash
cd backend/services/tts-service
pip3 install -r requirements.txt
cd ../../..
```

**Step 7: Install PM2 (keeps services running)**
```bash
sudo npm install -g pm2
```

✅ **Server is set up!**

---

### **Phase 6: Start Services (5 minutes)**

**Create a startup script:**

```bash
nano start-server.sh
```

**Paste this:**
```bash
#!/bin/bash

# Start Translation Service
cd ~/MultiLingualChat/backend/services/translation-service
pm2 start python3 --name "translation" -- main.py

# Start STT Service
cd ~/MultiLingualChat/backend/services/stt-service
pm2 start python3 --name "stt" -- main.py

# Start TTS Service
cd ~/MultiLingualChat/backend/services/tts-service
pm2 start python3 --name "tts" -- main.py

# Start Chat Service
cd ~/MultiLingualChat/backend/services/chat-service
pm2 start npm --name "chat" -- run dev

# Start Frontend
cd ~/MultiLingualChat/frontend
pm2 start npm --name "frontend" -- run dev

# Save PM2 config
pm2 save

echo "All services started!"
pm2 status
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

**Make executable:**
```bash
chmod +x start-server.sh
```

**Run it:**
```bash
./start-server.sh
```

✅ **All services running!**

**Check status:**
```bash
pm2 status
```

You should see all 5 services running!

---

### **Phase 7: Access Your App**

**Your app is now live at:**
```
http://YOUR_PUBLIC_IP:5173
```

**Example:**
```
http://123.456.78.90:5173
```

**Share this URL with your client!**

No SSL, no tunneling, no complexity - just works!

---

## 🎉 You're Done!

**What you have:**
- ✅ Your own server in the cloud
- ✅ Running 24/7 (always on!)
- ✅ Public IP address
- ✅ All services running exactly like localhost
- ✅ Free forever!

**Share with client:**
```
http://YOUR_PUBLIC_IP:5173
```

---

## 🛠️ Useful Commands

**Check services:**
```bash
pm2 status
```

**Restart a service:**
```bash
pm2 restart frontend
```

**Stop all services:**
```bash
pm2 stop all
```

**View logs:**
```bash
pm2 logs frontend
pm2 logs chat
```

**Auto-start on reboot:**
```bash
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

---

## 💡 Next Steps

### **Add Domain Name (Optional)**

Instead of `http://123.456.78.90:5173`, use `http://mychat.com`:

1. Buy domain from Namecheap ($10/year)
2. Point DNS to your Oracle IP
3. Install nginx reverse proxy
4. Get free SSL with Let's Encrypt

### **Setup HTTPS (Optional)**

```bash
# Install certbot
sudo apt install certbot

# Get SSL certificate (need domain first)
sudo certbot certonly --standalone -d yourdomain.com
```

---

## ✅ Advantages of This Approach

Compared to Render/Railway:
- ✅ **Simpler** - just run your code
- ✅ **More control** - it's your server
- ✅ **No sleeping** - always on
- ✅ **More resources** - 12-24GB RAM free
- ✅ **Familiar** - same as your local setup
- ✅ **Free forever** - not a trial

---

## 🆘 Troubleshooting

**Can't connect to SSH:**
- Check you're using the right private key
- Check IP address is correct
- Check firewall allows port 22

**Services won't start:**
- Check logs: `pm2 logs servicename`
- Check ports aren't in use: `netstat -tulpn`
- Make sure dependencies installed

**Can't access from browser:**
- Check Oracle firewall rules (ingress rules)
- Check Ubuntu firewall: `sudo ufw status`
- Make sure services are running: `pm2 status`

---

**This is the SIMPLEST solution - your own server, your own rules!** 🚀
