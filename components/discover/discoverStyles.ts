import { StyleSheet } from 'react-native';
import { type ThemeColors } from '@/constants/ThemeContext';

export const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },

    // Top bar
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '600',
      letterSpacing: -0.66, // -0.03em
      color: colors.text,
    },
    subtitle: {
      fontSize: 11,
      color: colors.text3,
      letterSpacing: 1.76, // 0.16em
      textTransform: 'uppercase',
      fontWeight: '600',
      marginTop: 2,
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

    // Segmented control
    segWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    seg: {
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
      letterSpacing: -0.12, // -0.01em
    },
    segTextActive: {
      color: colors.text,
    },

    // Prompt card
    promptCard: {
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 22,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      backgroundColor: colors.card,
    },
    promptGlow: {
      position: 'absolute',
      top: -40,
      right: -40,
      width: 140,
      height: 140,
      borderRadius: 999,
      backgroundColor: 'rgba(217, 164, 65, 0.28)',
    },
    promptInner: {
      position: 'relative',
    },
    promptHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    promptIconBox: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    promptTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    promptSub: {
      fontSize: 10.5,
      color: colors.text3,
    },
    promptInputBox: {
      backgroundColor: colors.canvas,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 12,
    },
    promptInput: {
      minHeight: 56,
      color: colors.text,
      fontSize: 13,
    },
    generateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 999,
      backgroundColor: colors.black,
    },
    generateBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onBlack,
    },

    // Section headers
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    eyebrow: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 1.6, // 0.16em
      textTransform: 'uppercase',
      color: colors.text3,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '500',
      letterSpacing: -0.48, // -0.03em
      color: colors.text,
      marginTop: 2,
    },
    backLink: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accent,
      padding: 4,
    },

    // Style cards
    scopeRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    scopePill: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 12,
      backgroundColor: colors.card2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    scopePillActive: {
      backgroundColor: colors.accentBg,
      borderColor: colors.accentBorder,
    },
    scopePillText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text3,
    },
    scopePillTextActive: {
      color: colors.accent,
    },
    styleList: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      gap: 8,
    },
    styleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 13,
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
    },
    styleCardActive: {
      backgroundColor: colors.accentBg,
      borderColor: colors.accentBorder,
    },
    styleRadio: {
      width: 20,
      height: 20,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: colors.border2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    styleRadioActive: {
      borderColor: colors.accent,
    },
    styleRadioDot: {
      width: 9,
      height: 9,
      borderRadius: 999,
      backgroundColor: colors.accent,
    },
    styleLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    styleSub: {
      fontSize: 11,
      color: colors.text3,
      marginTop: 2,
    },

    // Trending
    trendingRow: {
      paddingHorizontal: 16,
      paddingBottom: 14,
      gap: 10,
    },

    // Search
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 14,
      paddingVertical: 11,
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
    },

    // Chips
    chipRow: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      gap: 6,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.text2,
    },
    chipTextActive: {
      color: colors.ink,
    },

    // Filter toggle
    filterBarInline: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      backgroundColor: colors.card,
    },

    // Results count
    resultsCount: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text3,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    filterBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 7,
      paddingHorizontal: 11,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    filterBtnActive: {
      borderColor: colors.accent,
      backgroundColor: colors.accentBg,
    },


    // Filter panel
    filterPanel: {
      marginHorizontal: 16,
      marginBottom: 14,
      padding: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      gap: 14,
    },
    filterFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    filterResetText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text3,
      padding: 4,
    },
    filterShowBtn: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: colors.black,
    },
    filterShowBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.onBlack,
    },

    // Place list
    placeList: {
      paddingHorizontal: 16,
      gap: 12,
    },
    viewMapBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      marginHorizontal: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 999,
      backgroundColor: colors.accentBg,
    },
    viewMapText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accent,
    },
    emptyPlaces: {
      paddingVertical: 28,
      paddingHorizontal: 16,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 12,
      color: colors.text3,
    },
    showMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      marginTop: 4,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      backgroundColor: colors.card,
    },
    showMoreText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.accent,
    },

    // Saved empty state
    emptyCard: {
      paddingVertical: 36,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      borderRadius: 16,
    },
    emptyCardTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginTop: 8,
      marginBottom: 4,
    },
    emptyCardBody: {
      fontSize: 12,
      color: colors.text3,
    },

    // Saved header
    savedHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    savedCount: {
      fontSize: 12,
      color: colors.text3,
    },
    clearAllText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text3,
    },

    // Error text
    errorText: {
      fontSize: 12,
      color: colors.danger,
      textAlign: 'center',
      paddingVertical: 4,
    },

    // Itinerary cards
    itineraryCard: {
      padding: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      gap: 8,
    },
    itineraryDayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itineraryDayLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.accent,
    },
    itineraryDate: {
      fontSize: 11,
      color: colors.text3,
      fontWeight: '600',
    },
    itineraryTheme: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    itinerarySlot: {
      gap: 2,
    },
    itinerarySlotLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.text3,
    },
    itinerarySlotText: {
      fontSize: 12,
      color: colors.text2,
      lineHeight: 17,
    },
    itineraryTipBox: {
      marginTop: 4,
      paddingVertical: 8,
      paddingHorizontal: 10,
      backgroundColor: colors.accentBg,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },
    itineraryTipText: {
      fontSize: 11,
      color: colors.accent,
      fontWeight: '500',
    },

    // Activity cards
    activityCard: {
      padding: 12,
      backgroundColor: colors.bg2,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    activityEmoji: {
      fontSize: 20,
      marginTop: 2,
    },
    activityName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    activityMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 2,
    },
    activitySlot: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    activityDot: {
      fontSize: 10,
      color: colors.text3,
    },
    activityDetail: {
      fontSize: 10,
      color: colors.text3,
    },
    activityDesc: {
      fontSize: 12,
      color: colors.text2,
      lineHeight: 17,
      paddingLeft: 30,
    },
    activityNavBtn: {
      alignSelf: 'flex-start',
      marginLeft: 30,
      marginTop: 2,
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 8,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    activityNavText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
    },

    // ── Manual Planner ──
    plannerSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      marginBottom: 12,
    },
    plannerCount: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginTop: 2,
    },
    browsePlacesBtn: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      backgroundColor: colors.accentBg,
      borderWidth: 1,
      borderColor: colors.accentBorder,
    },
    browsePlacesBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accent,
    },
    plannerDayRow: {
      paddingBottom: 14,
      gap: 8,
    },
    plannerDayChip: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      minWidth: 64,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
    },
    plannerDayLabel: {
      fontSize: 9.5,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    plannerDayNum: {
      fontSize: 15,
      fontWeight: '600',
      marginTop: 2,
    },
    plannerDayCount: {
      fontSize: 10,
      marginTop: 2,
    },
    plannerTimeline: {
      paddingTop: 4,
      paddingBottom: 18,
    },
    plannerDayEyebrow: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.text3,
      marginBottom: 10,
    },
    plannerEmptyCard: {
      paddingVertical: 28,
      paddingHorizontal: 20,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border2,
      borderRadius: 16,
    },
    plannerEmptyTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    plannerEmptyBody: {
      fontSize: 12,
      color: colors.text3,
      marginBottom: 14,
      textAlign: 'center',
    },
    plannerEmptyBtn: {
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 10,
      backgroundColor: colors.black,
    },
    plannerEmptyBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.onBlack,
    },
    plannerLine: {
      position: 'absolute',
      left: 36,
      top: 8,
      bottom: 8,
      width: 1,
    },
    plannerItemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 10,
    },
    plannerItemTime: {
      width: 44,
      fontSize: 11,
      fontWeight: '600',
      color: colors.text2,
      paddingTop: 14,
      textAlign: 'right',
      fontFamily: 'SpaceMono',
    },
    plannerDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      borderWidth: 2,
      marginTop: 16,
    },
    plannerItemCard: {
      flex: 1,
      padding: 12,
      borderWidth: 1,
      borderRadius: 12,
    },
    plannerItemHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    plannerItemTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    plannerItemNote: {
      fontSize: 11,
      color: colors.text3,
      marginTop: 4,
    },

    // ── Top Picks ──
    topPicksSection: {
      marginBottom: 16,
    },
    topPicksTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    topPickCard: {
      width: 140,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      overflow: 'hidden',
      paddingBottom: 10,
    },
    topPickImage: {
      width: 140,
      height: 90,
      backgroundColor: colors.card2,
    },
    topPickLabel: {
      fontSize: 9.5,
      fontWeight: '600',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.accent,
      paddingHorizontal: 10,
      paddingTop: 8,
    },
    topPickName: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      paddingHorizontal: 10,
      marginTop: 2,
    },
  });
