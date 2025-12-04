# Oracle Cloud VPS - Ultra Quick Start

**Time:** 30 minutes
**Cost:** $0 (free forever!)
**Result:** Your app running on a public IP like `http://123.456.78.90:5173`

---

## 🎯 What You'll Get

- ✅ Your own Ubuntu server (24GB RAM free!)
- ✅ Public IP address
- ✅ All services running 24/7
- ✅ No sleeping, no tunneling, no complexity
- ✅ Same as localhost, but accessible from anywhere
- ✅ **FREE FOREVER** (not a trial!)

---

## 🚀 Step-by-Step (30 minutes)

### **Step 1: Create Oracle Cloud Account (5 min)**

1. Go to: https://www.oracle.com/cloud/free/
2. Click "Start for free"
3. Enter your email → Verify
4. Fill in details:
   - Choose "Personal Use" (no credit card!)
   - Pick closest region
5. Verify phone number
6. ✅ Account created!

---

### **Step 2: Create Your Server (10 min)**

**A. Go to Instances:**
- Click hamburger menu (☰) → **Compute** → **Instances**
- Click **"Create Instance"**

**B. Configure:**
| Setting | Value |
|---------|-------|
| Name | `multilingual-chat` |
| Image | **Ubuntu 22.04** |
| Shape | Click "Change Shape" → **Ampere (ARM)** → **VM.Standard.A1.Flex** |
| OCPUs | **2** |
| Memory | **12 GB** (can go up to 24GB!) |

**C. SSH Keys:**
- Click **"Generate SSH key pair"**
- **Save Private Key** (download it!)
- **Save Public Key** (download it!)

**D. Click "Create"**

⏳ Wait 2-3 minutes...

✅ **Server created!**

**Copy your Public IP:** (looks like `123.456.78.90`)

---

### **Step 3: Open Firewall Ports (5 min)**

**A. In your instance page:**
- Click your **Subnet** link
- Click **Default Security List**

**B. Click "Add Ingress Rules" - Add these 3 rules:**

**Rule 1:**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `5173`
- Click "Add Ingress Rules"

**Rule 2:**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `3001`
- Click "Add Ingress Rules"

**Rule 3:**
- Source CIDR: `0.0.0.0/0`
- Destination Port: `3003-3005`
- Click "Add Ingress Rules"

✅ **Firewall configured!**

---

### **Step 4: Connect to Your Server (2 min)**

**On Windows (using Git Bash or WSL):**

```bash
# 1. Put your private key in a file
# Let's say you saved it as: oracle-key.pem

# 2. Set permissions
chmod 400 oracle-key.pem

# 3. Connect (replace YOUR_IP with your actual IP)
ssh -i oracle-key.pem ubuntu@YOUR_IP
```

**Example:**
```bash
ssh -i oracle-key.pem ubuntu@123.456.78.90
```

Type `yes` when asked to continue connecting.

✅ **You're now on your server!**

---

### **Step 5: Run Setup Script (10 min)**

**Copy these commands one by one:**

```bash
# Download setup script
curl -O https://raw.githubusercontent.com/Koshai/MultiLingualChat/feature/tunneling-alternatives/server-setup.sh

# Make it executable
chmod +x server-setup.sh

# Run it
./server-setup.sh
```

⏳ Wait 8-10 minutes...

This installs:
- ✅ Node.js
- ✅ Python
- ✅ Git
- ✅ PM2 (process manager)
- ✅ Your code from GitHub
- ✅ All dependencies

✅ **Server setup complete!**

---

### **Step 6: Start All Services (2 min)**

```bash
# Download start script
curl -O https://raw.githubusercontent.com/Koshai/MultiLingualChat/feature/tunneling-alternatives/start-all-services.sh

# Make it executable
chmod +x start-all-services.sh

# Run it
./start-all-services.sh
```

⏳ Wait 30 seconds...

✅ **All services running!**

Check status:
```bash
pm2 status
```

You should see all 5 services with status "online"!

---

### **Step 7: Access Your App!**

**Open in your browser:**
```
http://YOUR_IP:5173
```

**Example:**
```
http://123.456.78.90:5173
```

🎉 **IT WORKS!**

---

## 🎉 You're Live!

**Share this URL with your client:**
```
http://YOUR_IP:5173
```

**That's it!** No tunneling, no SSL issues, no complexity!

---

## 📋 Useful Commands

**Check if services are running:**
```bash
pm2 status
```

**View logs (if something's wrong):**
```bash
pm2 logs
```

**Restart all services:**
```bash
pm2 restart all
```

**Stop all services:**
```bash
pm2 stop all
```

**Start services again:**
```bash
pm2 start all
```

**Make services auto-start on reboot:**
```bash
pm2 startup
# Copy and run the command it shows
pm2 save
```

---

## 🔧 Troubleshooting

### **Can't SSH into server?**

**Using Windows Command Prompt?** Use Git Bash or WSL instead!

**Still can't connect?**
```bash
# Try with verbose output
ssh -v -i oracle-key.pem ubuntu@YOUR_IP
```

### **Can't access from browser?**

**Check firewall rules:**
1. Oracle Cloud console → Your instance
2. Subnet → Security List
3. Make sure you added ingress rules for ports 5173, 3001, 3003-3005

**Check services are running:**
```bash
pm2 status
```

All should show "online"

### **Services not starting?**

**Check logs:**
```bash
pm2 logs
```

**Restart a specific service:**
```bash
pm2 restart frontend
pm2 restart chat
```

---

## 💡 Pro Tips

### **Tip 1: Keep Services Running Forever**

```bash
# Set up auto-restart on reboot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

Now if server reboots, services auto-start!

### **Tip 2: Monitor Your Server**

```bash
# See real-time stats
pm2 monit
```

### **Tip 3: Update Your Code**

When you push changes to GitHub:
```bash
cd ~/MultiLingualChat
git pull
pm2 restart all
```

---

## ✅ Advantages

**Compared to tunneling (ngrok/localtunnel):**
- ✅ Always accessible (no sleeping!)
- ✅ No SSL issues
- ✅ Faster (no proxy)
- ✅ More reliable
- ✅ Professional (real IP)

**Compared to PaaS (Render/Railway):**
- ✅ Simpler setup
- ✅ More control
- ✅ More resources (24GB RAM!)
- ✅ No sleeping
- ✅ Familiar (same as localhost)

---

## 🎯 Next Steps

### **Get a Domain Name (Optional)**

Instead of `http://123.456.78.90:5173`, use `http://mychat.com`:

1. Buy domain ($10/year from Namecheap/GoDaddy)
2. Point A record to your Oracle IP
3. Install nginx reverse proxy
4. Get free SSL with Let's Encrypt

**Want help with this?** Let me know!

### **Add HTTPS (Optional)**

Need HTTPS? I can help you:
1. Set up nginx reverse proxy
2. Get free SSL certificate
3. Access via `https://yourdomain.com`

---

## 💰 Cost Breakdown

**Oracle Cloud Free Tier (Forever):**
- 4 ARM VMs (24GB RAM total): **$0**
- 200GB storage: **$0**
- 10TB bandwidth: **$0**
- Public IP: **$0**

**Total:** **$0/month forever!**

---

## 🆘 Need Help?

**If you get stuck:**
1. Check the full guide: `VPS-DEPLOYMENT-SIMPLE.md`
2. Check Oracle logs in instance console
3. Check service logs: `pm2 logs`
4. Ask me! Tell me what error you see

---

## 📝 Quick Reference

```bash
# Connect to server
ssh -i oracle-key.pem ubuntu@YOUR_IP

# Check services
pm2 status

# Restart services
pm2 restart all

# View logs
pm2 logs

# Update code
cd ~/MultiLingualChat && git pull && pm2 restart all

# Your app URL
http://YOUR_IP:5173
```

---

**Ready to deploy? Follow the steps above!** 🚀

**Takes 30 minutes, free forever, works perfectly!**
