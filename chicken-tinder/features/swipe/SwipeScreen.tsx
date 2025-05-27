import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSession } from '../../providers/session-provider';
import { RootStackParamList } from '../../lib/types';
import SwipeCard from '../../app/components/SwipeCard';
import * as Location from 'expo-location';

type SwipeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Swipe'>;

const SwipeScreen: React.FC = () => {
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const { 
    restaurants, 
    fetchRestaurants, 
    swipeRestaurant, 
    fetchMatches, 
    createTournament,
    loading, 
    error 
  } = useSession();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    getLocationAndFetchRestaurants();
  }, []);

  const getLocationAndFetchRestaurants = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need location permissions to show restaurants near you.');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      await fetchRestaurants(location.coords.latitude, location.coords.longitude);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSwipeLeft = () => {
    if (currentIndex < restaurants.length) {
      swipeRestaurant(restaurants[currentIndex].id, false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex < restaurants.length) {
      swipeRestaurant(restaurants[currentIndex].id, true);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleFinishSwiping = async () => {
    try {
      await fetchMatches();
      await createTournament();
      navigation.navigate('Tournament');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const renderCard = () => {
    if (loading || locationLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={getLocationAndFetchRestaurants}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (restaurants.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No restaurants found nearby.</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={getLocationAndFetchRestaurants}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (currentIndex >= restaurants.length) {
      return (
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedText}>You've swiped through all restaurants!</Text>
          <TouchableOpacity 
            style={styles.finishButton} 
            onPress={handleFinishSwiping}
          >
            <Text style={styles.finishButtonText}>Continue to Tournament</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <SwipeCard
        restaurant={restaurants[currentIndex]}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Restaurants</Text>
        <Text style={styles.headerSubtitle}>Swipe right on places you like</Text>
      </View>

      <View style={styles.cardContainer}>
        {renderCard()}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.dislikeButton]}
          onPress={handleSwipeLeft}
          disabled={currentIndex >= restaurants.length || loading || locationLoading}
        >
          <Text style={styles.buttonText}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.likeButton]}
          onPress={handleSwipeRight}
          disabled={currentIndex >= restaurants.length || loading || locationLoading}
        >
          <Text style={styles.buttonText}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
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
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4a90e2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  finishedContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  finishedText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  finishButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    padding: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  likeButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SwipeScreen;
