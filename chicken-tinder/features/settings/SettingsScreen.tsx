import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../../providers/auth-provider';
import { RootStackParamList } from '../../lib/types';
import { supabase } from '../../lib/supabase/client';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user, signOut } = useAuth();
  
  // Notification settings
  const [notifyNewSession, setNotifyNewSession] = useState(true);
  const [notifyTournamentTurn, setNotifyTournamentTurn] = useState(true);
  const [notifyMatchResult, setNotifyMatchResult] = useState(true);
  
  // Filter preferences
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10); // miles
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  
  const handleViewHistory = () => {
    navigation.navigate('History');
  };
  
  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            notifications: {
              newSession: notifyNewSession,
              tournamentTurn: notifyTournamentTurn,
              matchResult: notifyMatchResult,
            },
            filters: {
              openNow: openNowOnly,
              maxDistance: maxDistance,
            },
          },
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Customize your experience</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContent}>
          <View style={styles.accountInfo}>
            <Text style={styles.accountEmail}>{user?.email}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.historyButton} 
            onPress={handleViewHistory}
          >
            <Text style={styles.historyButtonText}>View Match History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.signOutButton} 
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>New session invites</Text>
            <Switch
              value={notifyNewSession}
              onValueChange={setNotifyNewSession}
              trackColor={{ false: '#ddd', true: '#ff6b6b' }}
              thumbColor={notifyNewSession ? '#fff' : '#fff'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Your turn in tournament</Text>
            <Switch
              value={notifyTournamentTurn}
              onValueChange={setNotifyTournamentTurn}
              trackColor={{ false: '#ddd', true: '#ff6b6b' }}
              thumbColor={notifyTournamentTurn ? '#fff' : '#fff'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Final match results</Text>
            <Switch
              value={notifyMatchResult}
              onValueChange={setNotifyMatchResult}
              trackColor={{ false: '#ddd', true: '#ff6b6b' }}
              thumbColor={notifyMatchResult ? '#fff' : '#fff'}
            />
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Filters</Text>
        <View style={styles.sectionContent}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Only show open restaurants</Text>
            <Switch
              value={openNowOnly}
              onValueChange={setOpenNowOnly}
              trackColor={{ false: '#ddd', true: '#ff6b6b' }}
              thumbColor={openNowOnly ? '#fff' : '#fff'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Maximum distance</Text>
            <View style={styles.distanceSelector}>
              <TouchableOpacity
                style={[
                  styles.distanceOption,
                  maxDistance === 5 && styles.distanceOptionSelected,
                ]}
                onPress={() => setMaxDistance(5)}
              >
                <Text
                  style={[
                    styles.distanceOptionText,
                    maxDistance === 5 && styles.distanceOptionTextSelected,
                  ]}
                >
                  5 mi
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.distanceOption,
                  maxDistance === 10 && styles.distanceOptionSelected,
                ]}
                onPress={() => setMaxDistance(10)}
              >
                <Text
                  style={[
                    styles.distanceOptionText,
                    maxDistance === 10 && styles.distanceOptionTextSelected,
                  ]}
                >
                  10 mi
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.distanceOption,
                  maxDistance === 20 && styles.distanceOptionSelected,
                ]}
                onPress={() => setMaxDistance(20)}
              >
                <Text
                  style={[
                    styles.distanceOptionText,
                    maxDistance === 20 && styles.distanceOptionTextSelected,
                  ]}
                >
                  20 mi
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Chicken Tinder v1.0.0</Text>
      </View>
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
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 20,
  },
  accountInfo: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  accountEmail: {
    fontSize: 16,
    color: '#333',
  },
  historyButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  historyButtonText: {
    fontSize: 16,
    color: '#4a90e2',
  },
  signOutButton: {
    paddingVertical: 15,
  },
  signOutButtonText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  distanceSelector: {
    flexDirection: 'row',
  },
  distanceOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginLeft: 8,
  },
  distanceOptionSelected: {
    backgroundColor: '#ff6b6b',
  },
  distanceOptionText: {
    fontSize: 14,
    color: '#333',
  },
  distanceOptionTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#ff6b6b',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
