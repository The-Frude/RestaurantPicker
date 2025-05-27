# Project Context for Chicken Tinder

## Overview
Chicken Tinder is a mobile application designed for couples to choose where to eat in a playful, game-style format. The app allows users to swipe on local restaurants, and when both users swipe right on a restaurant, it enters a tournament bracket for final selection.

## Tech Stack
- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL)
- **External APIs**: Google Places API for restaurant data
- **Maps SDK**: Google Maps for displaying restaurant locations

## Key Features
- User authentication using Supabase Auth
- Restaurant swiping interface
- Tournament-style elimination for final restaurant selection
- Map integration to show selected restaurants
- Push notifications for session updates

## Project Structure
```
chicken-tinder/
├── app/                    # App-wide components and navigation
├── assets/                 # Static assets (images, fonts)
├── features/               # Feature-based modules
├── lib/                    # Shared utilities and services
├── providers/              # Context providers for state management
└── supabase/               # Supabase database setup
```

## Important Files
- **lib/api/restaurants.ts**: Contains functions to fetch restaurant data from Google Places API.
- **providers/auth-provider.tsx**: Manages user authentication state.
- **features/auth/**: Contains authentication screens (Login, Register, Pairing).
- **features/swipe/**: Contains the swipe interface for selecting restaurants.
- **features/tournament/**: Contains the tournament logic for final restaurant selection.

## Development Notes
- Ensure that the `.env` file is configured with the necessary API keys for Supabase and Google Maps.
- The app uses TypeScript for type safety and better development experience.
- Testing is set up using Jest and React Testing Library.

## Next Steps
Refer to the `NEXT-STEPS.md` file for instructions on setting up the development environment and running the app.
