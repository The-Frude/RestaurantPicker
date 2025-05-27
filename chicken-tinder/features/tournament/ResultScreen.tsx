import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Restaurant } from '../../lib/types';
import { supabase } from '../../lib/supabase/client';
import MapView, { Marker } from 'react-native-maps';

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;
type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;

const ResultScreen: React.FC = () => {
  const navigation = useNavigation<ResultScreenNavigationProp>();
  const route = useRoute<ResultScreenRouteProp>();
  const { restaurantId } = route.params;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    setLoading(true);
    try {
      // First try to get from Supabase
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;

      setRestaurant(data);
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMaps = () => {
    if (!restaurant) return;
    
    const { coordinates, name } = restaurant;
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}&query_place_id=${restaurant.external_id}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Could not open maps application');
        }
      })
      .catch((err) => Alert.alert('Error', err.message));
  };

  const handleOrderOnline = () => {
    if (!restaurant || !restaurant.order_url) return;
    
    Linking.canOpenURL(restaurant.order_url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(restaurant.order_url!);
        } else {
          Alert.alert('Error', 'Could not open ordering website');
        }
      })
      .catch((err) => Alert.alert('Error', err.message));
  };

  const handleStartNewSession = () => {
    navigation.navigate('Pairing');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading result...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error || 'Restaurant not found'}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>It's a Match!</Text>
        <Text style={styles.headerSubtitle}>You both agreed on a restaurant</Text>
      </View>

      <View style={styles.confettiContainer}>
        <Text style={styles.confettiText}>🎉</Text>
      </View>

      <View style={styles.restaurantCard}>
        <Image source={{ uri: restaurant.image_url }} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type}</Text>
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantDetail}>{restaurant.price_level}</Text>
            <Text style={styles.restaurantDetail}>★ {restaurant.rating}</Text>
            <Text style={styles.restaurantDetail}>{restaurant.distance.toFixed(1)} mi</Text>
          </View>
          <Text style={styles.restaurantAddress}>{restaurant.address}</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: restaurant.coordinates.latitude,
            longitude: restaurant.coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: restaurant.coordinates.latitude,
              longitude: restaurant.coordinates.longitude,
            }}
            title={restaurant.name}
            description={restaurant.cuisine_type}
          />
        </MapView>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.mapsButton]} 
          onPress={handleOpenMaps}
        >
          <Text style={styles.actionButtonText}>Open in Maps</Text>
        </TouchableOpacity>

        {restaurant.order_url && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.orderButton]} 
            onPress={handleOrderOnline}
          >
            <Text style={styles.actionButtonText}>Order Online</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={styles.newSessionButton} 
        onPress={handleStartNewSession}
      >
        <Text style={styles.newSessionButtonText}>Start New Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  confettiContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  confettiText: {
    fontSize: 50,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  restaurantInfo: {
    padding: 15,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantCuisine: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  restaurantDetails: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  restaurantDetail: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
    fontSize: 12,
    color: '#333',
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  mapContainer: {
    margin: 20,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  mapsButton: {
    backgroundColor: '#4a90e2',
  },
  orderButton: {
    backgroundColor: '#4CD964',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  newSessionButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  newSessionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ResultScreen;
