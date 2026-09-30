import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { StickyNote } from 'lucide-react-native';
import EmptyState from '@/components/shared/EmptyState';
import { NOTES } from './guideConstants';
import type { ThemeColors } from './guideConstants';

interface NotesTabProps {
  colors: ThemeColors;
  isCanyon: boolean;
}

export function NotesTab({ colors, isCanyon }: NotesTabProps) {
  const styles = getStyles(colors);

  if (!isCanyon) {
    return (
      <EmptyState
        icon={StickyNote}
        title="No notes yet"
        subtitle="Add tips and reminders for your travel group — check-in tricks, local fares, sunset spots."
      />
    );
  }

  return (
    <>
      {/* Notes header */}
      <View style={styles.notesHeader}>
        <Text style={styles.notesCount}>
          {NOTES.length} notes {'\u00B7'} shared with group
        </Text>
        <TouchableOpacity
          style={styles.newNoteBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="New note"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.prompt(
              'New note',
              'Add a quick note for the group',
              (_text) => {
                // Note creation will be wired to the API
              },
              'plain-text',
            );
          }}
        >
          <Text style={styles.newNoteBtnText}>+ New note</Text>
        </TouchableOpacity>
      </View>

      {/* Notes list */}
      <View style={styles.notesList}>
        {NOTES.map((n, i) => (
          <View key={i} style={styles.noteCard}>
            <View style={styles.noteTopRow}>
              <Text style={styles.noteTitle}>{n.title}</Text>
              <Text style={styles.noteTime}>{n.time}</Text>
            </View>
            <Text style={styles.noteBody}>{n.body}</Text>
            <View style={styles.noteFooter}>
              <Text style={styles.noteByLabel}>
                by{' '}
                <Text style={styles.noteByName}>{n.by}</Text>
              </Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    notesHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    notesCount: {
      fontSize: 12,
      color: colors.text3,
    },
    newNoteBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: colors.black,
    },
    newNoteBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.onBlack,
    },
    notesList: {
      paddingHorizontal: 16,
      gap: 10,
    },
    noteCard: {
      padding: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
    },
    noteTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    noteTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    noteTime: {
      fontSize: 10,
      color: colors.text3,
    },
    noteBody: {
      fontSize: 12.5,
      color: colors.text2,
      lineHeight: 18.125, // 12.5 * 1.45
    },
    noteFooter: {
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    noteByLabel: {
      fontSize: 10.5,
      color: colors.text3,
    },
    noteByName: {
      color: colors.accent,
      fontWeight: '600',
    },
  });
