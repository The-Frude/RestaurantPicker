import 'dotenv/config';

export default {
  name: process.env.EXPO_PUBLIC_APP_NAME || 'Chicken Tinder',
  slug: 'chicken-tinder',
  version: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourcompany.chickentinder'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourcompany.chickentinder'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    yelpApiKey: process.env.EXPO_PUBLIC_YELP_API_KEY,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    eas: {
      projectId: 'your-project-id'
    }
  },
  plugins: [
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow Chicken Tinder to use your location to find nearby restaurants.'
      }
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow Chicken Tinder to access your photos.'
      }
    ]
  ]
};
