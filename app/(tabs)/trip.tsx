import { useEffect, useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Map, MoreHorizontal, Share2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import AddTripSheet from '@/components/summary/AddTripSheet';
import EmptyState from '@/components/shared/EmptyState';
import { TripFloatingActionButton } from '@/components/shared/TripFloatingActionButton';
import { OverviewTab } from '@/components/trip/OverviewTab';
import { SummaryTab } from '@/components/trip/SummaryTab';
import { EssentialsTab } from '@/components/trip/EssentialsTab';
import { MemberEditSheet } from '@/components/trip/MemberEditSheet';
import { useTripScreen } from '@/components/trip/useTripScreen';
import { TAB_KEYS } from '@/components/trip/tripConstants';
import { useTheme } from '@/constants/ThemeContext';

type ThemeColors = ReturnType<typeof useTheme>['colors'];

// ---------- PULSING DOT ----------

function PulsingDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: 1 + (1 - opacity.value) * 0.6 }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 6,
          height: 6,
          borderRadius: 99,
          backgroundColor: color,
        },
        animStyle,
      ]}
    />
  );
}

// ---------- MAIN SCREEN ----------

export default function TripScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const router = useRouter();

  const {
    activeTab,
    setActiveTab,
    addOpen,
    setAddOpen,
    loading,
    refreshing,
    onRefresh,
    trip,
    membersData,
    flightsDisplay,
    hotelPhotos,
    pastTripsDisplay,
    highlightsForStrip,
    totalTrips,
    totalSpent,
    totalNights,
    totalMiles,
    countriesCount,
    destLabel,
    dateRangeLabel,
    packingState,
    packingStats,
    filesData,
    addingItem,
    setAddingItem,
    newItemText,
    setNewItemText,
    togglePackingItem,
    handleAddPackingItem,
    handleUpload,
    handleDownload,
    editMember,
    editField,
    editValue,
    setEditMember,
    setEditField,
    setEditValue,
    handleMemberEdit,
    handleMemberAction,
    handleMemberChat,
    handleInvite,
    handleShare,
    handleMore,
    load,
  } = useTripScreen();

  if (!trip && !loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')} hitSlop={12} accessibilityLabel="Back to Home">
              <ArrowLeft size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Trips</Text>
          </View>
        </View>
        <EmptyState
          icon={Map}
          title="No active trip"
          subtitle="Create a trip to see your overview, packing list, files, and travel companions."
          actionLabel="Get Started"
          onAction={() => router.push('/onboarding')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accentLt}
          />
        }
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/home')} hitSlop={12} accessibilityLabel="Back to Home">
              <ArrowLeft size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.topBarTitle}>Trips</Text>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Share" onPress={handleShare}>
              <Share2 size={16} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} accessibilityLabel="More" onPress={handleMore}>
              <MoreHorizontal size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Active trip pill (overview only) */}
        {activeTab === 'overview' && (
          <View style={styles.pillWrapper}>
            <View style={styles.activePill}>
              <PulsingDot color={colors.accent} />
              <Text style={styles.activePillText}>
                LIVE · {destLabel.toUpperCase() || 'TRIP'} · {dateRangeLabel.toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        {/* Segmented control */}
        <View style={styles.segWrapper}>
          <View style={styles.segmented}>
            {TAB_KEYS.map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.segBtn,
                  activeTab === t && styles.segBtnActive,
                ]}
                onPress={() => {
                  if (t === 'guide') {
                    router.push('/(tabs)/guide' as never);
                  } else {
                    setActiveTab(t);
                  }
                }}
              >
                <Text
                  style={[
                    styles.segText,
                    activeTab === t && styles.segTextActive,
                  ]}
                >
                  {t[0].toUpperCase() + t.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ===================== OVERVIEW ===================== */}
        {activeTab === 'overview' && (
          <OverviewTab
            trip={trip}
            members={membersData}
            flights={flightsDisplay}
            hotelPhotos={hotelPhotos}
            colors={colors}
            onMemberEdit={handleMemberEdit}
            onMemberChat={handleMemberChat}
            onInvite={handleInvite}
            onAddMember={() => router.push('/add-member')}
            onLoad={load}
          />
        )}

        {/* ===================== SUMMARY ===================== */}
        {activeTab === 'summary' && (
          <SummaryTab
            totalMiles={totalMiles}
            totalTrips={totalTrips}
            countriesCount={countriesCount}
            totalNights={totalNights}
            totalSpent={totalSpent}
            highlights={highlightsForStrip}
            pastTrips={pastTripsDisplay}
            colors={colors}
            onAddTrip={() => setAddOpen(true)}
          />
        )}

        {/* ===================== ESSENTIALS ===================== */}
        {activeTab === 'essentials' && (
          <EssentialsTab
            packingState={packingState}
            packingStats={packingStats}
            files={filesData}
            colors={colors}
            addingItem={addingItem}
            newItemText={newItemText}
            onToggleItem={togglePackingItem}
            onSetAddingItem={setAddingItem}
            onSetNewItemText={setNewItemText}
            onAddItem={handleAddPackingItem}
            onUpload={handleUpload}
            onDownload={handleDownload}
          />
        )}

        {/* Bottom spacer -- keep outside tabs */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* FAB — action menu */}
      <TripFloatingActionButton
        onAddTrip={() => setAddOpen(true)}
        onAddEssentials={() => { setActiveTab('essentials'); setAddingItem(true); }}
      />

      {/* Add trip bottom sheet */}
      <AddTripSheet open={addOpen} onClose={() => setAddOpen(false)} />

      {/* Member edit sheet */}
      <MemberEditSheet
        member={editMember}
        editField={editField}
        editValue={editValue}
        colors={colors}
        onClose={() => setEditMember(null)}
        onDismiss={() => { setEditMember(null); setEditField(null); }}
        onBack={() => setEditField(null)}
        onAction={handleMemberAction}
        onChangeValue={setEditValue}
      />
    </SafeAreaView>
  );
}

// ---------- STYLES ----------

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scrollContent: {
      paddingBottom: 120,
    },

    // Top bar
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 8,
    },
    topBarTitle: {
      fontSize: 22,
      fontWeight: '600',
      letterSpacing: -0.66,
      color: colors.text,
    },
    topBarRight: {
      flexDirection: 'row',
      gap: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Active pill
    pillWrapper: {
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    activePill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      paddingVertical: 6,
      paddingLeft: 8,
      paddingRight: 12,
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
      borderRadius: 999,
    },
    activePillText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.accent,
      letterSpacing: 0.44,
    },

    // Segmented control
    segWrapper: {
      paddingHorizontal: 16,
      paddingTop: 4,
      paddingBottom: 16,
    },
    segmented: {
      flexDirection: 'row',
      padding: 3,
      backgroundColor: colors.card2,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      gap: 2,
    },
    segBtn: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 9,
      alignItems: 'center',
    },
    segBtnActive: {
      backgroundColor: colors.card,
    },
    segText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text3,
      letterSpacing: -0.12,
    },
    segTextActive: {
      color: colors.text,
    },

    // Bottom spacer
    bottomSpacer: {
      height: 20,
    },
  });
