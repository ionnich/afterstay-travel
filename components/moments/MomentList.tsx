import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import { formatDatePHT } from '@/lib/utils';
import { Avatar } from './Avatar';
import type { MomentDisplay, PeopleMap } from './types';

interface MomentListProps {
  items: MomentDisplay[];
  cursor: number;
  people: PeopleMap;
  onOpen: (moment: MomentDisplay) => void;
}

export function MomentList({ items, cursor, people, onOpen }: MomentListProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.listContainer}>
      {items.map((m, i) => {
        const isRevealed = i < cursor;
        const authorKey = m.authorKey ?? m.takenBy ?? '';
        const authorColor = people[authorKey]?.color ?? colors.accent;

        return (
          <TouchableOpacity
            key={`${m.id}-${i}`}
            onPress={() => onOpen(m)}
            activeOpacity={0.8}
            style={[
              styles.listRow,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                borderLeftColor: authorColor,
                borderLeftWidth: 3,
                opacity: isRevealed ? 1 : 0.38,
              },
            ]}
          >
            <View
              style={[
                styles.listThumb,
                { borderColor: colors.border, borderWidth: 1 },
              ]}
            >
              {m.photo ? (
                <Image
                  source={{ uri: m.photo }}
                  style={[
                    styles.listThumbImage,
                    !isRevealed && styles.listThumbGrayscale,
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.listThumbImage,
                    { backgroundColor: colors.card2 },
                  ]}
                />
              )}
            </View>
            <View style={styles.listTextContainer}>
              <Text
                style={[styles.listPlace, { color: colors.text }]}
                numberOfLines={1}
              >
                {m.place ?? m.location ?? ''}
              </Text>
              <Text style={[styles.listDate, { color: colors.text3 }]}>
                {formatDatePHT(m.date)}
              </Text>
            </View>
            <Avatar authorKey={authorKey} people={people} size={20} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    marginTop: 14,
    gap: 6,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  listThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  listThumbImage: {
    width: '100%',
    height: '100%',
  },
  listThumbGrayscale: {
    opacity: 0.5,
  },
  listTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  listPlace: {
    fontSize: 12,
    fontWeight: '600',
  },
  listDate: {
    fontSize: 10.5,
    marginTop: 1,
  },
});
