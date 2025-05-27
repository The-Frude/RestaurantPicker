// Mock the expo-constants module
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'https://mock-supabase-url.supabase.co',
      supabaseKey: 'mock-supabase-key',
      yelpApiKey: 'mock-yelp-api-key',
      googleMapsApiKey: 'mock-google-maps-api-key',
    },
  },
}));

// Mock the AsyncStorage module
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock the NetInfo module
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock the expo-location module
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => 
    Promise.resolve({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 0,
        accuracy: 0,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0,
      },
      timestamp: 1625097600000,
    })
  ),
}));

// Mock the react-native-maps module
jest.mock('react-native-maps', () => {
  const React = require('react');
  const MapView = ({ children, ...props }) => {
    return React.createElement('MapView', props, children);
  };
  
  const Marker = (props) => {
    return React.createElement('Marker', props);
  };
  
  return {
    __esModule: true,
    default: MapView,
    Marker,
  };
});

// Mock the Linking module
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
}));

// Mock the Alert module
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock the Share module
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve()),
}));

// Global setup
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Extend expect with additional matchers if needed
// Example: import '@testing-library/jest-native/extend-expect';
