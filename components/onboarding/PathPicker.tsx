import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ArrowRight, FileText, Plane, Users } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemeColors } from '@/constants/ThemeContext';
import { BrandRow, Header, shared } from './shared';
import type { Path } from './shared';

export function PathPicker({ onPick, onSkip, name, colors }: { onPick: (p: Path) => void; onSkip: () => void; name: string; colors: ThemeColors }) {
  const paths = [
    { id: 'upload' as const, kicker: 'A', label: "I've already booked", sub: 'Drop in your confirmation screenshots — we\'ll read them and set up your trip.', icon: FileText },
    { id: 'invited' as const, kicker: 'B', label: 'Someone invited me', sub: 'Trip details are already waiting. Just enter your invite code.', icon: Users },
    { id: 'plan' as const, kicker: 'C', label: 'Plan a new trip', sub: "Tell us where you're dreaming of. We'll shape it into days.", icon: Plane },
  ];

  return (
    <ScrollView contentContainerStyle={shared.scrollContent}>
      <BrandRow colors={colors} />
      <Header
        kicker={`Welcome, ${name}`}
        title="How do you want to start?"
        sub="You can always add another trip later. This is just how you'd like to begin."
        colors={colors}
      />
      <View style={shared.cards}>
        {paths.map((p, i) => (
          <Animated.View key={p.id} entering={FadeInDown.duration(400).delay(150 + i * 80)}>
            <TouchableOpacity
              style={[shared.pathCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPick(p.id); }}
              activeOpacity={0.85}
            >
              <View style={[shared.pathIcon, { backgroundColor: colors.accentBg, borderColor: colors.accentBorder }]}>
                <p.icon size={26} color={colors.accent} strokeWidth={1.6} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[shared.pathKicker, { color: colors.accent }]}>Option {p.kicker}</Text>
                <Text style={[shared.pathLabel, { color: colors.text }]}>{p.label}</Text>
                <Text style={[shared.pathSub, { color: colors.text2 }]}>{p.sub}</Text>
              </View>
              <View style={[shared.pathArrow, { backgroundColor: colors.card2, borderColor: colors.border }]}>
                <ArrowRight size={12} color={colors.text2} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
      <Text style={[shared.hint, { color: colors.text3 }]}>
        Already booked? Start with <Text style={{ color: colors.accent, fontWeight: '600' }}>I've already booked</Text> — we'll read your confirmation and set everything up.
      </Text>
      <TouchableOpacity onPress={onSkip} style={shared.skipBtn} activeOpacity={0.7}>
        <Text style={[shared.skipText, { color: colors.text3 }]}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
