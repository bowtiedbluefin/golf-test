# Deploying to Vercel

This guide explains how to deploy your Golf Scorecard app to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. Your Firebase project set up and configured

## Deployment Steps

### 1. Set up your environment variables

Before deploying, ensure you have your Firebase configuration set up:

- Create a `.env.local` file based on the `firebase-env-template.txt` template
- Fill in your actual Firebase credentials

### 2. Connect with Vercel

1. Install the Vercel CLI (optional):
   ```
   npm install -g vercel
   ```

2. Login to Vercel (if using CLI):
   ```
   vercel login
   ```

### 3. Deploy

#### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Login to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure project:
   - Set the Framework Preset to "Next.js"
   - Add the environment variables from your `.env.local` file
6. Click "Deploy"

#### Option 2: Deploy via CLI

Run the following command in your project directory:
```
vercel
```

Follow the prompts to complete deployment.

### 4. Set up Environment Variables in Vercel

Make sure to add all your Firebase environment variables in the Vercel project settings:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add each variable from your `.env.local` file

## Troubleshooting

If your app doesn't appear in Vercel:
1. Ensure you've pushed your code to a git repository
2. Connect that repository to your Vercel account
3. Check that your `vercel.json` configuration is correct
4. Verify that your Next.js app has the proper structure 