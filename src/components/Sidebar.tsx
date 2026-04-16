import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Image, ScrollView,
} from 'react-native';

const APP_LOGO = require('../../assets/icon.png');
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, width * 0.85);

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const NAV_ITEMS = [
  { icon: 'near-me' as const, label: 'Manage My Regions', screen: 'ManageRegions' },
  { icon: 'notifications' as const, label: 'Manage My Alerts', screen: 'AlertSetup' },
  { icon: 'settings' as const, label: 'Settings', screen: 'Settings' },
];

const EXTERNAL_LINKS: { label: string; icon: keyof typeof MaterialIcons.glyphMap; section: string }[] = [
  { label: 'Canada 24/7 Gem',       icon: 'movie',         section: 'Entertainment' },
  { label: 'Canada 24/7 Listen',    icon: 'headphones',    section: 'Arts' },
  { label: 'Canada 24/7 Sports',    icon: 'sports',        section: 'Sports' },
  { label: 'Canada International',  icon: 'language',      section: 'World' },
];

export default function Sidebar({ visible, onClose, onNavigate }: SidebarProps) {
  const { colors } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      {/* Backdrop */}
      <TouchableOpacity
        style={[styles.backdrop]}
        onPress={onClose}
        activeOpacity={1}
      />

      {/* Drawer */}
      <View style={[styles.drawer, { backgroundColor: colors.surface, width: DRAWER_WIDTH }]}>
        {/* Header image */}
        <View style={styles.headerImage}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400' }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.headerOverlay} />
          <View style={styles.headerContent}>
            <Text style={styles.headerDesc}>Latest News from Across Canada</Text>
            <Text style={styles.headerBody}>Updates on major national stories and international events.</Text>
            <View style={styles.logoRow}>
              <View style={[styles.logoBox, { backgroundColor: '#F5F5F5', borderColor: '#000' }]}>
                <Image source={APP_LOGO} style={{ width: 44, height: 44 }} resizeMode="contain" />
              </View>
              <Text style={styles.appName}>Canada 24/7</Text>
            </View>
          </View>
        </View>

        <ScrollView>
          {/* Nav items */}
          {NAV_ITEMS.map(({ icon, label, screen }) => (
            <TouchableOpacity
              key={label}
              style={[styles.navItem, { borderBottomColor: colors.divider + '20' }]}
              onPress={() => { onClose(); onNavigate(screen); }}
              activeOpacity={0.7}
            >
              <MaterialIcons name={icon} size={22} color={colors.primary} />
              <Text style={[styles.navLabel, { color: colors.primaryText }]}>{label}</Text>
            </TouchableOpacity>
          ))}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.divider + '30' }]} />

          {/* More from */}
          <View style={styles.morePadding}>
            <Text style={[styles.moreLabel, { color: colors.secondaryText }]}>
              MORE FROM CANADA 24/7
            </Text>
          </View>
          {EXTERNAL_LINKS.map(({ label, icon, section }) => (
            <TouchableOpacity
              key={label}
              style={[styles.externalItem, { borderBottomColor: colors.divider + '18' }]}
              activeOpacity={0.7}
              onPress={() => {
                onClose();
                navigation.navigate('SectionDetail', { section });
              }}
            >
              <View style={[styles.extIcon, { backgroundColor: colors.primary }]}>
                <MaterialIcons name={icon} size={20} color="#fff" />
              </View>
              <Text style={[styles.extLabel, { color: colors.primaryText }]}>{label}</Text>
              <MaterialIcons name="arrow-forward-ios" size={13} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom stripe */}
        <View style={[styles.bottomStripe, { backgroundColor: colors.primary, overflow: 'hidden' }]}>
          <View style={[styles.stripeBand, { backgroundColor: colors.primaryText }]}>
            <Text style={[styles.stripeText, { color: colors.background, opacity: 0.5 }]}>
              TRUTH 24/7
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  drawer: {
    position: 'absolute',
    top: 0, left: 0, bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  headerImage: {
    height: 180,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  headerContent: {
    padding: 20,
    gap: 4,
  },
  headerDesc: {
    color: '#F5F5F5',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  headerBody: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    color: '#F5F5F5',
    letterSpacing: 0.5,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  navLabel: { fontSize: 15, fontWeight: '700' },
  divider: { height: 1, marginVertical: 16 },
  morePadding: { paddingHorizontal: 24, paddingBottom: 8 },
  moreLabel: { fontSize: 13, fontWeight: '900' },
  externalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  extIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extLabel: { flex: 1, fontSize: 14, fontWeight: '700' },
  bottomStripe: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stripeBand: {
    position: 'absolute',
    width: '150%',
    height: 32,
    transform: [{ rotate: '30deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripeText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 13,
    letterSpacing: 3,
  },
});
