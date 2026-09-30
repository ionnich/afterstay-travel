import { Bookmark } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { DiscoverPlaceCard } from '@/components/discover/DiscoverPlaceCard';
import MiniLoader from '@/components/loader/MiniLoader';
import { useTheme } from '@/constants/ThemeContext';
import { mapSavedPlaceToDiscoverPlace } from '@/components/discover/discoverData';
import { getStyles } from '@/components/discover/discoverStyles';
import type { DiscoverState } from '@/components/discover/useDiscover';

export function SavedTab({ d }: { d: DiscoverState }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const {
    savedLoading,
    savedPlaces,
    saved,
    recommended,
    setSaved,
    setRecommended,
    setSavedPlaces,
    getDistanceKm,
    travelMode,
    toggleSave,
    toggleRecommend,
    handleAddToPlanner,
  } = d;

  return (
    <View style={styles.placeList}>
      {savedLoading ? (
        <View style={styles.emptyPlaces}>
          <MiniLoader message="Loading saved places..." />
        </View>
      ) : savedPlaces.length === 0 && saved.size === 0 ? (
        <View style={styles.emptyCard}>
          <Bookmark size={28} color={colors.text3} strokeWidth={1.6} opacity={0.6} />
          <Text style={styles.emptyCardTitle}>No saved places yet</Text>
          <Text style={styles.emptyCardBody}>
            Tap the bookmark on a place to save it here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.savedHeaderRow}>
            <Text style={styles.savedCount}>
              {savedPlaces.length} saved {'\u00B7'} {recommended.size} recommended
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSaved(new Set());
                setRecommended(new Set());
                setSavedPlaces([]);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>
          {savedPlaces.map((p) => {
            const dp = mapSavedPlaceToDiscoverPlace(p);
            return (
              <DiscoverPlaceCard
                key={p.id}
                place={dp}
                distanceKm={getDistanceKm(dp.lat, dp.lng)}
                travelMode={travelMode}
                isSaved={true}
                isRecommended={recommended.has(p.name)}
                onSave={toggleSave}
                onRecommend={toggleRecommend}
                onAddToPlanner={handleAddToPlanner}
              />
            );
          })}
        </>
      )}
    </View>
  );
}
