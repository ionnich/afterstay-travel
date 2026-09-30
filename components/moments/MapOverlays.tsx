import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Polygon, Rect } from 'react-native-svg';
import { useTheme } from '@/constants/ThemeContext';
import { formatDatePHT } from '@/lib/utils';
import { MapSlider } from './MapSlider';
import type { MomentDisplay, PeopleMap } from './types';

interface MapOverlaysProps {
  current?: MomentDisplay;
  people: PeopleMap;
  cursor: number;
  totalMoments: number;
  placesCount: number;
  playing: boolean;
  onPlay: () => void;
  onSliderChange: (v: number) => void;
}

export function MapOverlays({
  current,
  people,
  cursor,
  totalMoments,
  placesCount,
  playing,
  onPlay,
  onSliderChange,
}: MapOverlaysProps) {
  const { colors } = useTheme();

  const currentAuthorKey = current?.authorKey ?? current?.takenBy ?? '';
  const currentAuthorColor = people[currentAuthorKey]?.color ?? colors.accent;

  return (
    <>
      {/* Current-moment caption card */}
      {current && (
        <View
          style={[
            styles.captionCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderWidth: 1,
              borderLeftColor: currentAuthorColor,
              borderLeftWidth: 3,
            },
          ]}
        >
          <Text
            style={[styles.captionPlace, { color: colors.text }]}
            numberOfLines={1}
          >
            {current.place ?? current.location ?? ''}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2 }}>
            <Text style={[styles.captionDate, { color: colors.text3 }]}>
              {formatDatePHT(current.date)}
            </Text>
            {current.takenBy ? (
              <Text style={{ fontSize: 9, color: colors.text3 }}>
                by {current.takenBy}
              </Text>
            ) : null}
          </View>
          {current.caption ? (
            <Text style={{ fontSize: 9, color: colors.text2, marginTop: 2 }} numberOfLines={1}>
              {current.caption}
            </Text>
          ) : null}
        </View>
      )}

      {/* Trip summary strip */}
      <View
        style={[
          styles.summaryStrip,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <Text style={{ fontSize: 9, fontWeight: '700', color: colors.accent }}>
          {placesCount} places
        </Text>
        <Text style={{ fontSize: 9, color: colors.text3 }}>·</Text>
        <Text style={{ fontSize: 9, fontWeight: '700', color: colors.text2 }}>
          {cursor}/{totalMoments} moments
        </Text>
      </View>

      {/* Scrubber bar */}
      <View
        style={[
          styles.scrubberBar,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
      >
        <TouchableOpacity
          onPress={onPlay}
          activeOpacity={0.8}
          style={[styles.playButton, { backgroundColor: colors.accent }]}
          accessibilityLabel={playing ? 'Pause' : 'Play'}
          accessibilityRole="button"
        >
          {playing ? (
            <Svg width={10} height={10} viewBox="0 0 24 24">
              <Rect x={6} y={5} width={4} height={14} rx={1} fill={colors.onBlack} />
              <Rect x={14} y={5} width={4} height={14} rx={1} fill={colors.onBlack} />
            </Svg>
          ) : (
            <Svg width={10} height={10} viewBox="0 0 24 24">
              <Polygon points="6,4 20,12 6,20" fill={colors.onBlack} />
            </Svg>
          )}
        </TouchableOpacity>

        <View style={styles.sliderContainer}>
          <MapSlider
            value={cursor}
            max={totalMoments}
            onValueChange={onSliderChange}
            accentColor={colors.accent}
            trackColor={colors.border}
          />
        </View>

        <Text style={[styles.counterText, { color: colors.text2 }]}>
          {cursor}/{totalMoments}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Caption card
  captionCard: {
    position: 'absolute',
    left: 12,
    bottom: 56,
    maxWidth: '62%',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  captionPlace: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  captionDate: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },

  // Summary strip
  summaryStrip: {
    position: 'absolute',
    bottom: 56,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 99,
  },

  // Scrubber
  scrubberBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  playButton: {
    width: 26,
    height: 26,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 26,
  },
  counterText: {
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    minWidth: 32,
    textAlign: 'right',
    fontFamily: 'SpaceMono',
  },
});
