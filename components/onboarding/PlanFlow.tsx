import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight, CheckCircle } from 'lucide-react-native';
import { ThemeColors } from '@/constants/ThemeContext';
import { BrandRow, FieldLabel, GhostBtn, Header, Input, PrimaryBtn, shared } from './shared';

export function PlanFlow({ onBack, onDone, colors }: { onBack: () => void; onDone: (data: any) => void; colors: ThemeColors }) {
  const [step, setStep] = useState(0);
  const [dest, setDest] = useState('');
  const [vibes, setVibes] = useState<string[]>([]);
  const [when, setWhen] = useState('');
  const [travelers, setTravelers] = useState(2);

  const VIBES = [
    { id: 'beach', label: 'Beach & water', icon: '🌊' },
    { id: 'food', label: 'Food-first', icon: '🍜' },
    { id: 'culture', label: 'Culture & arts', icon: '🏛' },
    { id: 'nature', label: 'Nature & hikes', icon: '🌿' },
    { id: 'chill', label: 'Slow & restful', icon: '🕯' },
    { id: 'party', label: 'Nightlife', icon: '🎶' },
  ];
  const WHEN = ['This month', 'Next month', 'In 2–3 months', 'Later this year', 'Flexible'];
  const DESTS = ['Boracay', 'Tokyo', 'Bali', 'Lisbon', 'Hoi An'];

  if (step === 0) {
    return (
      <ScrollView contentContainerStyle={shared.scrollContent}>
        <BrandRow step={1} of={3} colors={colors} />
        <Header onBack={onBack} kicker="Plan — 1 of 3" title="Where are you dreaming of?" sub="A city, country, or just a feeling." colors={colors} />
        <View style={shared.section}>
          <FieldLabel label="Destination" colors={colors} />
          <Input value={dest} onChange={setDest} placeholder="Lisbon, Kyoto, somewhere warm…" colors={colors} autoFocus />
          <View style={shared.chipRow}>
            {DESTS.map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => setDest(s)}
                style={[shared.chip, { backgroundColor: dest === s ? colors.accentBg : colors.card, borderColor: dest === s ? colors.accentBorder : colors.border }]}
              >
                <Text style={[shared.chipText, { color: dest === s ? colors.accent : colors.text2 }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <PrimaryBtn onPress={() => setStep(1)} disabled={!dest.trim()} colors={colors}>
            <Text style={[shared.primaryText, { color: !dest.trim() ? colors.text3 : colors.onBlack }]}>Continue</Text>
            <ArrowRight size={14} color={!dest.trim() ? colors.text3 : colors.onBlack} strokeWidth={2} />
          </PrimaryBtn>
        </View>
      </ScrollView>
    );
  }

  if (step === 1) {
    return (
      <ScrollView contentContainerStyle={shared.scrollContent}>
        <BrandRow step={2} of={3} colors={colors} />
        <Header onBack={() => setStep(0)} kicker="Plan — 2 of 3" title="What's the shape of this trip?" sub="Pick whatever feels right. Multi-select is fine." colors={colors} />
        <View style={shared.section}>
          <View style={shared.vibeGrid}>
            {VIBES.map(v => {
              const on = vibes.includes(v.id);
              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => setVibes(vs => vs.includes(v.id) ? vs.filter(x => x !== v.id) : [...vs, v.id])}
                  style={[shared.vibeCard, { backgroundColor: on ? colors.accentBg : colors.card, borderColor: on ? colors.accent : colors.border }]}
                >
                  <Text style={shared.vibeEmoji}>{v.icon}</Text>
                  <Text style={[shared.vibeLabel, { color: on ? colors.accent : colors.text }]}>{v.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <PrimaryBtn onPress={() => setStep(2)} disabled={vibes.length === 0} colors={colors}>
            <Text style={[shared.primaryText, { color: vibes.length === 0 ? colors.text3 : colors.onBlack }]}>Continue</Text>
            <ArrowRight size={14} color={vibes.length === 0 ? colors.text3 : colors.onBlack} strokeWidth={2} />
          </PrimaryBtn>
          <GhostBtn label="Skip — I'll decide later" onPress={() => setStep(2)} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={shared.scrollContent}>
      <BrandRow step={3} of={3} colors={colors} />
      <Header onBack={() => setStep(1)} kicker="Plan — 3 of 3" title="When, and with whom?" sub="Rough dates work. You can refine everything later." colors={colors} />
      <View style={shared.section}>
        <FieldLabel label="Approximate dates" colors={colors} />
        {WHEN.map(opt => {
          const on = when === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => setWhen(opt)}
              style={[shared.optionBtn, { backgroundColor: on ? colors.accentBg : colors.card, borderColor: on ? colors.accent : colors.border }]}
            >
              <Text style={[shared.optionText, { color: on ? colors.accent : colors.text }]}>{opt}</Text>
              {on && <CheckCircle size={16} color={colors.accent} strokeWidth={2} />}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 14 }} />
        <FieldLabel label="Travelers" colors={colors} />
        <View style={[shared.stepperRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View>
            <Text style={[shared.stepperValue, { color: colors.text }]}>{travelers} {travelers === 1 ? 'person' : 'people'}</Text>
            <Text style={[shared.stepperHint, { color: colors.text3 }]}>Including you</Text>
          </View>
          <View style={shared.stepperBtns}>
            <TouchableOpacity onPress={() => setTravelers(Math.max(1, travelers - 1))} style={[shared.stepperBtn, { backgroundColor: colors.card2, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTravelers(travelers + 1)} style={[shared.stepperBtn, { backgroundColor: colors.card2, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 14 }} />
        <PrimaryBtn onPress={() => onDone({ kind: 'plan', dest, vibes, when, travelers })} disabled={!when} colors={colors}>
          <Text style={[shared.primaryText, { color: !when ? colors.text3 : colors.onBlack }]}>Draft my trip</Text>
          <ArrowRight size={14} color={!when ? colors.text3 : colors.onBlack} strokeWidth={2} />
        </PrimaryBtn>
        <Text style={[shared.footnote, { color: colors.text3 }]}>
          We'll sketch a starting itinerary you can reshape.
        </Text>
      </View>
    </ScrollView>
  );
}
