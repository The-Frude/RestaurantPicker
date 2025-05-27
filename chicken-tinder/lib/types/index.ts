// User types
export type User = {
  id: string;
  email: string;
  name?: string;
  partner_id?: string;
  preferences?: UserPreferences;
};

export type UserPreferences = {
  cuisineTypes?: string[];
  priceRange?: string[];
  distanceRadius?: number;
  openNow?: boolean;
};

// Session types
export type Session = {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'swiping' | 'tournament' | 'completed';
  current_round: number;
  created_at: string;
  completed_at?: string;
};

// Restaurant types
export type Restaurant = {
  id: string;
  external_id: string;
  name: string;
  cuisine_type: string;
  rating: number;
  price_level: string;
  distance: number;
  image_url: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  order_url?: string;
};

// Swipe types
export type Swipe = {
  session_id: string;
  user_id: string;
  restaurant_id: string;
  is_liked: boolean;
  created_at: string;
};

// Match types
export type Match = {
  session_id: string;
  restaurant_id: string;
  round_number: number;
};

// Tournament types
export type TournamentMatchup = {
  id: string;
  session_id: string;
  round_number: number;
  restaurant1_id: string;
  restaurant2_id: string;
  winner_id?: string;
  user_turn_id: string;
};

export type FinalSelection = {
  session_id: string;
  restaurant_id: string;
  completed_at: string;
  user_notes?: string;
  rating?: number;
};

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Pairing: undefined;
  Swipe: undefined;
  Tournament: undefined;
  Result: { restaurantId: string };
  History: undefined;
  Settings: undefined;
};
