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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSession } from '../../providers/session-provider';
import { useAuth } from '../../providers/auth-provider';
import { RootStackParamList, Restaurant, TournamentMatchup } from '../../lib/types';
import { supabase } from '../../lib/supabase/client';

type TournamentScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Tournament'>;

const TournamentScreen: React.FC = () => {
  const navigation = useNavigation<TournamentScreenNavigationProp>();
  const { user } = useAuth();
  const { 
    currentSession, 
    tournamentMatchups, 
    voteTournament, 
    loading, 
    error 
  } = useSession();
  
  const [currentMatchup, setCurrentMatchup] = useState<TournamentMatchup | null>(null);
  const [restaurant1, setRestaurant1] = useState<Restaurant | null>(null);
  const [restaurant2, setRestaurant2] = useState<Restaurant | null>(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(false);

  useEffect(() => {
    if (tournamentMatchups.length > 0 && currentSession) {
      // Find the first matchup without a winner in the current round
      const activeMatchup = tournamentMatchups.find(
        (matchup) => 
          !matchup.winner_id && 
          matchup.round_number === currentSession.current_round
      );

      if (activeMatchup) {
        setCurrentMatchup(activeMatchup);
        setIsMyTurn(activeMatchup.user_turn_id === user?.id);
        fetchRestaurants(activeMatchup.restaurant1_id, activeMatchup.restaurant2_id);
      } else if (currentSession.status === 'completed') {
        // If there are no active matchups and the session is completed, navigate to result
        const finalMatchup = tournamentMatchups.find(
          (matchup) => 
            matchup.round_number === currentSession.current_round - 1 && 
            matchup.winner_id
        );
        
        if (finalMatchup && finalMatchup.winner_id) {
          navigation.navigate('Result', { restaurantId: finalMatchup.winner_id });
        }
      }
    }
  }, [tournamentMatchups, currentSession, user]);

  const fetchRestaurants = async (id1: string, id2: string) => {
    setLoadingRestaurants(true);
    try {
      // Fetch restaurant 1
      const { data: data1, error: error1 } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id1)
        .single();

      if (error1) throw error1;

      // Fetch restaurant 2
      const { data: data2, error: error2 } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id2)
        .single();

      if (error2) throw error2;

      setRestaurant1(data1);
      setRestaurant2(data2);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const handleVote = async (restaurantId: string) => {
    if (!currentMatchup) return;
    
    try {
      await voteTournament(currentMatchup.id, restaurantId);
      
      // Check if this was the final vote
      if (tournamentMatchups.length === 1 && currentMatchup.round_number === 1) {
        navigation.navigate('Result', { restaurantId });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const renderRestaurantCard = (restaurant: Restaurant | null, onPress: () => void) => {
    if (!restaurant) return null;

    return (
      <TouchableOpacity 
        style={styles.restaurantCard}
        onPress={onPress}
        disabled={!isMyTurn || loading}
      >
        <Image source={{ uri: restaurant.image_url }} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{restaurant.cuisine_type}</Text>
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantDetail}>{restaurant.price_level}</Text>
            <Text style={styles.restaurantDetail}>★ {restaurant.rating}</Text>
            <Text style={styles.restaurantDetail}>{restaurant.distance.toFixed(1)} mi</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTournamentStatus = () => {
    if (!currentSession) return null;

    const totalRounds = Math.ceil(Math.log2(tournamentMatchups.length + 1));
    const currentRound = currentSession.current_round;
    
    return (
      <View style={styles.tournamentStatus}>
        <Text style={styles.tournamentStatusText}>
          Round {currentRound} of {totalRounds}
        </Text>
        <View style={styles.tournamentProgress}>
          {Array.from({ length: totalRounds }).map((_, index) => (
            <View 
              key={index}
              style={[
                styles.tournamentProgressDot,
                index < currentRound ? styles.tournamentProgressDotActive : {}
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  if (loading || loadingRestaurants) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading tournament...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!currentMatchup || !restaurant1 || !restaurant2) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active tournament found.</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('Swipe')}
        >
          <Text style={styles.backButtonText}>Back to Swiping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tournament Round</Text>
        <Text style={styles.headerSubtitle}>
          {isMyTurn 
            ? "It's your turn! Pick your favorite." 
            : "Waiting for your partner to choose..."}
        </Text>
        {renderTournamentStatus()}
      </View>

      <View style={styles.vsContainer}>
        <View style={styles.vsLine} />
        <View style={styles.vsCircle}>
          <Text style={styles.vsText}>VS</Text>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        {renderRestaurantCard(restaurant1, () => handleVote(restaurant1.id))}
        {renderRestaurantCard(restaurant2, () => handleVote(restaurant2.id))}
      </View>

      {!isMyTurn && (
        <View style={styles.waitingContainer}>
          <ActivityIndicator size="small" color="#ff6b6b" />
          <Text style={styles.waitingText}>Waiting for partner's choice...</Text>
        </View>
      )}
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
  tournamentStatus: {
    marginTop: 15,
    alignItems: 'center',
  },
  tournamentStatusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  tournamentProgress: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tournamentProgressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd',
    marginHorizontal: 5,
  },
  tournamentProgressDotActive: {
    backgroundColor: '#ff6b6b',
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  vsLine: {
    position: 'absolute',
    top: '50%',
    width: '80%',
    height: 1,
    backgroundColor: '#ddd',
  },
  vsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  vsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  restaurantCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  restaurantDetails: {
    flexDirection: 'row',
    marginTop: 10,
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
  waitingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  waitingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
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
  },
  emptyContainer: {
    flex: 1,
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

export default TournamentScreen;
