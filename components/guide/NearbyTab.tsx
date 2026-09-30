import React, { useEffect } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { MapPin } from 'lucide-react-native';
import EmptyState from '@/components/shared/EmptyState';
import type { Trip } from '@/lib/types';
import { MAP_PINS, NEARBY } from './guideConstants';
import type { ThemeColors } from './guideConstants';

interface NearbyTabProps {
  colors: ThemeColors;
  hotelName: string;
  trip: Trip | null;
  isCanyon: boolean;
}

function PulsingMapPin({ colors, label }: { colors: ThemeColors; label: string }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles_static.pinContainer, animStyle]}>
      <View
        style={[
          styles_static.pinOuter,
          {
            backgroundColor: colors.accent,
            shadowColor: colors.accent,
          },
        ]}
      >
        <Svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.onBlack}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M12 22s-8-7.5-8-13a8 8 0 1116 0c0 5.5-8 13-8 13z" />
          <Circle cx={12} cy={9} r={2.5} />
        </Svg>
      </View>
      <Text style={[styles_static.pinLabel, { color: colors.text }]}>
        {label}
      </Text>
    </Animated.View>
  );
}

// Some styles that don't depend on theme
const styles_static = StyleSheet.create({
  pinContainer: {
    alignItems: 'center',
  },
  pinOuter: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
  },
});

export function NearbyTab({ colors, hotelName, trip, isCanyon }: NearbyTabProps) {
  const styles = getStyles(colors);

  if (!isCanyon) {
    return (
      <EmptyState
        icon={MapPin}
        title="Nearby places"
        subtitle="Nearby essentials will appear here once your accommodation is set up."
      />
    );
  }

  return (
    <>
      {/* Mini map card */}
      <View style={styles.mapCardWrapper}>
        <View style={styles.mapCard}>
          {/* Grid pattern background */}
          <Svg
            width="100%"
            height="100%"
            style={StyleSheet.absoluteFill}
          >
            <Defs>
              <Pattern
                id="grid"
                width={24}
                height={24}
                patternUnits="userSpaceOnUse"
              >
                <Path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke={colors.border}
                  strokeWidth={0.5}
                />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grid)" opacity={0.25} />
          </Svg>

          {/* Hotel pin (centered) */}
          <View style={styles.mapPinCenter}>
            <PulsingMapPin colors={colors} label={hotelName} />
          </View>

          {/* Scattered secondary pins */}
          {MAP_PINS.map((p, i) => (
            <View
              key={i}
              style={[
                styles.mapDot,
                { left: p.x as unknown as number, top: p.y as unknown as number },
              ]}
            >
              <View
                style={[
                  styles.mapDotInner,
                  { backgroundColor: colors.text3 },
                ]}
              />
            </View>
          ))}

          {/* Open map button */}
          <TouchableOpacity
            style={styles.openMapBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open map"
            onPress={async () => {
              const query = trip?.accommodation || trip?.destination || '';
              if (!query) return;
              const url = `https://maps.google.com/?q=${encodeURIComponent(query)}`;
              try {
                await Linking.openURL(url);
              } catch {
                if (__DEV__) console.warn('Failed to open URL:', url);
              }
            }}
          >
            <Text style={styles.openMapBtnText}>Open map {'\u2192'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Essentials header */}
      <View style={styles.groupHeader}>
        <Text style={styles.eyebrow}>Essentials</Text>
        <Text style={styles.groupTitle}>Around the hotel</Text>
      </View>

      {/* Nearby list */}
      <View style={styles.nearbyList}>
        {NEARBY.map((n) => (
          <View key={n.n} style={styles.nearbyRow}>
            <View style={styles.nearbyPin}>
              <Text style={styles.nearbyPinText}>{n.pin}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nearbyName}>{n.n}</Text>
              <Text style={styles.nearbyMeta}>
                {n.t} {'\u00B7'} {n.w}
              </Text>
            </View>
            <Text style={styles.nearbyDist}>{n.d}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Group headers
    groupHeader: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    eyebrow: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: colors.text3,
    },
    groupTitle: {
      fontSize: 16,
      fontWeight: '500',
      letterSpacing: -0.48,
      color: colors.text,
      marginTop: 2,
    },

    // Map card
    mapCardWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
    mapCard: {
      height: 150,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    mapPinCenter: {
      position: 'absolute',
      top: '45%',
      left: '50%',
      transform: [{ translateX: -19 }, { translateY: -19 }],
    },
    mapDot: {
      position: 'absolute',
    },
    mapDotInner: {
      width: 8,
      height: 8,
      borderRadius: 999,
      opacity: 0.6,
    },
    openMapBtn: {
      position: 'absolute',
      right: 12,
      bottom: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    openMapBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },

    // Nearby list
    nearbyList: {
      paddingHorizontal: 16,
      gap: 8,
    },
    nearbyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
    },
    nearbyPin: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nearbyPinText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accent,
    },
    nearbyName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    nearbyMeta: {
      fontSize: 11,
      color: colors.text3,
      marginTop: 2,
    },
    nearbyDist: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: 0.26,
    },
  });
