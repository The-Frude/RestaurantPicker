# Chicken Tinder

A mobile app for couples to choose where to eat together. Swipe on restaurants, match with your partner's choices, and compete in a tournament to find the perfect dining spot.

## Overview

Chicken Tinder is a React Native mobile application built with Expo and Supabase. The app helps couples decide where to eat by:

1. Having both users swipe on local restaurants (Tinder-style)
2. Creating matches when both users swipe right on the same restaurant
3. Running a tournament bracket with the matches to determine the final winner

## Features

- **User Authentication**: Email/password login via Supabase Auth
- **Couple Pairing**: Connect with your partner using a unique code
- **Restaurant Swiping**: Swipe through restaurant cards with details like photos, ratings, and distance
- **Tournament Bracket**: Compete in a bracket-style elimination to choose the final restaurant
- **Map Integration**: View the winning restaurant on a map
- **Match History**: Review past dining decisions
- **Preference Settings**: Customize filters for cuisine types, price range, and distance

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **APIs**: Yelp Fusion API (or Google Places API)
- **Maps**: React Native Maps with Google Maps SDK
- **State Management**: React Context API + Hooks

## Project Structure

```
chicken-tinder/
├── app/                    # App-wide components and navigation
│   ├── components/         # Reusable UI components
│   └── navigation/         # Navigation configuration
├── assets/                 # Static assets (images, fonts)
├── features/               # Feature-based modules
│   ├── auth/               # Authentication screens
│   ├── swipe/              # Restaurant swiping screens
│   ├── tournament/         # Tournament bracket screens
│   └── settings/           # Settings and history screens
├── lib/                    # Shared utilities and services
│   ├── api/                # API service for restaurant data
│   ├── supabase/           # Supabase client and database functions
│   └── types/              # TypeScript type definitions
└── providers/              # Context providers for state management
```

## Database Schema

The app uses the following Supabase tables:

- **users**: User accounts and preferences
- **sessions**: Dining decision sessions between couples
- **restaurants**: Restaurant data from external APIs
- **swipes**: User swipe actions on restaurants
- **matches**: Restaurants that both users liked
- **tournament_matchups**: Tournament bracket structure
- **final_selections**: The winning restaurant for each session

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Expo CLI
- Supabase account
- Yelp API key or Google Places API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/chicken-tinder.git
   cd chicken-tinder
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file with your API keys
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   EXPO_PUBLIC_YELP_API_KEY=your_yelp_api_key
   ```

4. Start the development server
   ```
   npm start
   ```

5. Run on a device or emulator
   ```
   npm run android
   # or
   npm run ios
   ```

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL scripts in the `supabase/migrations` directory to set up your database schema
3. Configure Row Level Security (RLS) policies for data protection
4. Enable Email Auth in the Authentication settings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by the classic dilemma of "Where should we eat tonight?"
- Built with love for indecisive couples everywhere
