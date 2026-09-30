import React, { useMemo } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';
import { radius } from '@/constants/theme';

interface PaymentQr {
  label: string;
  uri: string;
}

interface BudgetModalsProps {
  showQrModal: boolean;
  viewingQr: PaymentQr | null;
  onCloseQr: () => void;
  showQrNameModal: boolean;
  qrNameInput: string;
  onChangeQrName: (text: string) => void;
  onDismissQrName: () => void;
  onCancelQrName: () => void;
  onSaveQrName: () => void;
  showBudgetModal: boolean;
  budgetInput: string;
  onChangeBudget: (text: string) => void;
  onCancelBudget: () => void;
  onSaveBudget: () => void;
}

export default function BudgetModals({
  showQrModal,
  viewingQr,
  onCloseQr,
  showQrNameModal,
  qrNameInput,
  onChangeQrName,
  onDismissQrName,
  onCancelQrName,
  onSaveQrName,
  showBudgetModal,
  budgetInput,
  onChangeBudget,
  onCancelBudget,
  onSaveBudget,
}: BudgetModalsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <>
      {/* QR view modal */}
      <Modal visible={showQrModal} transparent animationType="fade" onRequestClose={onCloseQr}>
        <Pressable style={styles.modalOverlay} onPress={onCloseQr}>
          <View style={styles.qrModalCard}>
            <Text style={styles.qrModalTitle}>{viewingQr?.label ?? 'Payment QR'}</Text>
            {viewingQr && (
              <Image source={{ uri: viewingQr.uri }} style={styles.qrModalImage} resizeMode="contain" />
            )}
            <TouchableOpacity onPress={onCloseQr} style={styles.qrModalClose}>
              <Text style={[styles.modalBtn, { color: colors.text3 }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* QR name input modal */}
      <Modal visible={showQrNameModal} transparent animationType="fade" onRequestClose={onDismissQrName}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Name this QR</Text>
            <TextInput
              style={styles.modalInput}
              value={qrNameInput}
              onChangeText={onChangeQrName}
              placeholder="e.g. GCash, Maya, BPI"
              placeholderTextColor={colors.text3}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={onCancelQrName}>
                <Text style={[styles.modalBtn, { color: colors.text3 }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSaveQrName}>
                <Text style={[styles.modalBtn, { color: colors.accent }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit budget modal */}
      <Modal visible={showBudgetModal} transparent animationType="fade" onRequestClose={onCancelBudget}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Set Budget</Text>
            <TextInput
              style={styles.modalInput}
              value={budgetInput}
              onChangeText={onChangeBudget}
              keyboardType="numeric"
              placeholder="50000"
              placeholderTextColor={colors.text3}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={onCancelBudget}><Text style={[styles.modalBtn, { color: colors.text3 }]}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={onSaveBudget}><Text style={[styles.modalBtn, { color: colors.accent }]}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const getStyles = (c: ThemeColors) => StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  qrModalCard: { width: '85%', backgroundColor: c.bg2, borderRadius: radius.lg, padding: 24, borderWidth: 1, borderColor: c.border, alignItems: 'center' },
  qrModalTitle: { fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 16 },
  qrModalImage: { width: 260, height: 260, borderRadius: 12 },
  qrModalClose: { marginTop: 16 },
  modalCard: { width: '85%', backgroundColor: c.bg2, borderRadius: radius.lg, padding: 24, borderWidth: 1, borderColor: c.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 16 },
  modalInput: { backgroundColor: c.bg, borderRadius: radius.sm, borderWidth: 1, borderColor: c.border, color: c.text, fontSize: 18, letterSpacing: -0.3, paddingHorizontal: 14, paddingVertical: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 16 },
  modalBtn: { fontSize: 14, fontWeight: '600' },
});
