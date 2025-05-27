import React, { createContext, useState, useContext } from 'react';
import { supabase } from '../lib/supabase/client';
import { Session, Restaurant, Match, TournamentMatchup } from '../lib/types';
import { useAuth } from './auth-provider';

// Define the context type
type SessionContextType = {
  currentSession: Session | null;
  restaurants: Restaurant[];
  matches: Match[];
  tournamentMatchups: TournamentMatchup[];
  loading: boolean;
  error: string | null;
  createSession: (partnerId: string) => Promise<Session | null>;
  fetchRestaurants: (latitude: number, longitude: number, filters?: any) => Promise<void>;
  swipeRestaurant: (restaurantId: string, isLiked: boolean) => Promise<void>;
  fetchMatches: () => Promise<void>;
  createTournament: () => Promise<void>;
  voteTournament: (matchupId: string, restaurantId: string) => Promise<void>;
  completeSession: (restaurantId: string) => Promise<void>;
};

// Create the context with a default value
const SessionContext = createContext<SessionContextType>({
  currentSession: null,
  restaurants: [],
  matches: [],
  tournamentMatchups: [],
  loading: false,
  error: null,
  createSession: async () => null,
  fetchRestaurants: async () => {},
  swipeRestaurant: async () => {},
  fetchMatches: async () => {},
  createTournament: async () => {},
  voteTournament: async () => {},
  completeSession: async () => {},
});

// Create the provider component
export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournamentMatchups, setTournamentMatchups] = useState<TournamentMatchup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new session
  const createSession = async (partnerId: string): Promise<Session | null> => {
    if (!user) return null;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user1_id: user.id,
          user2_id: partnerId,
          status: 'swiping',
          current_round: 1,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: Session = {
        id: data.id,
        user1_id: data.user1_id,
        user2_id: data.user2_id,
        status: data.status,
        current_round: data.current_round,
        created_at: data.created_at,
      };

      setCurrentSession(newSession);
      return newSession;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch restaurants from API
  const fetchRestaurants = async (
    latitude: number,
    longitude: number,
    filters?: any
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // This would be replaced with actual API call to Yelp or Google Places
      // For now, we'll use mock data
      const mockRestaurants: Restaurant[] = [
        {
          id: '1',
          external_id: 'yelp-1',
          name: 'Tasty Burger',
          cuisine_type: 'American',
          rating: 4.5,
          price_level: '$$',
          distance: 1.2,
          image_url: 'https://via.placeholder.com/150',
          address: '123 Main St',
          coordinates: {
            latitude: latitude + 0.01,
            longitude: longitude + 0.01,
          },
        },
        {
          id: '2',
          external_id: 'yelp-2',
          name: 'Pizza Palace',
          cuisine_type: 'Italian',
          rating: 4.2,
          price_level: '$$',
          distance: 0.8,
          image_url: 'https://via.placeholder.com/150',
          address: '456 Oak Ave',
          coordinates: {
            latitude: latitude - 0.01,
            longitude: longitude - 0.01,
          },
        },
      ];

      setRestaurants(mockRestaurants);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Swipe on a restaurant
  const swipeRestaurant = async (restaurantId: string, isLiked: boolean): Promise<void> => {
    if (!user || !currentSession) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('swipes').insert({
        session_id: currentSession.id,
        user_id: user.id,
        restaurant_id: restaurantId,
        is_liked: isLiked,
      });

      if (error) throw error;

      // If liked, check if it's a match
      if (isLiked) {
        const { data, error: matchError } = await supabase
          .from('swipes')
          .select()
          .eq('session_id', currentSession.id)
          .eq('restaurant_id', restaurantId)
          .eq('is_liked', true);

        if (matchError) throw matchError;

        // If both users liked the restaurant, create a match
        if (data && data.length === 2) {
          const { error: insertError } = await supabase.from('matches').insert({
            session_id: currentSession.id,
            restaurant_id: restaurantId,
            round_number: currentSession.current_round,
          });

          if (insertError) throw insertError;
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch matches for the current session
  const fetchMatches = async (): Promise<void> => {
    if (!currentSession) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('matches')
        .select()
        .eq('session_id', currentSession.id);

      if (error) throw error;

      setMatches(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create tournament matchups
  const createTournament = async (): Promise<void> => {
    if (!currentSession || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Update session status to tournament
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ status: 'tournament' })
        .eq('id', currentSession.id);

      if (updateError) throw updateError;

      // Get all matches
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select()
        .eq('session_id', currentSession.id);

      if (matchError) throw matchError;

      if (!matchData || matchData.length < 2) {
        throw new Error('Not enough matches to create a tournament');
      }

      // Create matchups
      const matchups: TournamentMatchup[] = [];
      for (let i = 0; i < matchData.length; i += 2) {
        if (i + 1 < matchData.length) {
          const matchup: TournamentMatchup = {
            id: `${i}-${i + 1}`,
            session_id: currentSession.id,
            round_number: 1,
            restaurant1_id: matchData[i].restaurant_id,
            restaurant2_id: matchData[i + 1].restaurant_id,
            user_turn_id: currentSession.user1_id,
          };
          matchups.push(matchup);
        } else {
          // If there's an odd number of matches, the last one gets a bye
          // We'll handle this in the UI
        }
      }

      // Insert matchups into the database
      for (const matchup of matchups) {
        const { error: insertError } = await supabase.from('tournament_matchups').insert(matchup);
        if (insertError) throw insertError;
      }

      setTournamentMatchups(matchups);

      // Update the current session
      setCurrentSession({
        ...currentSession,
        status: 'tournament',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Vote in a tournament matchup
  const voteTournament = async (matchupId: string, restaurantId: string): Promise<void> => {
    if (!currentSession || !user) return;

    setLoading(true);
    setError(null);

    try {
      // Update the matchup with the winner
      const { error: updateError } = await supabase
        .from('tournament_matchups')
        .update({
          winner_id: restaurantId,
          user_turn_id:
            user.id === currentSession.user1_id
              ? currentSession.user2_id
              : currentSession.user1_id,
        })
        .eq('id', matchupId);

      if (updateError) throw updateError;

      // Update the local state
      setTournamentMatchups((prev) =>
        prev.map((matchup) =>
          matchup.id === matchupId
            ? {
                ...matchup,
                winner_id: restaurantId,
                user_turn_id:
                  user.id === currentSession.user1_id
                    ? currentSession.user2_id
                    : currentSession.user1_id,
              }
            : matchup
        )
      );

      // Check if all matchups in the current round have winners
      const { data, error } = await supabase
        .from('tournament_matchups')
        .select()
        .eq('session_id', currentSession.id)
        .eq('round_number', currentSession.current_round);

      if (error) throw error;

      const allDecided = data?.every((matchup) => matchup.winner_id);

      if (allDecided) {
        // If there's only one winner, the tournament is complete
        if (data.length === 1) {
          // Update session status to completed
          const { error: completeError } = await supabase
            .from('sessions')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', currentSession.id);

          if (completeError) throw completeError;

          // Insert final selection
          const { error: finalError } = await supabase.from('final_selections').insert({
            session_id: currentSession.id,
            restaurant_id: data[0].winner_id,
            completed_at: new Date().toISOString(),
          });

          if (finalError) throw finalError;

          // Update the current session
          setCurrentSession({
            ...currentSession,
            status: 'completed',
            completed_at: new Date().toISOString(),
          });
        } else {
          // Create matchups for the next round
          const winners = data.map((matchup) => matchup.winner_id);
          const nextRound = currentSession.current_round + 1;
          const nextMatchups: TournamentMatchup[] = [];

          for (let i = 0; i < winners.length; i += 2) {
            if (i + 1 < winners.length) {
              const matchup: TournamentMatchup = {
                id: `${nextRound}-${i}-${i + 1}`,
                session_id: currentSession.id,
                round_number: nextRound,
                restaurant1_id: winners[i],
                restaurant2_id: winners[i + 1],
                user_turn_id: currentSession.user1_id,
              };
              nextMatchups.push(matchup);
            } else {
              // If there's an odd number of winners, the last one gets a bye
              // We'll handle this in the UI
            }
          }

          // Insert next round matchups into the database
          for (const matchup of nextMatchups) {
            const { error: insertError } = await supabase
              .from('tournament_matchups')
              .insert(matchup);
            if (insertError) throw insertError;
          }

          // Update the session's current round
          const { error: updateRoundError } = await supabase
            .from('sessions')
            .update({ current_round: nextRound })
            .eq('id', currentSession.id);

          if (updateRoundError) throw updateRoundError;

          // Update the current session and tournament matchups
          setCurrentSession({
            ...currentSession,
            current_round: nextRound,
          });
          setTournamentMatchups((prev) => [...prev, ...nextMatchups]);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Complete the session with a final restaurant selection
  const completeSession = async (restaurantId: string): Promise<void> => {
    if (!currentSession) return;

    setLoading(true);
    setError(null);

    try {
      // Update session status to completed
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', currentSession.id);

      if (updateError) throw updateError;

      // Insert final selection
      const { error: finalError } = await supabase.from('final_selections').insert({
        session_id: currentSession.id,
        restaurant_id: restaurantId,
        completed_at: new Date().toISOString(),
      });

      if (finalError) throw finalError;

      // Update the current session
      setCurrentSession({
        ...currentSession,
        status: 'completed',
        completed_at: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create the value object
  const value = {
    currentSession,
    restaurants,
    matches,
    tournamentMatchups,
    loading,
    error,
    createSession,
    fetchRestaurants,
    swipeRestaurant,
    fetchMatches,
    createTournament,
    voteTournament,
    completeSession,
  };

  // Return the provider
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

// Create a hook to use the session context
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
