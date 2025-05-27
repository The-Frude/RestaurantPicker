import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../providers/auth-provider';
import { useSession } from '../../providers/session-provider';
import { RootStackParamList } from '../../lib/types';
import { supabase } from '../../lib/supabase/client';

type PairingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Pairing'>;

const PairingScreen: React.FC = () => {
  const navigation = useNavigation<PairingScreenNavigationProp>();
  const { user } = useAuth();
  const { createSession, loading, error } = useSession();
  const [partnerCode, setPartnerCode] = useState('');
  const [myCode, setMyCode] = useState('');
  const [loadingPartner, setLoadingPartner] = useState(false);

  useEffect(() => {
    if (user) {
      // Generate a pairing code based on the user's ID
      setMyCode(user.id.substring(0, 8));
    }
  }, [user]);

  const handleCreateSession = async () => {
    if (!partnerCode) {
      Alert.alert('Error', 'Please enter your partner\'s code');
      return;
    }

    setLoadingPartner(true);

    try {
      // Find the partner user by their pairing code
      const { data, error: findError } = await supabase
        .from('users')
        .select('id')
        .filter('id', 'ilike', `${partnerCode}%`)
        .limit(1)
        .single();

      if (findError || !data) {
        Alert.alert('Error', 'Partner not found. Please check the code and try again.');
        setLoadingPartner(false);
        return;
      }

      const partnerId = data.id;

      // Create a new session with the partner
      const session = await createSession(partnerId);

      if (session) {
        // Navigate to the swipe screen
        navigation.navigate('Swipe');
      } else {
        Alert.alert('Error', error || 'Failed to create session');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoadingPartner(false);
    }
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join me on Chicken Tinder! My pairing code is: ${myCode}`,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pair with Partner</Text>
      <Text style={styles.subtitle}>Connect with your dining companion</Text>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Your Pairing Code:</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{myCode}</Text>
        </View>
        <TouchableOpacity style={styles.shareButton} onPress={handleShareCode}>
          <Text style={styles.shareButtonText}>Share Code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.form}>
        <Text style={styles.inputLabel}>Enter Partner's Code:</Text>
        <TextInput
          style={styles.input}
          placeholder="Partner's code"
          value={partnerCode}
          onChangeText={setPartnerCode}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateSession}
          disabled={loading || loadingPartner}
        >
          {loading || loadingPartner ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Start Session</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff6b6b',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#666',
  },
  codeContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
    alignSelf: 'flex-start',
  },
  codeBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#ff6b6b',
  },
  shareButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    padding: 10,
    width: '50%',
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    maxWidth: 400,
    marginVertical: 30,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PairingScreen;
