# Band Inventory System - Setup Guide

## 🎯 Overview
This system provides professional inventory management for band directors with automatic Google Drive backup and barcode generation.

## 🚀 Quick Start (Local Version)
The system works immediately out of the box with local storage. No setup required for basic functionality.

## ☁️ Google Drive Sync Setup (Optional but Recommended)

To enable automatic cloud backup and device synchronization, you'll need to set up Google Drive API credentials.

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select an existing project
3. Give your project a name (e.g., "Band Inventory System")

### Step 2: Enable Google Drive API

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

### Step 3: Create Credentials

#### Create OAuth 2.0 Client ID:
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add your domain to "Authorized JavaScript origins":
   - For local testing: `http://localhost:3000`
   - For production: `https://yourdomain.com`
5. Copy the Client ID (looks like: `123456789-abc...googleusercontent.com`)

#### Create API Key:
1. Click "Create Credentials" > "API Key"
2. Copy the API Key (looks like: `AIzaSyB...`)
3. **Recommended**: Click "Restrict Key" and limit to Google Drive API

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Add your credentials:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here.googleusercontent.com
NEXT_PUBLIC_GOOGLE_API_KEY=your-api-key-here
```

### Step 5: Test the Setup

1. Start the application
2. Click "Sign in with Google" in the Google Drive Sync section
3. Authorize the application to access your Google Drive
4. Your inventory data will now automatically backup to Google Drive!

## 🛡️ Security & Privacy

- **Local First**: The system works completely offline and stores data locally
- **Private Google Drive**: When synced, data is stored in your personal Google Drive
- **No Server Storage**: We never store your data on external servers
- **App Data Folder**: Google Drive sync uses a private app folder invisible to users

## 📱 Multi-Device Usage

Once Google Drive sync is enabled:
- ✅ Add items on your school computer, access on your laptop at home
- ✅ Automatic backup of all changes
- ✅ Seamless restoration on new devices
- ✅ Works across Windows, Mac, tablets, and phones

## 🔧 Troubleshooting

### "Sign in failed" Error
- Check that your domain is added to authorized JavaScript origins
- Verify your Client ID is correct
- Make sure Google Drive API is enabled

### "Not signed in" Warning
- The system works fine without Google sign-in (local storage only)
- Cloud sync is optional for enhanced convenience

### Data Not Syncing
- Check internet connection
- Try manual backup/restore buttons
- Verify Google Drive API quota limits

## 📋 Business Distribution Notes

For music teacher business owners distributing this system:

1. **Option A**: Provide teachers with setup instructions to create their own Google API credentials
2. **Option B**: Create a shared Google Cloud project and provide ready-to-use credentials
3. **Option C**: Distribute as local-only version (still fully functional)

### Pre-configured Distribution
If you want to provide a pre-configured version:
1. Set up Google Cloud project with your business Google account
2. Configure OAuth consent screen with your business information
3. Include credentials in the distributed package
4. Teachers get instant cloud sync without technical setup

## 💡 Tips for Music Teachers

- **Start Simple**: Use the system locally first, add Google sync later
- **Regular Backups**: Even with cloud sync, export CSV backups monthly
- **School IT**: Check with IT department about Google API usage policies
- **Training**: The system is intuitive, but provide screenshots for less tech-savvy teachers

## 🎵 Ready to Use!

The system is fully functional even without Google Drive setup. Teachers can:
- ✅ Manage full inventory with barcodes
- ✅ Track student rentals
- ✅ Generate professional barcode labels
- ✅ Export data to spreadsheets
- ✅ Print rental reports

Google Drive sync just makes it even better by adding automatic backup and multi-device access!
