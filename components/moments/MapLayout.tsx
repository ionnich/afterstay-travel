import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import { IslandMap } from './IslandMap';
import { MapOverlays } from './MapOverlays';
import { MapPin } from './MapPin';
import { MomentList } from './MomentList';
import { HOME, positionOf } from './mapUtils';
import type { MomentDisplay, PeopleMap } from './types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MapLayoutProps {
  items: MomentDisplay[];
  onOpen: (moment: MomentDisplay) => void;
  people: PeopleMap;
}

// ---------------------------------------------------------------------------
// MapLayout
// ---------------------------------------------------------------------------

export function MapLayout({ items, onOpen, people }: MapLayoutProps) {
  const { colors } = useTheme();

  // Sort chronologically
  const ordered = useMemo(() => {
    const dayOrder: Record<string, number> = {};
    items.forEach((m) => {
      if (dayOrder[m.date] == null) dayOrder[m.date] = Object.keys(dayOrder).length;
    });
    return [...items].sort((a, b) => {
      const d = (dayOrder[a.date] ?? 0) - (dayOrder[b.date] ?? 0);
      if (d !== 0) return d;
      return 0;
    });
  }, [items]);

  // Scrubber state
  const [cursor, setCursor] = useState(ordered.length);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setCursor(ordered.length);
  }, [ordered.length]);

  useEffect(() => {
    if (!playing) return;
    if (cursor >= ordered.length) {
      setCursor(0);
      return;
    }
    const id = setTimeout(() => {
      setCursor((c) => {
        if (c >= ordered.length) {
          setPlaying(false);
          return c;
        }
        return c + 1;
      });
    }, 1200);
    return () => clearTimeout(id);
  }, [playing, cursor, ordered.length]);

  const revealed = ordered.slice(0, cursor);
  const current = revealed[revealed.length - 1];

  // SVG route path
  const pathD = useMemo(() => {
    if (revealed.length === 0) return '';
    const pts = [HOME, ...revealed.map(positionOf)];
    return pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  }, [revealed]);

  // Cluster nearby pins
  const clusters = useMemo(() => {
    const out: { x: number; y: number; items: MomentDisplay[] }[] = [];
    ordered.forEach((m) => {
      const p = positionOf(m);
      const nearIdx = out.findIndex((c) => {
        const dx = c.x - p.x;
        const dy = c.y - p.y;
        return dx * dx + dy * dy < 36;
      });
      if (nearIdx >= 0) {
        out[nearIdx].items.push(m);
      } else {
        out.push({ x: p.x, y: p.y, items: [m] });
      }
    });
    return out;
  }, [ordered]);

  const handlePlay = useCallback(() => {
    if (cursor >= ordered.length) setCursor(0);
    setPlaying((p) => !p);
  }, [cursor, ordered.length]);

  const handleSliderChange = useCallback((v: number) => {
    setPlaying(false);
    setCursor(v);
  }, []);

  const placesCount = useMemo(
    () => new Set(ordered.map((m) => m.place ?? m.location).filter(Boolean)).size,
    [ordered],
  );

  return (
    <View style={styles.wrapper}>
      <IslandMap pathD={pathD} itemCount={items.length}>
        {clusters.map((cluster, cIdx) => {
          const primary = cluster.items[0];
          const primaryIdx = ordered.indexOf(primary);
          const isRevealed = primaryIdx < cursor;
          const isCurrent = primaryIdx === cursor - 1;
          const authorKey = primary.authorKey ?? primary.takenBy ?? '';
          const authorColor = people[authorKey]?.color ?? colors.accent;

          return (
            <MapPin
              key={cIdx}
              cluster={cluster}
              isRevealed={isRevealed}
              isCurrent={isCurrent}
              authorColor={authorColor}
              onPress={() => onOpen(primary)}
              people={people}
            />
          );
        })}

        <MapOverlays
          current={current}
          people={people}
          cursor={cursor}
          totalMoments={ordered.length}
          placesCount={placesCount}
          playing={playing}
          onPlay={handlePlay}
          onSliderChange={handleSliderChange}
        />
      </IslandMap>

      <MomentList items={ordered} cursor={cursor} people={people} onOpen={onOpen} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
});
