import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Dimensions, RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { TOP_STORIES, TOP_STORIES_SUBITEMS } from '../data/newsData';
import { requireAuth } from '../utils/requireAuth';
import type { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface NewsItemRowProps {
  headline: string;
  category?: string;
  isLive?: boolean;
  textColor: string;
}

function NewsItemRow({ headline, category, isLive, textColor }: NewsItemRowProps) {
  return (
    <View style={styles.subItemRow}>
      {isLive && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
      )}
      {category && !isLive && (
        <Text style={styles.categoryLabel}>{category}</Text>
      )}
      <Text style={[styles.subItemHeadline, { color: textColor }]} numberOfLines={2}>
        {headline}
      </Text>
    </View>
  );
}

interface NewsCardProps {
  article: typeof TOP_STORIES[0];
  compact?: boolean;
}

function NewsCard({ article, compact }: NewsCardProps) {
  const { colors, toggleSaveArticle, isArticleSaved } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const saved = isArticleSaved(article.id);
  const imgHeight = compact ? 100 : 180;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ArticleDetail', { article })}
      activeOpacity={0.85}
      style={[styles.newsCard, { backgroundColor: colors.surface, borderColor: colors.primaryText }]}
    >
      {/* Image */}
      <View style={{ height: imgHeight }}>
        <Image
          source={{ uri: article.imgUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        {article.duration && (
          <View style={styles.durationBadge}>
            <MaterialIcons name="play-arrow" size={14} color="#fff" />
            <Text style={styles.durationText}>{article.duration}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={() => toggleSaveArticle(article)}
        >
          <MaterialIcons
            name={saved ? 'bookmark' : 'bookmark-border'}
            size={22}
            color={saved ? colors.primary : '#fff'}
          />
        </TouchableOpacity>
      </View>
      {/* Meta */}
      <View style={styles.cardMeta}>
        {article.category ? (
          <Text style={[styles.cardCategory, { color: colors.primary }]}>
            {article.category} ·{' '}
          </Text>
        ) : null}
        <Text style={[styles.cardTime, { color: colors.primaryText }]}>{article.time}</Text>
      </View>
      <Text style={[styles.cardHeadline, { color: colors.primaryText }]}>{article.headline}</Text>
    </TouchableOpacity>
  );
}

export default function TopStoriesScreen() {
  const { colors, compactLayout, toggleSaveArticle, isArticleSaved, topStories, loadingNews, refreshNews } = useApp();
  const { user, userPosts } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [followed, setFollowed] = useState(false);

  const stories = topStories.length > 0 ? topStories : TOP_STORIES;
  const hero = stories[0];
  const heroSaved = isArticleSaved(hero.id);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
      refreshControl={
        <RefreshControl
          refreshing={loadingNews}
          onRefresh={refreshNews}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* COVID banner */}
      <TouchableOpacity
        style={[styles.covidBanner, {
          backgroundColor: colors.surface,
          borderColor: colors.primaryText,
          shadowColor: '#000',
        }]}
        activeOpacity={0.8}
      >
        <Text style={[styles.covidText, { color: colors.primaryText }]}>COVID-19 Updates</Text>
        <MaterialIcons name="arrow-forward-ios" size={16} color={colors.primary} />
      </TouchableOpacity>

      {/* Featured card with sub-items */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => navigation.navigate('ArticleDetail', { article: hero })}
        style={[styles.featuredCard, { backgroundColor: colors.surface, borderColor: colors.primaryText }]}
      >
        {/* Hero image */}
        <View style={{ height: 220, position: 'relative' }}>
          <Image
            source={{ uri: hero.imgUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          {/* Duration */}
          {hero.duration ? (
            <View style={styles.durationBadge}>
              <MaterialIcons name="play-arrow" size={14} color="#fff" />
              <Text style={styles.durationText}>{hero.duration}</Text>
            </View>
          ) : null}
          {/* URGENT tag */}
          <View style={styles.urgentTag}>
            <Text style={[styles.urgentText, { color: colors.background }]}>URGENT</Text>
          </View>
          {/* Bookmark */}
          <TouchableOpacity
            style={styles.bookmarkBtn}
            onPress={(e) => { e.stopPropagation?.(); toggleSaveArticle(hero); }}
          >
            <MaterialIcons
              name={heroSaved ? 'bookmark' : 'bookmark-border'}
              size={22}
              color={heroSaved ? colors.primary : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {/* Headline */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <Text style={[styles.featuredTime, { color: colors.primary }]}>{hero.time}</Text>
          <Text style={[styles.featuredHeadline, { color: colors.primaryText }]}>
            {hero.headline}
          </Text>
        </View>

        {/* Sub-items */}
        <View style={{ padding: 16, gap: 12 }}>
          {TOP_STORIES_SUBITEMS.map(item => (
            <NewsItemRow
              key={item.id}
              headline={item.headline}
              category={item.category}
              isLive={item.isLive}
              textColor={colors.primaryText}
            />
          ))}
        </View>

        {/* Follow Story */}
        <View style={{ padding: 16, paddingTop: 0, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.followBtn, { backgroundColor: followed ? colors.secondary : colors.primary }]}
            onPress={(e) => { e.stopPropagation?.(); requireAuth(user, navigation, () => setFollowed(!followed)); }}
            activeOpacity={0.85}
          >
            <MaterialIcons name="notifications-active" size={20} color="#fff" />
            <Text style={styles.followBtnText}>
              {followed ? 'Following Story' : 'Follow Story'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Latest News header */}
      <View style={[styles.latestHeader, { backgroundColor: colors.primary }]}>
        <Text style={[styles.latestHeaderText, { color: colors.background }]}>LATEST NEWS</Text>
      </View>

      {/* Community posts */}
      {userPosts.length > 0 && (
        <>
          <View style={[styles.communityHeader, { backgroundColor: colors.secondary }]}>
            <MaterialIcons name="people" size={18} color={colors.background} />
            <Text style={[styles.communityHeaderText, { color: colors.background }]}>COMMUNITY STORIES</Text>
          </View>
          {userPosts.map(post => (
            <TouchableOpacity
              key={post.id}
              style={[styles.communityCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ArticleDetail', { article: post })}
            >
              <View style={[styles.communityBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.communityBadgeText}>COMMUNITY</Text>
              </View>
              {post.imgUrl ? (
                <Image source={{ uri: post.imgUrl }} style={styles.communityThumb} resizeMode="cover" />
              ) : null}
              <View style={{ padding: 12 }}>
                <Text style={[styles.communityCategory, { color: colors.primary }]}>{post.category}</Text>
                <Text style={[styles.communityHeadline, { color: colors.primaryText }]} numberOfLines={3}>
                  {post.headline}
                </Text>
                <View style={styles.communityAuthorRow}>
                  <View style={[styles.communityAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.communityAvatarText}>{post.authorName?.[0]?.toUpperCase()}</Text>
                  </View>
                  <Text style={[styles.communityAuthor, { color: colors.hint }]}>
                    {post.authorName} · {post.time}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Rest of news */}
      {stories.slice(1).map(article => (
        <View key={article.id} style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <NewsCard article={article} compact={compactLayout} />
        </View>
      ))}
    </ScrollView>

    {/* Floating post button */}
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: colors.primary }]}
      onPress={() => requireAuth(user, navigation, () => navigation.navigate('CreatePost'))}
      activeOpacity={0.85}
    >
      <MaterialIcons name="edit" size={24} color="#fff" />
      <Text style={styles.fabText}>POST NEWS</Text>
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  covidBanner: {
    margin: 16,
    padding: 16,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  covidText: { fontSize: 17, fontWeight: '900' },
  featuredCard: {
    marginHorizontal: 16,
    marginBottom: 0,
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    paddingHorizontal: 8, paddingVertical: 3,
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  durationText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  bookmarkBtn: {
    position: 'absolute',
    top: 8, right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 6,
  },
  urgentTag: {
    position: 'absolute',
    top: 10, right: -8,
    backgroundColor: '#1976D2',
    paddingHorizontal: 12, paddingVertical: 3,
    transform: [{ rotate: '-3deg' }],
  },
  urgentText: { fontSize: 11, fontWeight: '900' },
  featuredTime: { fontSize: 11, fontWeight: '900', marginBottom: 4 },
  featuredHeadline: { fontSize: 19, fontWeight: '900', lineHeight: 24 },
  subItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  liveBadge: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 6, paddingVertical: 2,
    marginTop: 2, flexShrink: 0,
  },
  liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  categoryLabel: { color: '#1976D2', fontSize: 11, fontWeight: '900', marginTop: 2 },
  subItemHeadline: { flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  followBtnText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 0.5,
  },
  latestHeader: {
    padding: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  latestHeaderText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 22,
    letterSpacing: 1,
  },
  newsCard: {
    borderWidth: 2,
    overflow: 'hidden',
  },
  cardMeta: { flexDirection: 'row', padding: 12, paddingBottom: 4 },
  cardCategory: { fontSize: 11, fontWeight: '900' },
  cardTime: { fontSize: 11, fontWeight: '700', opacity: 0.6 },
  cardHeadline: { fontSize: 15, fontWeight: '700', paddingHorizontal: 12, paddingBottom: 12, lineHeight: 20 },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  communityHeaderText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    letterSpacing: 1,
  },
  communityCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 2,
    overflow: 'hidden',
  },
  communityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 10,
    marginLeft: 12,
  },
  communityBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  communityThumb: { width: '100%', height: 140 },
  communityCategory: { fontSize: 10, fontWeight: '900', marginBottom: 4 },
  communityHeadline: { fontSize: 15, fontWeight: '700', lineHeight: 21, marginBottom: 10 },
  communityAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  communityAvatar: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  communityAvatarText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  communityAuthor: { fontSize: 12, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1,
  },
});
