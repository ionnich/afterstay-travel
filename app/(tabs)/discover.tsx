import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SlidersHorizontal } from 'lucide-react-native';

import PlaceDetailSheet from '@/components/discover/PlaceDetailSheet';
import ExploreMap from '@/components/discover/ExploreMap';
import { PlannerTab } from '@/components/discover/PlannerTab';
import { PlacesTab } from '@/components/discover/PlacesTab';
import { SavedTab } from '@/components/discover/SavedTab';
import { getStyles } from '@/components/discover/discoverStyles';
import { useDiscover } from '@/components/discover/useDiscover';
import { useTheme } from '@/constants/ThemeContext';

// ── Error boundary for Discover ────────────────────────────────────────

class DiscoverErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: string }
> {
  state = { hasError: false, error: undefined as string | undefined };
  static getDerivedStateFromError(e: Error) {
    return { hasError: true, error: e.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Discover crashed</Text>
          <Text style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// ── Main screen ─────────────────────────────────────────────────────────

export default function DiscoverScreenWrapper() {
  return (
    <DiscoverErrorBoundary>
      <DiscoverScreenInner />
    </DiscoverErrorBoundary>
  );
}

function DiscoverScreenInner() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const d = useDiscover();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>{d.tripDest || 'Discover'}</Text>
        </View>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityLabel="Filters"
          accessibilityRole="button"
          activeOpacity={0.7}
          onPress={() => {
            d.setTab('places');
            d.setShowFilters((s) => !s);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <SlidersHorizontal size={16} color={colors.text} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>

      {/* Segmented control */}
      <View style={styles.segWrapper}>
        <View style={styles.seg}>
          {(['places', 'planner', 'saved'] as const).map((id) => (
            <TouchableOpacity
              key={id}
              style={[styles.segBtn, d.tab === id && styles.segBtnActive]}
              onPress={() => d.setTab(id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.segText, d.tab === id && styles.segTextActive]}>
                {id === 'planner'
                  ? 'Planner'
                  : id === 'places'
                    ? 'Places'
                    : `Saved${d.saved.size ? ` \u00B7 ${d.saved.size}` : ''}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={d.refreshing}
            onRefresh={d.handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        {d.tab === 'planner' && <PlannerTab d={d} />}
        {d.tab === 'places' && <PlacesTab d={d} />}
        {d.tab === 'saved' && <SavedTab d={d} />}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Full-screen map */}
      <ExploreMap
        visible={d.showMapModal}
        places={d.filteredPlaces}
        savedNames={d.saved}
        recommendedNames={d.recommended}
        travelMode={d.travelMode}
        distanceOrigin={d.distanceOrigin === 'me' ? 'me' : 'hotel'}
        userLocation={d.userLocation}
        onClose={() => d.setShowMapModal(false)}
        onTravelModeChange={d.handleTravelModeChange}
        onAnchorChange={d.handleAnchorChange}
        onSaveToggle={d.toggleSave}
        getDistanceKm={d.getDistanceKm}
      />

      <PlaceDetailSheet
        visible={d.showDetail}
        placeId={d.detailPlaceId}
        initialName={d.detailPlaceName}
        saved={d.saved.has(d.detailPlaceName)}
        onClose={() => d.setShowDetail(false)}
      />
    </SafeAreaView>
  );
}
