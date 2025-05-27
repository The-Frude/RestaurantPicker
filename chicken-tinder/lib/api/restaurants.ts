import Constants from 'expo-constants';
import { Restaurant } from '../types';

// Base URL for Google Places API
const GOOGLE_PLACES_API_BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

/**
 * Search for restaurants based on location and filters
 */
export async function searchRestaurants(
  latitude: number,
  longitude: number,
  filters: {
    cuisineTypes?: string[];
    priceRange?: string[];
    distanceRadius?: number;
    openNow?: boolean;
  } = {}
): Promise<Restaurant[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      location: `${latitude},${longitude}`,
      radius: '2000', // Default radius in meters
      type: 'restaurant',
      key: Constants.expoConfig?.extra?.googleMapsApiKey || '',
    });

    // Add optional filters
    if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
      params.append('types', filters.cuisineTypes.join('|'));
    }

    if (filters.priceRange && filters.priceRange.length > 0) {
      params.append('price', filters.priceRange.join(','));
    }

    if (filters.distanceRadius) {
      // Convert miles to meters (Google Places API uses meters)
      const radiusInMeters = Math.min(filters.distanceRadius * 1609.34, 40000);
      params.set('radius', radiusInMeters.toString());
    }

    if (filters.openNow) {
      params.append('opennow', 'true');
    }

    // Make the request
    const response = await fetch(`${GOOGLE_PLACES_API_BASE_URL}?${params.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Google Places data to our Restaurant type
    return data.results.map((place: any) => ({
      id: place.place_id,
      external_id: place.place_id,
      name: place.name,
      cuisine_type: place.types[0] || 'Restaurant',
      rating: place.rating,
      price_level: place.price_level || '$',
      distance: place.geometry.location, // Adjust as needed for distance calculation
      image_url: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${Constants.expoConfig?.extra?.googleMapsApiKey}` : '',
      address: place.vicinity,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      order_url: place.url,
    }));
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
}

/**
 * Get details for a specific restaurant by ID
 */
export async function getRestaurantDetails(id: string): Promise<Restaurant> {
  try {
    const response = await fetch(`${GOOGLE_PLACES_API_BASE_URL}/${id}?key=${Constants.expoConfig?.extra?.googleMapsApiKey}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
    }

    const place = await response.json();

    return {
      id: place.place_id,
      external_id: place.place_id,
      name: place.name,
      cuisine_type: place.types[0] || 'Restaurant',
      rating: place.rating,
      price_level: place.price_level || '$',
      distance: 0, // Distance not available in details endpoint
      image_url: place.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${Constants.expoConfig?.extra?.googleMapsApiKey}` : '',
      address: place.vicinity,
      coordinates: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      order_url: place.url,
    };
  } catch (error) {
    console.error('Error fetching restaurant details:', error);
    throw error;
  }
}
