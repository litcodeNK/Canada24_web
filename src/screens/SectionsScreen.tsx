import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import type { RootStackParamList } from '../navigation/types';

const SECTIONS = [
  { label: 'Business', color: '#2c3e50', icon: 'trending-up' as const },
  { label: 'Health', color: '#27ae60', icon: 'local-hospital' as const },
  { label: 'Entertainment', color: '#8e44ad', icon: 'movie' as const },
  { label: 'Technology', color: '#2980b9', icon: 'devices' as const },
  { label: 'Sports', color: '#e67e22', icon: 'sports' as const },
  { label: 'Arts', color: '#c0392b', icon: 'palette' as const },
  { label: 'Science', color: '#16a085', icon: 'science' as const },
  { label: 'Indigenous', color: '#d35400', icon: 'public' as const },
  { label: 'World', color: '#7f8c8d', icon: 'language' as const },
  { label: 'Opinion', color: '#1a252f', icon: 'forum' as const },
  { label: 'Politics', color: '#1976D2', icon: 'account-balance' as const },
  { label: 'Environment', color: '#2ecc71', icon: 'eco' as const },
];

export default function SectionsScreen() {
  const { colors } = useApp();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <FlatList
      style={{ backgroundColor: colors.background }}
      data={SECTIONS}
      keyExtractor={item => item.label}
      contentContainerStyle={{ paddingBottom: 24 }}
      ListHeaderComponent={
        <View style={[styles.pageTitleBar, { backgroundColor: colors.primary }]}>
          <Text style={[styles.pageTitle, { color: '#fff' }]}>SECTIONS</Text>
          <Text style={[styles.pageSubtitle, { color: 'rgba(255,255,255,0.75)' }]}>Browse all news categories</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.sectionRow, {
            backgroundColor: colors.surface,
            borderLeftColor: item.color,
            borderBottomColor: colors.divider + '20',
          }]}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('SectionDetail', { section: item.label })}
        >
          <MaterialIcons name={item.icon} size={22} color={item.color} />
          <Text style={[styles.sectionLabel, { color: colors.primaryText }]}>{item.label}</Text>
          <MaterialIcons name="arrow-forward-ios" size={14} color={colors.primary} />
        </TouchableOpacity>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
    />
  );
}

const styles = StyleSheet.create({
  pageTitleBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 8,
  },
  pageTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 32,
    letterSpacing: 1,
  },
  pageSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  sectionLabel: { flex: 1, fontSize: 17, fontWeight: '700' },
});
