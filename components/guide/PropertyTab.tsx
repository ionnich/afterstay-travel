import React from 'react';
import { Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { Hotel } from 'lucide-react-native';
import EmptyState from '@/components/shared/EmptyState';
import type { Trip } from '@/lib/types';
import { AMENITIES, PROPERTY } from './guideConstants';
import type { ThemeColors } from './guideConstants';

interface PropertyTabProps {
  colors: ThemeColors;
  hotelName: string;
  hotelAddr: string;
  checkInTime: string;
  checkOutTime: string;
  checkInDate: string;
  checkOutDate: string;
  hotelPhotoUrl: string;
  trip: Trip | null;
  hasAccommodation: boolean;
  isCanyon: boolean;
  onAddHotel: () => void;
}

function AmenityIcon({ id, color }: { id: string; color: string }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (id) {
    case 'pool':
      return (
        <Svg {...props}>
          <Path d="M2 20c2 0 2-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2" />
          <Path d="M2 15c2 0 2-2 5-2s3 2 5 2 3-2 5-2 3 2 5 2" />
          <Path d="M8 11V4a2 2 0 012-2h2a2 2 0 012 2v7" />
        </Svg>
      );
    case 'wifi':
      return (
        <Svg {...props}>
          <Path d="M5 12.5a10 10 0 0114 0" />
          <Path d="M8.5 15.5a5 5 0 017 0" />
          <Circle cx={12} cy={19} r={1} fill={color} />
        </Svg>
      );
    case 'breakfast':
      return (
        <Svg {...props}>
          <Path d="M3 12h14a4 4 0 010 8H5a2 2 0 01-2-2z" />
          <Path d="M8 7a2 2 0 014 0 2 2 0 004 0M17 12v-2a3 3 0 016 0v2" />
        </Svg>
      );
    case 'gym':
      return (
        <Svg {...props} strokeLinejoin={undefined}>
          <Path d="M6 8v8M18 8v8M2 12h4M18 12h4M9 10v4M15 10v4" />
        </Svg>
      );
    case 'shuttle':
      return (
        <Svg {...props}>
          <Rect x={3} y={6} width={18} height={12} rx={2} />
          <Path d="M3 12h18M7 18v2M17 18v2" />
          <Circle cx={7} cy={14} r={1} fill={color} />
          <Circle cx={17} cy={14} r={1} fill={color} />
        </Svg>
      );
    case 'spa':
      return (
        <Svg {...props}>
          <Path d="M12 22c-6 0-10-4-10-10 0-3 2-6 4-6s4 2 4 4M12 22c6 0 10-4 10-10 0-3-2-6-4-6s-4 2-4 4" />
        </Svg>
      );
    default:
      return null;
  }
}

export function PropertyTab({
  colors,
  hotelName,
  hotelAddr,
  checkInTime,
  checkOutTime,
  checkInDate,
  checkOutDate,
  hotelPhotoUrl,
  trip,
  hasAccommodation,
  isCanyon,
  onAddHotel,
}: PropertyTabProps) {
  const styles = getStyles(colors);

  if (!hasAccommodation && !isCanyon) {
    return (
      <EmptyState
        icon={Hotel}
        title="No accommodation added"
        subtitle="Add your hotel or stay details to see check-in times, amenities, and contact info."
        actionLabel="Add Hotel Details"
        onAction={onAddHotel}
      />
    );
  }

  return (
    <>
      {/* Hero image */}
      <View style={styles.heroWrapper}>
        <View style={styles.heroCard}>
          <View style={styles.heroImageBg}>
            <Image
              source={{ uri: hotelPhotoUrl }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
            <View style={styles.heroGradient} />
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroName}>{hotelName}</Text>
              <Text style={styles.heroDesc}>{hotelAddr}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Check-in / Check-out times */}
      <View style={styles.timesWrapper}>
        <View style={styles.timesGrid}>
          <View style={styles.timeCard}>
            <Text style={styles.timeEyebrow}>Check-in</Text>
            <Text style={styles.timeValue}>{checkInTime}</Text>
            <Text style={styles.timeDate}>{checkInDate}</Text>
          </View>
          <View style={styles.timeCard}>
            <Text style={styles.timeEyebrow}>Check-out</Text>
            <Text style={styles.timeValue}>{checkOutTime}</Text>
            <Text style={styles.timeDate}>{checkOutDate}</Text>
          </View>
        </View>
      </View>

      {/* Amenities */}
      <View style={styles.groupHeader}>
        <Text style={styles.eyebrow}>Amenities</Text>
        <Text style={styles.groupTitle}>What{'\u2019'}s included</Text>
      </View>
      <View style={styles.amenityGridWrapper}>
        <View style={styles.amenityGrid}>
          {AMENITIES.map((a) => (
            <View key={a.n} style={styles.amenityCell}>
              <View style={{ marginBottom: 8 }}>
                <AmenityIcon id={a.iconId} color={colors.accent} />
              </View>
              <Text style={styles.amenityLabel}>{a.n}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Contact */}
      <View style={styles.groupHeader}>
        <Text style={styles.eyebrow}>Contact</Text>
        <Text style={styles.groupTitle}>Reach the property</Text>
      </View>
      <View style={styles.contactList}>
        {/* Phone */}
        <TouchableOpacity
          style={styles.contactRow}
          onPress={async () => {
            const phone = trip?.hotelPhone ?? PROPERTY.phone;
            const url = `tel:${phone.replace(/[^+\d]/g, '')}`;
            try {
              await Linking.openURL(url);
            } catch {
              if (__DEV__) console.warn('Failed to open URL:', url);
            }
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Call ${trip?.hotelPhone ?? PROPERTY.phone}`}
        >
          <View style={styles.contactIcon}>
            <Svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.accent}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path d="M22 16.9v3a2 2 0 01-2.2 2 20 20 0 01-8.6-3.1 19.5 19.5 0 01-6-6A20 20 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1 1 .3 1.9.6 2.8a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.2-1.1a2 2 0 012.1-.5c.9.3 1.8.5 2.8.6a2 2 0 011.7 2z" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>{trip?.hotelPhone ?? PROPERTY.phone}</Text>
            <Text style={styles.contactMeta}>
              Reception {'\u00B7'} 24 hours
            </Text>
          </View>
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity
          style={styles.contactRow}
          onPress={async () => {
            const url = `mailto:${PROPERTY.email}`;
            try {
              await Linking.openURL(url);
            } catch {
              if (__DEV__) console.warn('Failed to open URL:', url);
            }
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Email ${PROPERTY.email}`}
        >
          <View style={styles.contactIcon}>
            <Svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.accent}
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Rect x={3} y={5} width={18} height={14} rx={2} />
              <Polyline points="3 7 12 13 21 7" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>{PROPERTY.email}</Text>
            <Text style={styles.contactMeta}>Reservations</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Hero
    heroWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
    heroCard: {
      height: 200,
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    heroImageBg: {
      flex: 1,
      backgroundColor: colors.card2,
    },
    heroGradient: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    heroTextBlock: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 14,
    },
    heroName: {
      fontSize: 20,
      fontWeight: '500',
      letterSpacing: -0.6,
      color: '#fff',
      lineHeight: 22,
      marginBottom: 3,
      textShadowColor: 'rgba(0,0,0,0.6)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    heroDesc: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.8)',
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },

    // Times
    timesWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
    timesGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    timeCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 22,
      padding: 14,
    },
    timeEyebrow: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color: colors.text3,
    },
    timeValue: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginTop: 6,
      letterSpacing: 0.4,
    },
    timeDate: {
      fontSize: 10.5,
      color: colors.text3,
      marginTop: 2,
    },

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

    // Amenities
    amenityGridWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 14,
    },
    amenityGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    amenityCell: {
      width: '31%',
      paddingVertical: 14,
      paddingHorizontal: 10,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      alignItems: 'center',
    },
    amenityLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 13.2,
      textAlign: 'center',
    },

    // Contact
    contactList: {
      paddingHorizontal: 16,
      gap: 8,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
    },
    contactIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    contactMeta: {
      fontSize: 11,
      color: colors.text3,
      marginTop: 2,
    },
  });
