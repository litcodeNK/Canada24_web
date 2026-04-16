import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

function ToggleRow({ title, subtitle, value, onToggle, colors }: {
  title: string; subtitle: string; value: boolean; onToggle: () => void;
  colors: ReturnType<typeof useApp>['colors'];
}) {
  return (
    <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderBottomColor: colors.divider + '20' }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[styles.toggleTitle, { color: colors.primaryText }]}>{title}</Text>
        <Text style={[styles.toggleSubtitle, { color: colors.primaryText }]}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#ccc', true: colors.primary }}
        thumbColor="#fff"
        ios_backgroundColor="#ccc"
      />
    </View>
  );
}

function SectionHead({ title, colors }: { title: string; colors: ReturnType<typeof useApp>['colors'] }) {
  return (
    <View style={[styles.sectionHead, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionHeadText, { color: colors.primaryText }]}>{title}</Text>
    </View>
  );
}

function LinkRow({ title, colors }: { title: string; colors: ReturnType<typeof useApp>['colors'] }) {
  return (
    <TouchableOpacity style={[styles.linkRow, { backgroundColor: colors.surface, borderBottomColor: colors.divider + '20' }]}>
      <Text style={[styles.toggleTitle, { color: colors.primaryText, flex: 1 }]}>{title}</Text>
      <MaterialIcons name="arrow-forward-ios" size={14} color={colors.primary} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    colors, darkMode, compactLayout, allowStorySwiping,
    useDefaultTextSize, textScale, allowBackgroundAudio,
    toggleDarkMode, toggleCompactLayout, toggleStorySwiping,
    toggleDefaultTextSize, setTextScale, toggleBackgroundAudio,
  } = useApp();
  const { user, signOut } = useAuth();


  const previewFontSize = 13 + Math.round(textScale * 12);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.primaryText }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="close" size={28} color={colors.primaryText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.primaryText }]}>SETTINGS</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* CUSTOMIZE THEME */}
        <SectionHead title="CUSTOMIZE THEME" colors={colors} />
        <ToggleRow title="Compact Layout" subtitle="See more stories with smaller photos." value={compactLayout} onToggle={toggleCompactLayout} colors={colors} />
        <ToggleRow title="Enable Dark" subtitle="Switch to a dark background with light text." value={darkMode} onToggle={toggleDarkMode} colors={colors} />
        <ToggleRow title="Allow Story Swiping" subtitle="Flip back and forth between stories in a lineup by dragging from right to left." value={allowStorySwiping} onToggle={toggleStorySwiping} colors={colors} />
        <ToggleRow title="Use Default Text Size" subtitle="Toggle off to make text larger or smaller." value={useDefaultTextSize} onToggle={toggleDefaultTextSize} colors={colors} />

        {/* Text scale slider */}
        <View style={[styles.sliderSection, { backgroundColor: colors.surface, opacity: useDefaultTextSize ? 0.4 : 1 }]}>
          <View style={styles.sliderRow}>
            <Text style={[styles.sliderA, { color: colors.secondaryText }]}>A</Text>
            <Slider
              style={{ flex: 1, marginHorizontal: 8 }}
              minimumValue={0}
              maximumValue={1}
              step={0.05}
              value={textScale}
              onValueChange={setTextScale}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor="#ccc"
              thumbTintColor={colors.primary}
              disabled={useDefaultTextSize}
            />
            <Text style={[styles.sliderALarge, { color: colors.primaryText }]}>A</Text>
          </View>
          {/* Preview box */}
          <View style={[styles.previewBox, { borderColor: colors.primaryText, backgroundColor: colors.background }]}>
            <Text style={[styles.previewTitle, { color: colors.primaryText, fontSize: previewFontSize + 2 }]}>
              Welcome to the Canada 24/7 app
            </Text>
            <Text style={[styles.previewBody, { color: colors.secondaryText, fontSize: previewFontSize }]}>
              From breaking news alerts to in-depth coverage, Canada 24/7 is a fast and easy way to catch up on what's happening in your local area, in Canada, and the World.
            </Text>
          </View>
        </View>

        {/* MEDIA PLAYER */}
        <SectionHead title="MEDIA PLAYER PREFERENCE" colors={colors} />
        <ToggleRow title="Allow background audio" subtitle="Listen to audio playback while you use other apps or when the screen is locked." value={allowBackgroundAudio} onToggle={toggleBackgroundAudio} colors={colors} />

        {/* ACCOUNT */}
        <SectionHead title="ACCOUNT" colors={colors} />
        {user ? (
          <>
            <View style={[styles.toggleRow, { backgroundColor: colors.surface, borderBottomColor: colors.divider + '20' }]}>
              <MaterialIcons name="account-circle" size={22} color={colors.primary} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.toggleTitle, { color: colors.primaryText }]}>{user.displayName}</Text>
                <Text style={[styles.toggleSubtitle, { color: colors.primaryText }]}>{user.email}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.linkRow, { backgroundColor: colors.surface, borderBottomColor: colors.divider + '20' }]}
              onPress={async () => { await signOut(); }}
            >
              <MaterialIcons name="logout" size={20} color="#D32F2F" style={{ marginRight: 12 }} />
              <Text style={[styles.toggleTitle, { color: '#D32F2F', flex: 1 }]}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.linkRow, { backgroundColor: colors.surface, borderBottomColor: colors.divider + '20' }]}
            onPress={() => navigation.navigate('AuthEmail')}
          >
            <MaterialIcons name="login" size={20} color={colors.primary} style={{ marginRight: 12 }} />
            <Text style={[styles.toggleTitle, { color: colors.primary, flex: 1 }]}>Sign In / Create Account</Text>
            <MaterialIcons name="arrow-forward-ios" size={14} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* GENERAL */}
        <SectionHead title="GENERAL" colors={colors} />
        <LinkRow title="Send us your Feedback" colors={colors} />
        <LinkRow title="About Canada 24/7" colors={colors} />

        {/* Bottom branded stripe */}
        <View style={[styles.bottomStripe, { backgroundColor: colors.primary, marginTop: 64 }]}>
          <View style={[styles.stripeBand, { backgroundColor: colors.primaryText }]}>
            <Text style={[styles.stripeText, { color: colors.background }]}>
              REVOLUTIONARY NEWS • 24/7 • CANADA
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 4,
  },
  headerTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
  },
  sectionHead: {
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 6,
  },
  sectionHeadText: { fontSize: 13, fontWeight: '900', opacity: 0.6 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 32,
    marginBottom: 2,
    borderBottomWidth: 1,
  },
  toggleTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  toggleSubtitle: { fontSize: 13, fontWeight: '700', opacity: 0.6, lineHeight: 18 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 32,
    marginBottom: 2,
    borderBottomWidth: 1,
  },
  sliderSection: { padding: 32, marginBottom: 2 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sliderA: { fontSize: 12, fontWeight: '700' },
  sliderALarge: { fontSize: 22, fontWeight: '900' },
  previewBox: {
    borderWidth: 2,
    padding: 24,
    gap: 8,
  },
  previewTitle: { fontWeight: '900', lineHeight: 22 },
  previewBody: { fontWeight: '700', lineHeight: 20, opacity: 0.7 },
  bottomStripe: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stripeBand: {
    position: 'absolute',
    width: '200%',
    height: 36,
    transform: [{ rotate: '-30deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripeText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 13,
    letterSpacing: 3,
    opacity: 0.5,
  },
});
