import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { useTheme } from '@/constants/ThemeContext';
import { AREA_LABELS, HOME, ISLAND_PATH } from './mapUtils';

interface IslandMapProps {
  pathD: string;
  itemCount: number;
  children?: React.ReactNode;
}

export function IslandMap({ pathD, itemCount, children }: IslandMapProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.mapCard,
        {
          borderColor: colors.border,
          borderWidth: 1,
          backgroundColor: colors.bg,
        },
      ]}
    >
      {/* Water background layer */}
      <View style={styles.waterLayer} />

      {/* Island SVG */}
      <Svg
        viewBox="0 0 100 140"
        preserveAspectRatio="none"
        style={styles.svgLayer}
      >
        <Defs>
          <LinearGradient id="land-fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#d9c099" stopOpacity={0.85} />
            <Stop offset="0.5" stopColor="#c9a877" stopOpacity={0.85} />
            <Stop offset="1" stopColor="#b89160" stopOpacity={0.85} />
          </LinearGradient>
          <RadialGradient id="land-veg" cx="50%" cy="45%" r="60%">
            <Stop offset="0" stopColor="#7a9a6a" stopOpacity={0.45} />
            <Stop offset="0.7" stopColor="#7a9a6a" stopOpacity={0.12} />
            <Stop offset="1" stopColor="#7a9a6a" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Coast ripple rings */}
        <Ellipse
          cx={50} cy={70} rx={42} ry={62}
          fill="none" stroke="rgba(120,180,200,0.12)" strokeWidth={0.25}
        />
        <Ellipse
          cx={50} cy={70} rx={38} ry={58}
          fill="none" stroke="rgba(120,180,200,0.08)" strokeWidth={0.25}
        />

        {/* Island silhouette */}
        <Path
          d={ISLAND_PATH}
          fill="url(#land-fill)"
          stroke="rgba(170, 130, 80, 0.5)"
          strokeWidth={0.25}
        />
        {/* Vegetation overlay */}
        <Path d={ISLAND_PATH} fill="url(#land-veg)" />

        {/* White Beach west coast strip */}
        <Path
          d="M 44 56 Q 42 66 42 78 Q 44 86 47 90"
          fill="none" stroke="#fff1d4" strokeWidth={1.1}
          strokeLinecap="round" opacity={0.6}
        />
        {/* Puka Beach north strip */}
        <Path
          d="M 48 12 Q 54 11 60 14"
          fill="none" stroke="#fff1d4" strokeWidth={1.1}
          strokeLinecap="round" opacity={0.55}
        />

        {/* Willy's Rock offshore */}
        <Circle cx={44} cy={64} r={0.6} fill="rgba(170, 130, 80, 0.7)" />
        <Circle cx={43.6} cy={64.3} r={0.4} fill="rgba(170, 130, 80, 0.5)" />

        {/* Crystal Cove offshore east */}
        <Ellipse
          cx={69} cy={36} rx={2} ry={1.3}
          fill="url(#land-fill)" stroke="rgba(170,130,80,0.4)" strokeWidth={0.15}
        />
        {/* Ariel's Point offshore west */}
        <Ellipse
          cx={34} cy={46} rx={1.8} ry={1.2}
          fill="url(#land-fill)" stroke="rgba(170,130,80,0.4)" strokeWidth={0.15}
        />

        {/* Dashed route path */}
        {pathD !== '' && (
          <Path
            d={pathD}
            fill="none"
            stroke={colors.accent}
            strokeWidth={0.5}
            strokeDasharray="1.2,1"
            strokeLinecap="round"
            opacity={0.85}
          />
        )}
      </Svg>

      {/* Compass chip — top left */}
      <View
        style={[
          styles.compassChip,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <Svg width={9} height={9} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22s-8-7.5-8-13a8 8 0 1116 0c0 5.5-8 13-8 13z"
            stroke={colors.text2}
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Circle cx={12} cy={9} r={2.5} stroke={colors.text2} strokeWidth={2.2} fill="none" />
        </Svg>
        <Text style={[styles.compassText, { color: colors.text2 }]}>
          BORACAY {'\u00B7'} {itemCount}
        </Text>
      </View>

      {/* North indicator — top right */}
      <View
        style={[
          styles.northIndicator,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <Text style={[styles.northArrow, { color: colors.accent }]}>{'\u25B2'}</Text>
        <Text style={[styles.northLetter, { color: colors.text2 }]}>N</Text>
      </View>

      {/* Area labels */}
      {AREA_LABELS.map((l) => (
        <View
          key={l.label}
          style={[
            styles.areaLabel,
            {
              left: `${l.x}%` as unknown as number,
              top: `${l.y}%` as unknown as number,
            },
            l.align === 'right' ? styles.areaLabelRight : styles.areaLabelLeft,
          ]}
        >
          {l.align === 'left' && (
            <View style={[styles.labelLine, { backgroundColor: colors.text3 }]} />
          )}
          <Text style={[styles.areaLabelText, { color: colors.text3 }]}>
            {l.label}
          </Text>
          {l.align === 'right' && (
            <View style={[styles.labelLine, { backgroundColor: colors.text3 }]} />
          )}
        </View>
      ))}

      {/* Home base marker */}
      <View
        style={[
          styles.homeBase,
          {
            left: `${HOME.x}%` as unknown as number,
            top: `${HOME.y}%` as unknown as number,
          },
        ]}
      >
        <View
          style={[
            styles.homeDiamond,
            {
              backgroundColor: colors.accent,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.18,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
        >
          <Svg
            width={10}
            height={10}
            viewBox="0 0 24 24"
            style={{ transform: [{ rotate: '-45deg' }] }}
          >
            <Path
              d="M12 3 L3 11 L5 11 L5 20 L10 20 L10 14 L14 14 L14 20 L19 20 L19 11 L21 11 Z"
              fill={colors.onBlack}
            />
          </Svg>
        </View>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  mapCard: {
    position: 'relative',
    aspectRatio: 3 / 4,
    borderRadius: 18,
    overflow: 'hidden',
  },
  waterLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(120,180,200,0.06)',
  },
  svgLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Compass chip
  compassChip: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 99,
  },
  compassText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },

  // North indicator
  northIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  northArrow: {
    fontSize: 7,
    marginBottom: -2,
  },
  northLetter: {
    fontSize: 8,
    fontWeight: '700',
    lineHeight: 10,
  },

  // Area labels
  areaLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  areaLabelLeft: {
    transform: [{ translateY: -6 }],
  },
  areaLabelRight: {
    transform: [{ translateX: -4 }, { translateY: -6 }],
  },
  areaLabelText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  labelLine: {
    width: 8,
    height: 1,
    opacity: 0.5,
  },

  // Home base
  homeBase: {
    position: 'absolute',
    transform: [{ translateX: -9 }, { translateY: -9 }],
    zIndex: 5,
  },
  homeDiamond: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
});
