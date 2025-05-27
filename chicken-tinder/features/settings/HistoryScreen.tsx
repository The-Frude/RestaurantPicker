import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../providers/auth-provider';
import { RootStackParamList, Restaurant } from '../../lib/types';
import { supabase } from '../../lib/supabase/client';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

type HistoryItem = {
  id: string;
  session_id: string;
  restaurant_id: string;
  completed_at: string;
  restaurant: Restaurant;
};

const HistoryScreen: React.FC = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const { user } = useAuth();
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get all sessions where the user is either user1 or user2
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'completed');

      if (sessionsError) throw sessionsError;

      if (!sessions || sessions.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      const sessionIds = sessions.map(session => session.id);

      // Get all final selections for these sessions
      const { data: selections, error: selectionsError } = await supabase
        .from('final_selections')
        .select(`
          id,
          session_id,
          restaurant_id,
          completed_at
        `)
        .in('session_id', sessionIds)
        .order('completed_at', { ascending: false });

      if (selectionsError) throw selectionsError;

      if (!selections || selections.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // Get all restaurants for these selections
      const restaurantIds = selections.map(selection => selection.restaurant_id);
      const { data: restaurants, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .in('id', restaurantIds);

      if (restaurantsError) throw restaurantsError;

      // Combine the data
      const historyItems = selections.map(selection => {
        const restaurant = restaurants?.find(r => r.id === selection.restaurant_id);
        return {
          ...selection,
          restaurant,
        };
      });

      setHistory(historyItems as HistoryItem[]);
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRestaurant = (restaurantId: string) => {
    navigation.navigate('Result', { restaurantId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    if (!item.restaurant) return null;

    return (
      <TouchableOpacity 
        style={styles.historyItem}
        onPress={() => handleViewRestaurant(item.restaurant_id)}
      >
        <Image source={{ uri: item.restaurant.image_url }} style={styles.restaurantImage} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
          <Text style={styles.restaurantCuisine}>{item.restaurant.cuisine_type}</Text>
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantDetail}>{item.restaurant.price_level}</Text>
            <Text style={styles.restaurantDetail}>★ {item.restaurant.rating}</Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.completed_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={fetchHistory}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Match History</Text>
          <Text style={styles.headerSubtitle}>Your past restaurant matches</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You don't have any match history yet.</Text>
          <TouchableOpacity 
            style={styles.startButton} 
            onPress={() => navigation.navigate('Pairing')}
          >
            <Text style={styles.startButtonText}>Start Swiping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match History</Text>
        <Text style={styles.headerSubtitle}>Your past restaurant matches</Text>
      </View>
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    padding: 20,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
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
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  restaurantInfo: {
    flex: 1,
    padding: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  restaurantDetails: {
    flexDirection: 'row',
    marginTop: 5,
  },
  restaurantDetail: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 8,
    fontSize: 12,
    color: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'right',
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
  startButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
