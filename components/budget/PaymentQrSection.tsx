import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { QrCode } from 'lucide-react-native';
import { useTheme } from '@/constants/ThemeContext';
import type { ThemeColors } from '@/constants/ThemeContext';

interface PaymentQr {
  label: string;
  uri: string;
}

interface PaymentQrSectionProps {
  paymentQrs: PaymentQr[];
  onShowQr: (qr: PaymentQr) => void;
  onRemoveQr: (idx: number) => void;
  onAddQr: () => void;
}

export default function PaymentQrSection({
  paymentQrs,
  onShowQr,
  onRemoveQr,
  onAddQr,
}: PaymentQrSectionProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment QR</Text>
      <View style={{ gap: 8 }}>
        {paymentQrs.map((qr, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.qrRow}
            onPress={() => onShowQr(qr)}
            onLongPress={() => onRemoveQr(idx)}
            activeOpacity={0.7}
          >
            <View style={[styles.qrThumb, { borderColor: colors.border }]}>
              <Image source={{ uri: qr.uri }} style={{ width: 44, height: 44, borderRadius: 8 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.qrLabel}>{qr.label}</Text>
              <Text style={styles.qrHint}>Tap to show · long press to remove</Text>
            </View>
            <QrCode size={20} color={colors.accent} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.qrUploadBtn} onPress={onAddQr} activeOpacity={0.7}>
          <QrCode size={18} color={colors.accent} />
          <Text style={styles.qrUploadText}>{paymentQrs.length > 0 ? 'Add another QR' : 'Add payment QR'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (c: ThemeColors) => StyleSheet.create({
  section: { paddingHorizontal: 16, paddingTop: 14, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: c.text },
  qrRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 16 },
  qrThumb: { width: 48, height: 48, borderRadius: 10, borderWidth: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  qrLabel: { fontSize: 13, fontWeight: '600', color: c.text },
  qrHint: { fontSize: 10, color: c.text3, marginTop: 2 },
  qrUploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: c.card, borderWidth: 1, borderColor: c.accentBorder, borderRadius: 16, borderStyle: 'dashed' },
  qrUploadText: { fontSize: 13, fontWeight: '600', color: c.accent },
});
