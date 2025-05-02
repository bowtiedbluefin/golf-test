# Firebase Setup Guide

## Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Take note of your Project ID for the environment variables

## Step 2: Enable Firestore Database
1. In the Firebase Console, navigate to "Firestore Database" 
2. Click "Create database"
3. Choose "Start in test mode" for now (we'll update rules later)
4. Select a location closest to your users
5. Click "Enable"

## Step 3: Set Up Authentication (if needed)
1. Go to "Authentication" in the Firebase Console
2. Enable the authentication methods you need (you can skip this for now)

## Step 4: Configure Firestore Security Rules
1. Go to "Firestore Database" -> "Rules" tab
2. Update the rules to allow read/write access:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // WARNING: This allows anyone to read/write. For production, use proper authentication.
    }
  }
}
```

## Step 5: Register a Web App
1. In Firebase Console, click on the gear icon and select "Project settings"
2. Scroll down to "Your apps" section
3. Click on the "</>" icon to add a web app
4. Register your app with a nickname
5. Copy the configuration values for your `.env.local` file 