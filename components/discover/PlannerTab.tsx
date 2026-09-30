import { useRouter } from 'expo-router';
import { CalendarDays, Sparkles } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import EmptyState from '@/components/shared/EmptyState';
import MiniLoader from '@/components/loader/MiniLoader';
import { useTheme } from '@/constants/ThemeContext';
import { ITINERARY_STYLES } from '@/components/discover/discoverData';
import { getStyles } from '@/components/discover/discoverStyles';
import type { DiscoverState } from '@/components/discover/useDiscover';

export function PlannerTab({ d }: { d: DiscoverState }) {
  const { colors } = useTheme();
  const router = useRouter();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const {
    tripId,
    plannerDays,
    plannerActiveDay,
    setPlannerActiveDay,
    plannerItems,
    itineraryLoading,
    itineraryError,
    style,
    setStyle,
    prompt,
    setPrompt,
    handleGenerateItinerary,
    removePlannerItem,
    setTab,
  } = d;

  if (plannerDays.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title={tripId ? 'No days to plan' : 'No trip yet'}
        subtitle={tripId
          ? 'Your trip dates will appear here — browse Places and tap "Add to Planner" to fill your days.'
          : 'Create a trip to start planning your days.'}
        actionLabel={tripId ? undefined : 'Get Started'}
        onAction={tripId ? undefined : () => router.push('/onboarding')}
      />
    );
  }

  return (
    <>
      {/* Compact AI generate bar */}
      {!itineraryLoading && (
        <View style={{ gap: 10, marginBottom: 16 }}>
          {/* Style + pace inline */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {ITINERARY_STYLES.map((s) => {
              const active = style === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setStyle(s.id)}
                  activeOpacity={0.7}
                  style={[styles.chip, active && styles.chipActive, { paddingVertical: 5, paddingHorizontal: 10 }]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive, { fontSize: 11 }]}>{s.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Prompt + generate row */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="e.g. snorkeling, sunset dinner..."
              placeholderTextColor={colors.text3}
              style={{ flex: 1, fontSize: 13, color: colors.text, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}
            />
            <TouchableOpacity
              style={{ backgroundColor: colors.black, borderRadius: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}
              activeOpacity={0.7}
              onPress={handleGenerateItinerary}
            >
              <Sparkles size={16} color={colors.onBlack} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      {itineraryLoading && (
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <MiniLoader message="Planning your trip..." />
        </View>
      )}
      {itineraryError && (
        <Text style={{ color: colors.danger, fontSize: 12, textAlign: 'center', marginBottom: 8 }}>{itineraryError}</Text>
      )}

      {/* Day accordion — all days in one scroll */}
      {plannerDays.map((d) => {
        const items = plannerItems[d.n] ?? [];
        const isActive = plannerActiveDay === d.n;
        return (
          <View key={d.n} style={{ marginBottom: 2 }}>
            {/* Day header — tap to expand */}
            <TouchableOpacity
              onPress={() => setPlannerActiveDay(isActive ? -1 : d.n)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12,
                paddingHorizontal: 14,
                backgroundColor: isActive ? colors.card : 'transparent',
                borderRadius: isActive ? 12 : 0,
                borderBottomWidth: isActive ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: isActive ? colors.accent : colors.text }}>
                  Day {d.n}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text3 }}>{d.label} · {d.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {items.length > 0 && (
                  <Text style={{ fontSize: 11, color: colors.text3, fontWeight: '600' }}>
                    {items.length}
                  </Text>
                )}
                <Text style={{ fontSize: 12, color: colors.text3 }}>{isActive ? '\u25B2' : '\u25BC'}</Text>
              </View>
            </TouchableOpacity>

            {/* Expanded day content */}
            {isActive && (
              <View style={{ paddingHorizontal: 14, paddingBottom: 16, backgroundColor: colors.card, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, marginBottom: 8 }}>
                {items.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                    <Text style={{ fontSize: 13, color: colors.text3, fontStyle: 'italic' }}>No activities yet</Text>
                    <TouchableOpacity
                      style={{ marginTop: 10, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}
                      activeOpacity={0.7}
                      onPress={() => setTab('places')}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent }}>Add from Places</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ gap: 8, marginTop: 8 }}>
                    {items.map((item) => (
                      <View key={item.id} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.text3, width: 42, marginTop: 2 }}>{item.time}</Text>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 6 }} />
                        <View style={{ flex: 1, backgroundColor: colors.bg, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, flex: 1 }}>{item.title}</Text>
                            <TouchableOpacity onPress={() => removePlannerItem(item.id)} activeOpacity={0.6} hitSlop={8}>
                              <Text style={{ color: colors.text3, fontSize: 14 }}>{'\u00D7'}</Text>
                            </TouchableOpacity>
                          </View>
                          {item.note && (
                            <Text style={{ fontSize: 11, color: colors.text3, marginTop: 3 }}>{item.note}</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}
