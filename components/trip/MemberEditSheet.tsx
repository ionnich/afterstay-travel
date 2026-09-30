import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { GroupMember } from '@/lib/types';
import type { ThemeColors } from './tripConstants';

interface MemberEditSheetProps {
  member: GroupMember | null;
  editField: 'email' | 'phone' | null;
  editValue: string;
  colors: ThemeColors;
  onClose: () => void;
  onDismiss: () => void;
  onBack: () => void;
  onAction: (action: string) => void;
  onChangeValue: (v: string) => void;
}

export function MemberEditSheet({
  member,
  editField,
  editValue,
  colors,
  onClose,
  onDismiss,
  onBack,
  onAction,
  onChangeValue,
}: MemberEditSheetProps) {
  const styles = getStyles(colors);

  return (
    <Modal
      visible={!!member}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetOverlay} onPress={onDismiss}>
        <Pressable style={styles.sheetContent} onPress={(e) => e.stopPropagation()}>
          {member && !editField && (
            <>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{member.name}</Text>
                <Text style={styles.sheetSub}>
                  {member.userId ? 'On the app' : 'Not yet joined — send an invite'}
                </Text>
              </View>
              <View style={styles.sheetActions}>
                {!member.userId && (
                  <Pressable style={styles.sheetBtn} onPress={() => onAction('invite')}>
                    <Text style={styles.sheetBtnAccent}>Send Invite Link</Text>
                  </Pressable>
                )}
                <Pressable style={styles.sheetBtn} onPress={() => onAction('calendar')}>
                  <Text style={styles.sheetBtnAccent}>Send Calendar Invite</Text>
                  {member.email && <Text style={styles.sheetBtnMeta}>{member.email}</Text>}
                </Pressable>
                <Pressable style={styles.sheetBtn} onPress={() => onAction('photo')}>
                  <Text style={styles.sheetBtnText}>Change Photo</Text>
                </Pressable>
                <Pressable style={styles.sheetBtn} onPress={() => onAction('email')}>
                  <Text style={styles.sheetBtnText}>Edit Email</Text>
                  {member.email && <Text style={styles.sheetBtnMeta}>{member.email}</Text>}
                </Pressable>
                <Pressable style={styles.sheetBtn} onPress={() => onAction('phone')}>
                  <Text style={styles.sheetBtnText}>Edit Phone</Text>
                  {member.phone && <Text style={styles.sheetBtnMeta}>{member.phone}</Text>}
                </Pressable>
              </View>
              <Pressable style={styles.sheetClose} onPress={onClose}>
                <Text style={styles.sheetCloseText}>Cancel</Text>
              </Pressable>
            </>
          )}
          {member && editField && (
            <>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{editField === 'email' ? 'Edit Email' : 'Edit Phone'}</Text>
                <Text style={styles.sheetSub}>{member.name}</Text>
              </View>
              <TextInput
                style={styles.sheetInput}
                value={editValue}
                onChangeText={onChangeValue}
                placeholder={editField === 'email' ? 'email@example.com' : '+63 912 345 6789'}
                placeholderTextColor={colors.text3}
                keyboardType={editField === 'email' ? 'email-address' : 'phone-pad'}
                autoFocus
              />
              <Pressable
                style={[styles.sheetSaveBtn, !editValue.trim() && { opacity: 0.4 }]}
                onPress={() => onAction('save')}
                disabled={!editValue.trim()}
              >
                <Text style={styles.sheetSaveBtnText}>Save</Text>
              </Pressable>
              <Pressable style={styles.sheetClose} onPress={onBack}>
                <Text style={styles.sheetCloseText}>Back</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sheetOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    sheetContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 34,
      paddingTop: 20,
      paddingHorizontal: 20,
    },
    sheetHeader: {
      alignItems: 'center',
      marginBottom: 20,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },
    sheetSub: {
      fontSize: 12,
      color: colors.text3,
      marginTop: 4,
    },
    sheetActions: {
      gap: 2,
    },
    sheetBtn: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 16,
      backgroundColor: colors.bg,
      borderRadius: 12,
      marginBottom: 6,
    },
    sheetBtnText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    sheetBtnAccent: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accent,
    },
    sheetBtnMeta: {
      fontSize: 12,
      color: colors.text3,
    },
    sheetClose: {
      alignItems: 'center',
      paddingVertical: 14,
      marginTop: 8,
      backgroundColor: colors.bg,
      borderRadius: 12,
    },
    sheetCloseText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text2,
    },
    sheetInput: {
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 12,
    },
    sheetSaveBtn: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    sheetSaveBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.bg,
    },
  });
