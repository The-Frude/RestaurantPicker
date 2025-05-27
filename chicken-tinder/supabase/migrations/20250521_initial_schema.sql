-- Create schema for Chicken Tinder app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  partner_id UUID REFERENCES users(id),
  preferences JSONB DEFAULT '{
    "notifications": {
      "newSession": true,
      "tournamentTurn": true,
      "matchResult": true
    },
    "filters": {
      "cuisineTypes": [],
      "priceRange": ["$", "$$", "$$$"],
      "distanceRadius": 10,
      "openNow": false
    }
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table (dining decision sessions)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID NOT NULL REFERENCES users(id),
  user2_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('swiping', 'tournament', 'completed')),
  current_round INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Ensure user1 and user2 are different
  CONSTRAINT different_users CHECK (user1_id <> user2_id)
);

-- Restaurants table (from external APIs)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  cuisine_type TEXT,
  rating NUMERIC,
  price_level TEXT,
  distance NUMERIC,
  image_url TEXT,
  address TEXT,
  coordinates JSONB,
  order_url TEXT,
  data JSONB, -- Additional data from API
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure external_id is unique
  CONSTRAINT unique_external_id UNIQUE (external_id)
);

-- Swipes table (user swipe actions)
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  user_id UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  is_liked BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one swipe per user per restaurant per session
  CONSTRAINT unique_swipe UNIQUE (session_id, user_id, restaurant_id)
);

-- Matches table (restaurants both users liked)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  round_number INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one match per restaurant per session
  CONSTRAINT unique_match UNIQUE (session_id, restaurant_id)
);

-- Tournament matchups table
CREATE TABLE tournament_matchups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  round_number INT NOT NULL,
  restaurant1_id UUID NOT NULL REFERENCES restaurants(id),
  restaurant2_id UUID NOT NULL REFERENCES restaurants(id),
  winner_id UUID REFERENCES restaurants(id),
  user_turn_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure restaurants are different
  CONSTRAINT different_restaurants CHECK (restaurant1_id <> restaurant2_id)
);

-- Final selections table (winning restaurants)
CREATE TABLE final_selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) UNIQUE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  completed_at TIMESTAMPTZ NOT NULL,
  user_notes TEXT,
  rating INT CHECK (rating BETWEEN 1 AND 5)
);

-- Create indexes for performance
CREATE INDEX idx_sessions_users ON sessions(user1_id, user2_id);
CREATE INDEX idx_swipes_session_user ON swipes(session_id, user_id);
CREATE INDEX idx_swipes_restaurant ON swipes(restaurant_id);
CREATE INDEX idx_matches_session ON matches(session_id);
CREATE INDEX idx_tournament_session_round ON tournament_matchups(session_id, round_number);
CREATE INDEX idx_final_selections_restaurant ON final_selections(restaurant_id);

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_selections ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Sessions policies
CREATE POLICY "Users can view sessions they are part of"
  ON sessions FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can insert sessions they are part of"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update sessions they are part of"
  ON sessions FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Restaurants policies (public read)
CREATE POLICY "Anyone can view restaurants"
  ON restaurants FOR SELECT
  USING (true);

-- Swipes policies
CREATE POLICY "Users can view their own swipes"
  ON swipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own swipes"
  ON swipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Matches policies
CREATE POLICY "Users can view matches for their sessions"
  ON matches FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = matches.session_id
    AND (sessions.user1_id = auth.uid() OR sessions.user2_id = auth.uid())
  ));

-- Tournament matchups policies
CREATE POLICY "Users can view tournament matchups for their sessions"
  ON tournament_matchups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = tournament_matchups.session_id
    AND (sessions.user1_id = auth.uid() OR sessions.user2_id = auth.uid())
  ));

CREATE POLICY "Users can update tournament matchups on their turn"
  ON tournament_matchups FOR UPDATE
  USING (user_turn_id = auth.uid());

-- Final selections policies
CREATE POLICY "Users can view final selections for their sessions"
  ON final_selections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sessions
    WHERE sessions.id = final_selections.session_id
    AND (sessions.user1_id = auth.uid() OR sessions.user2_id = auth.uid())
  ));

-- Create functions and triggers

-- Function to check if a restaurant is a match
CREATE OR REPLACE FUNCTION check_restaurant_match()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new swipe is a like
  IF NEW.is_liked = true THEN
    -- Check if the partner has also liked this restaurant
    IF EXISTS (
      SELECT 1 FROM swipes s
      JOIN sessions sess ON s.session_id = sess.id
      WHERE s.session_id = NEW.session_id
      AND s.restaurant_id = NEW.restaurant_id
      AND s.is_liked = true
      AND s.user_id != NEW.user_id
      AND (sess.user1_id = s.user_id OR sess.user2_id = s.user_id)
    ) THEN
      -- Insert into matches
      INSERT INTO matches (session_id, restaurant_id, round_number)
      VALUES (NEW.session_id, NEW.restaurant_id, (
        SELECT current_round FROM sessions WHERE id = NEW.session_id
      ));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check for matches after a swipe
CREATE TRIGGER after_swipe_insert
AFTER INSERT ON swipes
FOR EACH ROW
EXECUTE FUNCTION check_restaurant_match();

-- Function to update session status when tournament is complete
CREATE OR REPLACE FUNCTION update_session_on_tournament_complete()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the final matchup and a winner was just selected
  IF NEW.winner_id IS NOT NULL AND OLD.winner_id IS NULL THEN
    -- Check if this is the only matchup in the current round
    IF (
      SELECT COUNT(*) FROM tournament_matchups
      WHERE session_id = NEW.session_id
      AND round_number = NEW.round_number
    ) = 1 THEN
      -- Update session to completed
      UPDATE sessions
      SET status = 'completed', completed_at = NOW()
      WHERE id = NEW.session_id;
      
      -- Insert final selection
      INSERT INTO final_selections (session_id, restaurant_id, completed_at)
      VALUES (NEW.session_id, NEW.winner_id, NOW());
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update session when tournament is complete
CREATE TRIGGER after_tournament_update
AFTER UPDATE ON tournament_matchups
FOR EACH ROW
EXECUTE FUNCTION update_session_on_tournament_complete();
