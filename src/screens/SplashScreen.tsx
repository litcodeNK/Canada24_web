import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  StatusBar, Dimensions,
} from 'react-native';

const APP_LOGO = require('../../assets/icon.png');
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />

      {/* Background Canada map */}
      <View style={styles.mapContainer} pointerEvents="none">
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Canada_blank_map.svg/1200px-Canada_blank_map.svg.png' }}
          style={styles.mapImage}
          resizeMode="contain"
          tintColor="rgba(255,255,255,0.18)"
        />
      </View>

      {/* Decorative diagonal stripes */}
      <View style={[styles.stripe, { top: 40, width: 200, height: 4, transform: [{ rotate: '30deg' }] }]} />
      <View style={[styles.stripe, { bottom: 60, right: 0, width: 150, height: 8, transform: [{ rotate: '30deg' }] }]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Welcome */}
        <View style={styles.welcomeBlock}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeSubtitle}>to Canada's news app.</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoBlock}>
          <View style={styles.logoRow}>
            <View style={styles.iconBox}>
              <Image source={APP_LOGO} style={{ width: 48, height: 48 }} resizeMode="contain" />
            </View>
            <Text style={styles.logoText}>CANADA</Text>
          </View>
          <Text style={styles.logo247}>24/7 NEWS</Text>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomBlock}>
          <Text style={styles.tagline}>
            News and analysis of the stories that matter most to Canadians.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('RegionSelection')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>OK, LET'S GO!</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1976D2',
    overflow: 'hidden',
  },
  mapContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapImage: {
    width: width * 0.9,
    height: width * 0.6,
  },
  stripe: {
    position: 'absolute',
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingVertical: 48,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeBlock: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 64,
    color: '#FFFFFF',
    lineHeight: 58,
    letterSpacing: 1,
  },
  welcomeSubtitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoBlock: {
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 42,
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  logo247: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 32,
    color: '#FFFFFF',
    letterSpacing: 4,
    lineHeight: 30,
  },
  bottomBlock: {
    alignItems: 'center',
    gap: 48,
    width: '100%',
  },
  tagline: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 25,
    paddingHorizontal: 24,
  },
  ctaButton: {
    width: 280,
    height: 56,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  ctaText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    color: '#000000',
    letterSpacing: 1,
  },
});
