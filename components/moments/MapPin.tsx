import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/constants/ThemeContext';
import type { MomentDisplay, PeopleMap } from './types';

interface MapPinProps {
  cluster: { x: number; y: number; items: MomentDisplay[] };
  isRevealed: boolean;
  isCurrent: boolean;
  authorColor: string;
  onPress: () => void;
  people: PeopleMap;
}

export function MapPin({ cluster, isRevealed, isCurrent, authorColor, onPress, people }: MapPinProps) {
  const { colors } = useTheme();
  const anim = useRef(new Animated.Value(isRevealed ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isRevealed ? 1 : 0,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [isRevealed, anim]);

  const opacity = anim;
  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const stackSize = cluster.items.length;
  const primary = cluster.items[0];
  const photoUri = primary.photo;

  return (
    <Animated.View
      style={[
        styles.pinContainer,
        {
          left: `${cluster.x}%` as unknown as number,
          top: `${cluster.y}%` as unknown as number,
          opacity,
          transform: [{ scale }],
          zIndex: isCurrent ? 20 : 10,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.pinTouchable}
      >
        {/* Stacked back tiles */}
        <View style={styles.pinPhotoWrapper}>
          {stackSize > 2 && (
            <View
              style={[
                styles.stackTile,
                {
                  transform: [
                    { translateX: -3 },
                    { translateY: -2 },
                    { rotate: '-5deg' },
                  ],
                },
              ]}
            />
          )}
          {stackSize > 1 && (
            <View
              style={[
                styles.stackTile,
                {
                  transform: [
                    { translateX: 4 },
                    { translateY: -3 },
                    { rotate: '4deg' },
                  ],
                },
              ]}
            />
          )}
          {/* Primary photo tile */}
          <View
            style={[
              styles.primaryTile,
              {
                borderColor: '#fff',
                ...(isCurrent
                  ? {
                      shadowColor: authorColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                      elevation: 8,
                    }
                  : {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.22,
                      shadowRadius: 4,
                      elevation: 4,
                    }),
              },
            ]}
          >
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.pinPhoto}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[styles.pinPhoto, { backgroundColor: colors.card2 }]}
              />
            )}
          </View>
          {/* Count badge */}
          {stackSize > 1 && (
            <View
              style={[
                styles.countBadge,
                { backgroundColor: authorColor, borderColor: '#fff' },
              ]}
            >
              <Text style={styles.countBadgeText}>+{stackSize - 1}</Text>
            </View>
          )}
        </View>
        {/* Pin tail */}
        <Svg width={10} height={8} viewBox="0 0 10 8" style={styles.pinTail}>
          <Path d="M 0 0 L 10 0 L 5 8 Z" fill="#fff" />
        </Svg>
        {/* Anchor dot */}
        <View
          style={[
            styles.anchorDot,
            {
              backgroundColor: authorColor,
              borderColor: '#fff',
            },
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    position: 'absolute',
    transform: [{ translateX: -18 }, { translateY: -52 }],
  },
  pinTouchable: {
    alignItems: 'center',
  },
  pinPhotoWrapper: {
    width: 36,
    height: 36,
    position: 'relative',
  },
  stackTile: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryTile: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
  },
  pinPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  countBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 99,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0b0f14',
  },
  pinTail: {
    marginTop: -1,
  },
  anchorDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    borderWidth: 1.5,
    marginTop: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});
