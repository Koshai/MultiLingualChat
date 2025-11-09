# Azure Translator Setup Guide

Azure Translator offers a **FREE tier with 2 million characters per month** - perfect for our multilingual chat application!

## Why Azure Translator?

- **Free Tier**: 2M characters/month (永久 free!)
- **High Quality**: Professional-grade translation
- **Fast**: Low latency cloud-based service
- **No Credit Card Required**: For free tier
- **Multiple Languages**: 100+ languages supported

## Setup Instructions

### Step 1: Create Azure Account

1. Go to [Azure Portal](https://portal.azure.com)
2. Sign up for free (no credit card required for free services)
3. Sign in to Azure Portal

### Step 2: Create Translator Resource

1. Click **"Create a resource"** in Azure Portal
2. Search for **"Translator"** or visit: https://portal.azure.com/#create/Microsoft.CognitiveServicesTextTranslation
3. Click **"Create"**

### Step 3: Configure Resource

Fill in the following:

- **Subscription**: Select your Azure subscription
- **Resource Group**: Create new or use existing (e.g., "multilingual-chat-rg")
- **Region**: Choose closest to you (e.g., "East US", "West Europe", or use "Global")
- **Name**: Give it a unique name (e.g., "multilingual-translator-001")
- **Pricing Tier**: Select **"Free F0"** (2M chars/month)

Click **"Review + Create"** → **"Create"**

### Step 4: Get Your API Key

1. Wait for deployment to complete (~1 minute)
2. Click **"Go to resource"**
3. In left sidebar, click **"Keys and Endpoint"**
4. You'll see:
   - **KEY 1** (copy this!)
   - **KEY 2** (backup key)
   - **Location/Region** (e.g., "eastus" or "global")

### Step 5: Configure Your App

1. Open your `.env` file in the project root
2. Add your Azure credentials:

```bash
# Azure Translator (FREE TIER: 2M chars/month)
AZURE_TRANSLATOR_KEY=your-key-here-paste-KEY-1
AZURE_TRANSLATOR_REGION=global
```

Replace `your-key-here-paste-KEY-1` with your actual KEY 1 from Azure Portal.

### Step 6: Test It!

1. Start your services: `start-dev.bat` (Windows) or `./start-dev.sh` (Mac/Linux)
2. Check translation service logs - you should see:
   ```
   ✅ Azure Translator set as primary provider
   ✅ Argos Translate set as fallback provider
   ```
3. Join a meeting and speak in Spanish - it should translate to English!

## How It Works

### Provider Chain with Fallback

Your translation service now uses a smart provider chain:

1. **Primary**: Azure Translator (high quality, cloud)
2. **Fallback**: Argos Translate (offline, lower quality)

If Azure fails or quota is exceeded, it automatically falls back to Argos!

### Usage Tracking

Monitor your usage in Azure Portal:

1. Go to your Translator resource
2. Click **"Metrics"** in left sidebar
3. View character count and API calls

## Quota Management

**Free Tier Limits:**
- 2M characters/month
- 2M characters/hour
- ~33,300 characters/minute

**Example Usage:**
- 30-minute meeting with 2 people
- Each speaks 100 words/minute
- Total: ~30,000 characters
- **You can handle 60+ meetings/month on free tier!**

## Troubleshooting

### "Azure Translator not initialized"

**Check:**
1. Is `AZURE_TRANSLATOR_KEY` set in `.env`?
2. Is the key correct (no extra spaces)?
3. Is Redis running? (optional but recommended)

### "Authentication failed"

**Solutions:**
1. Regenerate key in Azure Portal
2. Make sure you copied KEY 1 correctly
3. Check if resource is active (not deleted)

### "Quota exceeded"

**Options:**
1. Wait for monthly reset (1st of month)
2. Fallback to Argos Translate (automatic)
3. Upgrade to paid tier (S1: $10/million chars)

## Cost Calculator

**Typical Meeting:**
- Duration: 30 minutes
- Participants: 3 people
- Speaking rate: 100 words/min
- Total characters: ~45,000

**Free tier allows: ~44 meetings/month** (2M / 45K)

## Advanced: Paid Tier

If you exceed free tier:

**S1 Pricing:**
- $10 per million characters
- No monthly limits
- Same performance

To upgrade:
1. Go to your Translator resource
2. Click **"Pricing tier"** in left sidebar
3. Select **"Standard S1"**

## Support

- Azure Docs: https://learn.microsoft.com/azure/ai-services/translator/
- Pricing Details: https://azure.microsoft.com/pricing/details/cognitive-services/translator/
- API Reference: https://learn.microsoft.com/azure/ai-services/translator/reference/v3-0-translate

---

**Need Help?** Check the translation service logs for detailed error messages:
```bash
# In translation service terminal window
# Look for lines starting with ✅, ⚠️, or ❌
```
