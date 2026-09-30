import React, { useMemo } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronDown, Filter, Search } from 'lucide-react-native';

import {
  DiscoverPlaceCard,
  friendlyCategory,
  type DiscoverPlace,
} from '@/components/discover/DiscoverPlaceCard';
import DistanceToggle from '@/components/discover/DistanceToggle';
import MiniLoader from '@/components/loader/MiniLoader';
import { useTheme, type ThemeColors } from '@/constants/ThemeContext';
import {
  DEFAULT_FILTERS,
  PLACE_CATEGORY_CHIPS,
  getTopPicks,
} from '@/components/discover/discoverData';
import { getStyles } from '@/components/discover/discoverStyles';
import type { DiscoverState } from '@/components/discover/useDiscover';

const FilterRow = React.memo(function FilterRow({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ThemeColors;
}) {
  return (
    <View>
      <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', color: colors.text3, marginBottom: 6 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{children}</View>
    </View>
  );
});

const segStyles = (colors: ThemeColors) => StyleSheet.create({
  seg: { paddingVertical: 7, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  segActive: { borderColor: colors.black, backgroundColor: colors.black },
  segText: { fontSize: 11.5, fontWeight: '600', color: colors.text },
  segTextActive: { color: colors.onBlack },
});

const SegBtn = React.memo(function SegBtn({
  active,
  onPress,
  children,
  colors,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
  colors: ThemeColors;
}) {
  const s = segStyles(colors);
  return (
    <TouchableOpacity onPress={onPress} style={[s.seg, active && s.segActive]} activeOpacity={0.7}>
      <Text style={[s.segText, active && s.segTextActive]}>{children}</Text>
    </TouchableOpacity>
  );
});

const TopPicksSection = React.memo(function TopPicksSection({
  places,
  onExplore,
  distFn,
}: {
  places: readonly DiscoverPlace[];
  onExplore: (placeId: string | undefined, name: string) => void;
  distFn: (lat?: number, lng?: number) => number;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const picks = useMemo(() => getTopPicks(places, distFn), [places, distFn]);
  if (picks.length === 0) return null;

  return (
    <View style={styles.topPicksSection}>
      <Text style={styles.topPicksTitle}>Top 5 Picks for You</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {picks.map((p) => (
          <TouchableOpacity
            key={p.placeId ?? p.n}
            style={styles.topPickCard}
            activeOpacity={0.7}
            onPress={() => onExplore(p.placeId, p.n)}
            accessibilityRole="button"
            accessibilityLabel={p.n}
          >
            <Image source={{ uri: p.img }} style={styles.topPickImage} />
            <Text style={styles.topPickLabel}>{friendlyCategory(p.t).toUpperCase()}</Text>
            <Text style={styles.topPickName} numberOfLines={1}>{p.n}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 10 }}>
              <Text style={{ fontSize: 10, color: colors.warn }}>{'★'} {p.r}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

export function PlacesTab({ d }: { d: DiscoverState }) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const {
    q,
    setQ,
    placeCategoryChip,
    setPlaceCategoryChip,
    setVisibleCount,
    showFilters,
    setShowFilters,
    toggleShowFilters,
    activeFilterCount,
    filters,
    setFilters,
    distanceOrigin,
    travelMode,
    handleAnchorChange,
    handleTravelModeChange,
    places,
    handleExplore,
    getDistanceKm,
    placesError,
    placesLoading,
    filteredPlaces,
    placesWithDistance,
    visibleCount,
    saved,
    recommended,
    toggleSave,
    toggleRecommend,
    handleAddToPlanner,
  } = d;

  return (
    <>
      {/* Search */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.text3} strokeWidth={1.8} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search restaurants, beaches, activities..."
          placeholderTextColor={colors.text3}
          style={styles.searchInput}
        />
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {PLACE_CATEGORY_CHIPS.map((c) => {
          const isActive = placeCategoryChip === c;
          return (
            <TouchableOpacity
              key={c}
              style={[styles.chip, isActive && styles.chipActive]}
              activeOpacity={0.7}
              onPress={() => {
                setPlaceCategoryChip(c);
                setQ('');
                setVisibleCount(20);
              }}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Filter toggle */}
      <TouchableOpacity
        onPress={toggleShowFilters}
        style={[
          styles.filterBarInline,
          activeFilterCount > 0 && { borderColor: colors.accent },
        ]}
        activeOpacity={0.7}
      >
        <Filter size={14} color={activeFilterCount > 0 ? colors.accent : colors.text3} strokeWidth={2} />
        <Text style={{ fontSize: 13, fontWeight: '500', color: activeFilterCount > 0 ? colors.accent : colors.text2 }}>
          Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
        </Text>
        <ChevronDown size={14} color={colors.text3} strokeWidth={2} style={{ transform: [{ rotate: showFilters ? '180deg' : '0deg' }] }} />
      </TouchableOpacity>

      {/* Expanded filters panel */}
      {showFilters && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.filterPanel}
        >
          <FilterRow label="Minimum rating" colors={colors}>
            {[0, 4.0, 4.5].map((v) => (
              <SegBtn
                key={v}
                active={filters.minRating === v}
                onPress={() =>
                  setFilters((f) => ({ ...f, minRating: v }))
                }
                colors={colors}
              >
                {v === 0 ? 'Any' : `\u2605 ${v.toFixed(1)}+`}
              </SegBtn>
            ))}
          </FilterRow>
          <FilterRow label="Price" colors={colors}>
            {['Free', '$', '$$', '$$$'].map((lbl, i) => (
              <SegBtn
                key={lbl}
                active={filters.maxPrice === i}
                onPress={() =>
                  setFilters((f) => ({ ...f, maxPrice: i }))
                }
                colors={colors}
              >
                {lbl}
                {i < 3 ? ' or less' : ''}
              </SegBtn>
            ))}
          </FilterRow>
          <FilterRow label="Distance" colors={colors}>
            <SegBtn
              active={!filters.nearby}
              onPress={() =>
                setFilters((f) => ({ ...f, nearby: false }))
              }
              colors={colors}
            >
              Any
            </SegBtn>
            <SegBtn
              active={filters.nearby}
              onPress={() =>
                setFilters((f) => ({ ...f, nearby: true }))
              }
              colors={colors}
            >
              {'\u2264'} 2 km
            </SegBtn>
          </FilterRow>
          <FilterRow label="Availability" colors={colors}>
            <SegBtn
              active={!filters.openNow}
              onPress={() =>
                setFilters((f) => ({ ...f, openNow: false }))
              }
              colors={colors}
            >
              All
            </SegBtn>
            <SegBtn
              active={filters.openNow}
              onPress={() =>
                setFilters((f) => ({ ...f, openNow: true }))
              }
              colors={colors}
            >
              Open now
            </SegBtn>
          </FilterRow>

          {/* Distance origin + travel mode (moved inside filter panel) */}
          <View style={{ marginTop: 8 }}>
            <DistanceToggle
              anchor={distanceOrigin === 'me' ? 'me' : 'hotel'}
              travelMode={travelMode}
              onAnchorChange={handleAnchorChange}
              onTravelModeChange={handleTravelModeChange}
            />
          </View>

          {/* Footer */}
          <View style={styles.filterFooter}>
            <TouchableOpacity
              onPress={() => setFilters({ ...DEFAULT_FILTERS })}
              activeOpacity={0.7}
            >
              <Text style={styles.filterResetText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterShowBtn}
              onPress={() => setShowFilters(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.filterShowBtnText}>Show results</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Top Picks */}
      {placeCategoryChip === 'All' && !q && (
        <TopPicksSection places={places} onExplore={handleExplore} distFn={getDistanceKm} />
      )}

      {/* Results count */}
      <Text style={styles.resultsCount}>
        {filteredPlaces.length} {filteredPlaces.length === 1 ? 'place' : 'places'}
      </Text>

      {/* Place cards */}
      <View style={styles.placeList}>
        {placesError && (
          <View style={styles.emptyPlaces}>
            <Text style={styles.errorText}>{placesError}</Text>
          </View>
        )}
        {placesLoading ? (
          <View style={styles.emptyPlaces}>
            <MiniLoader message="Finding places..." />
          </View>
        ) : filteredPlaces.length === 0 ? (
          <View style={styles.emptyPlaces}>
            <Text style={styles.emptyText}>
              No places match these filters.
            </Text>
          </View>
        ) : (
          <>
            {placesWithDistance.slice(0, visibleCount).map(({ place: p, distanceKm }, idx) => (
              <DiscoverPlaceCard
                key={p.placeId ?? `${p.n}-${idx}`}
                place={p}
                distanceKm={distanceKm}
                travelMode={travelMode}
                isSaved={saved.has(p.n)}
                isRecommended={recommended.has(p.n)}
                onSave={toggleSave}
                onRecommend={toggleRecommend}
                onExplore={handleExplore}
                onAddToPlanner={handleAddToPlanner}
              />
            ))}
            {placesWithDistance.length > visibleCount && (
              <TouchableOpacity
                style={styles.showMoreBtn}
                onPress={() => setVisibleCount((c) => c + 20)}
                activeOpacity={0.7}
              >
                <ChevronDown size={16} color={colors.accent} strokeWidth={2} />
                <Text style={styles.showMoreText}>
                  Show more ({placesWithDistance.length - visibleCount} remaining)
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </>
  );
}
