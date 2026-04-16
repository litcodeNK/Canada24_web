import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { useAuth, type UserPost } from '../context/AuthContext';

const CATEGORIES = [
  'Politics', 'Business', 'Health', 'Technology', 'Sports',
  'Entertainment', 'Environment', 'Science', 'World', 'Arts',
  'Indigenous', 'Opinion', 'General',
];

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const { colors } = useApp();
  const { user, addPost } = useAuth();

  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [localImg, setLocalImg] = useState<string | null>(null);
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [imgTab, setImgTab] = useState<'device' | 'url'>('device');

  const canSubmit = headline.trim().length >= 10 && body.trim().length >= 20;
  const finalImage = localImg ?? (imgUrl.trim() || undefined);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library to attach an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setLocalImg(result.assets[0].uri);
      setImgUrl('');
    }
  };

  const handleRemoveImage = () => {
    setLocalImg(null);
    setImgUrl('');
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!canSubmit) {
      Alert.alert('Not enough content', 'Headline must be at least 10 characters and body at least 20 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const now = new Date();
      const post: UserPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        headline: headline.trim(),
        body: body.trim(),
        category: category.toUpperCase(),
        imgUrl: finalImage,
        time: 'Just now',
        isLive: false,
        isUserPost: true,
        authorEmail: user.email,
        authorName: user.displayName,
        createdAt: now.toISOString(),
      };
      await addPost(post);
      Alert.alert('Posted!', 'Your story has been published to Canada 24/7.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>NEW STORY</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.publishBtn, { opacity: canSubmit ? 1 : 0.45 }]}>PUBLISH</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Author badge */}
      <View style={[styles.authorBadge, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarInitial}>{user?.displayName?.[0]?.toUpperCase() ?? 'U'}</Text>
        </View>
        <View>
          <Text style={[styles.authorName, { color: colors.primaryText }]}>{user?.displayName}</Text>
          <Text style={[styles.authorEmail, { color: colors.hint }]}>{user?.email}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>

          {/* Headline */}
          <Text style={[styles.label, { color: colors.primaryText }]}>HEADLINE *</Text>
          <TextInput
            value={headline}
            onChangeText={setHeadline}
            placeholder="Write a clear, descriptive headline..."
            placeholderTextColor={colors.hint}
            style={[styles.headlineInput, { color: colors.primaryText, borderColor: colors.divider + '50', backgroundColor: colors.surface }]}
            multiline
            maxLength={160}
          />
          <Text style={[styles.charCount, { color: colors.hint }]}>{headline.length}/160</Text>

          {/* Category */}
          <Text style={[styles.label, { color: colors.primaryText }]}>CATEGORY *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catChip,
                  { borderColor: colors.primary },
                  category === cat && { backgroundColor: colors.primary },
                ]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catText, { color: category === cat ? '#fff' : colors.primary }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Body */}
          <Text style={[styles.label, { color: colors.primaryText }]}>STORY BODY *</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write the full story here. Include facts, context, and sources where possible..."
            placeholderTextColor={colors.hint}
            style={[styles.bodyInput, { color: colors.primaryText, borderColor: colors.divider + '50', backgroundColor: colors.surface }]}
            multiline
            textAlignVertical="top"
            maxLength={5000}
          />
          <Text style={[styles.charCount, { color: colors.hint }]}>{body.length}/5000</Text>

          {/* Image section */}
          <Text style={[styles.label, { color: colors.primaryText }]}>IMAGE (optional)</Text>

          {/* Tab switcher */}
          <View style={[styles.tabRow, { borderColor: colors.primary }]}>
            <TouchableOpacity
              style={[styles.tab, imgTab === 'device' && { backgroundColor: colors.primary }]}
              onPress={() => { setImgTab('device'); setImgUrl(''); }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="photo-library" size={16} color={imgTab === 'device' ? '#fff' : colors.primary} />
              <Text style={[styles.tabText, { color: imgTab === 'device' ? '#fff' : colors.primary }]}>From Device</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, imgTab === 'url' && { backgroundColor: colors.primary }]}
              onPress={() => { setImgTab('url'); setLocalImg(null); }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="link" size={16} color={imgTab === 'url' ? '#fff' : colors.primary} />
              <Text style={[styles.tabText, { color: imgTab === 'url' ? '#fff' : colors.primary }]}>From URL</Text>
            </TouchableOpacity>
          </View>

          {/* Device picker */}
          {imgTab === 'device' && (
            localImg ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: localImg }} style={styles.previewImg} resizeMode="cover" />
                <TouchableOpacity style={[styles.removeBtn, { backgroundColor: colors.primary }]} onPress={handleRemoveImage}>
                  <MaterialIcons name="close" size={18} color="#fff" />
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.pickBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '0D' }]}
                onPress={handlePickImage}
                activeOpacity={0.75}
              >
                <MaterialIcons name="add-photo-alternate" size={36} color={colors.primary} />
                <Text style={[styles.pickBtnTitle, { color: colors.primary }]}>Tap to select a photo</Text>
                <Text style={[styles.pickBtnSub, { color: colors.hint }]}>JPG, PNG — cropped to 16:9</Text>
              </TouchableOpacity>
            )
          )}

          {/* URL input */}
          {imgTab === 'url' && (
            <View style={[styles.inputRow, { borderColor: colors.divider + '50', backgroundColor: colors.surface }]}>
              <MaterialIcons name="image" size={18} color={colors.hint} style={{ marginRight: 8 }} />
              <TextInput
                value={imgUrl}
                onChangeText={v => { setImgUrl(v); setLocalImg(null); }}
                placeholder="https://..."
                placeholderTextColor={colors.hint}
                style={[styles.urlInput, { color: colors.primaryText }]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {imgUrl.trim().length > 0 && (
                <TouchableOpacity onPress={() => setImgUrl('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="close" size={18} color={colors.hint} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* URL preview */}
          {imgTab === 'url' && imgUrl.trim().length > 8 && (
            <Image
              source={{ uri: imgUrl.trim() }}
              style={styles.urlPreview}
              resizeMode="cover"
            />
          )}

          {/* Guidelines */}
          <View style={[styles.guideBox, { backgroundColor: colors.primary + '10', borderLeftColor: colors.primary }]}>
            <Text style={[styles.guideTitle, { color: colors.primary }]}>Community Guidelines</Text>
            <Text style={[styles.guideText, { color: colors.hint }]}>
              • Share accurate, fact-based news relevant to Canadians{'\n'}
              • Cite sources where possible{'\n'}
              • No misinformation, hate speech, or personal attacks{'\n'}
              • Stories may be reviewed before appearing publicly
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1,
  },
  publishBtn: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 38, height: 38,
    borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 16, fontWeight: '900' },
  authorName: { fontSize: 14, fontWeight: '800' },
  authorEmail: { fontSize: 12, fontWeight: '500' },
  scroll: { padding: 16 },
  label: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 13,
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 16,
  },
  headlineInput: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    borderWidth: 1,
    padding: 12,
    minHeight: 70,
  },
  charCount: { fontSize: 11, fontWeight: '600', textAlign: 'right', marginTop: 4 },
  categoryScroll: { marginBottom: 4 },
  catChip: {
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderRadius: 2,
  },
  catText: { fontSize: 12, fontWeight: '800' },
  bodyInput: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    borderWidth: 1,
    padding: 12,
    minHeight: 160,
  },
  tabRow: {
    flexDirection: 'row',
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  tabText: { fontSize: 13, fontWeight: '800' },
  pickBtn: {
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  pickBtnTitle: { fontSize: 15, fontWeight: '700' },
  pickBtnSub: { fontSize: 12, fontWeight: '500' },
  previewWrap: { position: 'relative' },
  previewImg: { width: '100%', height: 180 },
  removeBtn: {
    position: 'absolute',
    top: 8, right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  removeBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  urlInput: { flex: 1, fontSize: 14, fontWeight: '500' },
  urlPreview: { width: '100%', height: 160, marginTop: 10 },
  guideBox: {
    marginTop: 20,
    padding: 14,
    borderLeftWidth: 3,
  },
  guideTitle: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  guideText: { fontSize: 12, fontWeight: '500', lineHeight: 19 },
});
