import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { TRENDING_VIDEOS, NATIONAL_VIDEOS, type VideoItem } from '../data/newsData';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 200;

function VideoCard({ item, colors }: { item: VideoItem; colors: ReturnType<typeof useApp>['colors'] }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      style={[styles.videoCard, { marginRight: 12 }]}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('VideoPlayer', { item })}
    >
      <View style={styles.videoThumbContainer}>
        <Image source={{ uri: item.imgUrl }} style={styles.videoThumb} resizeMode="cover" />
        <View style={styles.videoOverlay} />

        {/* Play button */}
        <View style={styles.playCircle}>
          <MaterialIcons name="play-circle-outline" size={40} color="rgba(255,255,255,0.9)" />
        </View>

        {/* Live / Coming Up badge */}
        {item.isLive && (
          <View style={[styles.liveBadge, item.liveText === 'COMING UP' && styles.comingUpBadge]}>
            <Text style={styles.liveBadgeText}>{item.liveText || 'LIVE'}</Text>
          </View>
        )}

        {/* Duration */}
        {item.showDuration && item.duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.videoTitle, { color: colors.primaryText }]} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={[styles.videoDate, { color: colors.primary }]}>{item.date}</Text>
    </TouchableOpacity>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle: string;
  linkText: string;
  colors: ReturnType<typeof useApp>['colors'];
}

function SectionHeader({ title, subtitle, linkText, colors }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>{title}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.primaryText }]}>{subtitle}</Text>
      </View>
      <TouchableOpacity>
        <Text style={[styles.sectionLink, { color: colors.primary }]}>{linkText}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function VideoFeedScreen() {
  const { colors } = useApp();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Trending Videos */}
      <SectionHeader
        title="Trending Video"
        subtitle="Featured video from today's big stories"
        linkText="More Live Video"
        colors={colors}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}
      >
        {TRENDING_VIDEOS.map(item => <VideoCard key={item.id} item={item} colors={colors} />)}
      </ScrollView>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.secondary }]} />

      {/* The National */}
      <SectionHeader
        title="The National"
        subtitle="The flagship nightly newscast from Canada 24/7"
        linkText="More Trending Video"
        colors={colors}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24, gap: 12 }}
      >
        {NATIONAL_VIDEOS.map(item => <VideoCard key={item.id} item={item} colors={colors} />)}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 0.5,
  },
  sectionSubtitle: { fontSize: 13, fontWeight: '700', opacity: 0.6 },
  sectionLink: { fontSize: 12, fontWeight: '700' },
  videoCard: { width: CARD_WIDTH },
  videoThumbContainer: { height: 130, position: 'relative', marginBottom: 8 },
  videoThumb: { width: '100%', height: '100%' },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  playCircle: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 8, left: 8,
    backgroundColor: '#1976D2',
    paddingHorizontal: 6, paddingVertical: 2,
  },
  comingUpBadge: {
    backgroundColor: '#1a1a1a',
  },
  liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  durationBadge: {
    position: 'absolute',
    bottom: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6, paddingVertical: 2,
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  videoTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  videoDate: { fontSize: 11, fontWeight: '700', marginTop: 4 },
  divider: { height: 2, marginHorizontal: 0, marginVertical: 16 },
});
