# Golf Scorecard App

A web application for tracking golf scores across 8 players, divided into 2 groups of 4. This app allows players to:

- View and modify scores for all 18 holes
- Select which player's score from each group counts for each hole
- See a summary of the selected scores and total score
- Edit player names

## Getting Started

### Prerequisites
- Node.js 18+ 
- NPM or Yarn

### Installation

1. Clone this repository
```bash
git clone <repository-url>
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
- Create a `.env.local` file in the root directory
- Add Firebase configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

This app is designed to be deployed on Vercel with Firebase as the database. Follow these steps:

1. Create a Firebase project and enable Firestore
2. Create a Vercel account and connect your repository
3. Add the environment variables to your Vercel project
4. Deploy

## Technology Stack

- Next.js (React)
- Firebase (Firestore)
- Tailwind CSS
- Vercel (Hosting) 