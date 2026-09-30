import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Plane, Users } from 'lucide-react-native';
import { useTheme, ThemeColors } from '@/constants/ThemeContext';
import { formatDatePHT } from '@/lib/utils';

interface PlanningCardProps {
  destination?: string;
  startDate: string;
  endDate: string;
}

export function PlanningCard({ destination, startDate, endDate }: PlanningCardProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const router = useRouter();

  return (
    <View style={styles.planningCard}>
      <Text style={styles.planningEmoji}>🗺️</Text>
      <Text style={styles.planningTitle}>Planning your trip</Text>
      <Text style={styles.planningSubtitle}>
        {destination} · {formatDatePHT(startDate)} – {formatDatePHT(endDate)}
      </Text>
      <View style={styles.planningNudges}>
        <Pressable style={styles.nudgeRow} onPress={() => router.push('/(tabs)/trip')}>
          <Plane size={16} color={colors.accent} />
          <Text style={styles.nudgeText}>Add your flights</Text>
        </Pressable>
        <Pressable style={styles.nudgeRow} onPress={() => router.push('/invite')}>
          <Users size={16} color={colors.accent} />
          <Text style={styles.nudgeText}>Invite travel companions</Text>
        </Pressable>
        <Pressable style={styles.nudgeRow} onPress={() => router.push('/(tabs)/discover')}>
          <MapPin size={16} color={colors.accent} />
          <Text style={styles.nudgeText}>Discover places to visit</Text>
        </Pressable>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    planningCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    planningEmoji: {
      fontSize: 36,
      marginBottom: 12,
    },
    planningTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    planningSubtitle: {
      fontSize: 13,
      color: colors.text2,
      marginBottom: 20,
    },
    planningNudges: {
      width: '100%',
      gap: 12,
    },
    nudgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.accentDim,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    nudgeText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.accent,
    },
  });
