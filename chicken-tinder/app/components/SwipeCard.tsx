import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Restaurant } from '../../lib/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

type SwipeCardProps = {
  restaurant: Restaurant;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

const SwipeCard: React.FC<SwipeCardProps> = ({ restaurant, onSwipeLeft, onSwipeRight }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 1],
    extrapolate: 'clamp',
  });

  const nextCardScale = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0.8, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    direction === 'right' ? onSwipeRight() : onSwipeLeft();
    position.setValue({ x: 0, y: 0 });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 4,
      useNativeDriver: false,
    }).start();
  };

  const renderPrice = () => {
    const priceLevel = restaurant.price_level;
    return priceLevel;
  };

  const renderRating = () => {
    return `★ ${restaurant.rating}`;
  };

  const renderDistance = () => {
    return `${restaurant.distance.toFixed(1)} mi`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: rotation },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View style={[styles.likeContainer, { opacity: likeOpacity }]}>
        <Text style={styles.likeText}>LIKE</Text>
      </Animated.View>

      <Animated.View style={[styles.dislikeContainer, { opacity: dislikeOpacity }]}>
        <Text style={styles.dislikeText}>NOPE</Text>
      </Animated.View>

      <Image source={{ uri: restaurant.image_url }} style={styles.image} />

      <View style={styles.infoContainer}>
        <Text style={styles.name}>{restaurant.name}</Text>
        <Text style={styles.cuisine}>{restaurant.cuisine_type}</Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailText}>{renderPrice()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailText}>{renderRating()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailText}>{renderDistance()}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.3,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '70%',
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  detailsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
  },
  detailItem: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
  },
  likeContainer: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 1,
    transform: [{ rotate: '15deg' }],
  },
  likeText: {
    borderWidth: 3,
    borderColor: '#4CD964',
    color: '#4CD964',
    fontSize: 32,
    fontWeight: 'bold',
    padding: 10,
  },
  dislikeContainer: {
    position: 'absolute',
    top: 50,
    left: 40,
    zIndex: 1,
    transform: [{ rotate: '-15deg' }],
  },
  dislikeText: {
    borderWidth: 3,
    borderColor: '#FF3B30',
    color: '#FF3B30',
    fontSize: 32,
    fontWeight: 'bold',
    padding: 10,
  },
});

export default SwipeCard;
