import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { Colors, Spacing, Fonts, Shadows } from '../theme';

export default function DetailScreen({ route, navigation }) {
  const { device } = route.params;
  const [connected, setConnected] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rssi, setRssi] = useState(device.rssi);

  const connectAndDiscover = async () => {
    setLoading(true);
    try {
      await BleManager.connect(device.id);
      setConnected(true);
      const discServices = await BleManager.retrieveServices(device.id);
      const allServices = [];
      for (const svc of discServices.characteristics || []) {
        allServices.push({
          uuid: svc.service,
          characteristics: discServices.characteristics.filter(c => c.service === svc.service),
        });
      }
      const uniqueServices = [...new Map(allServices.map(s => [s.uuid, s])).values()];
      setServices(uniqueServices);
    } catch (e) {
      console.log('Connect error:', e);
    }
    setLoading(false);
  };

  const disconnect = async () => {
    try {
      await BleManager.disconnect(device.id);
      setConnected(false);
      setServices([]);
    } catch (e) { console.log(e); }
  };

  const readRssi = async () => {
    try {
      const r = await BleManager.readRSSI(device.id);
      setRssi(r);
    } catch (e) {}
  };

  useEffect(() => {
    connectAndDiscover();
    return () => { try { BleManager.disconnect(device.id); } catch (e) {} };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Device Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, Shadows.sm]}>
          <Text style={styles.deviceName}>{device.name || device.localName || 'Unknown'}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>MAC Address</Text>
            <Text style={styles.value}>{device.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Signal RSSI</Text>
            <Text style={[styles.value, { color: Colors.success }]}>{rssi} dBm</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: connected ? Colors.success : Colors.error }]} />
            <Text style={styles.statusText}>{connected ? 'Connected' : 'Disconnected'}</Text>
          </View>

          <View style={styles.btnRow}>
            {!connected ? (
              <TouchableOpacity style={styles.connectBtn} onPress={connectAndDiscover} disabled={loading}>
                {loading
                  ? <ActivityIndicator color={Colors.white} />
                  : <Text style={styles.connectBtnText}>Connect</Text>}
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={[styles.connectBtn, { backgroundColor: Colors.surfaceLight }]} onPress={readRssi}>
                  <Text style={styles.connectBtnText}>Read RSSI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.connectBtn, { backgroundColor: Colors.error }]} onPress={disconnect}>
                  <Text style={styles.connectBtnText}>Disconnect</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {services.length > 0 && (
          <Text style={styles.sectionTitle}>Services ({services.length})</Text>
        )}
        {services.map((svc, i) => (
          <View key={svc.uuid || i} style={[styles.card, styles.serviceCard, Shadows.sm]}>
            <Text style={styles.serviceUuid}>{svc.uuid}</Text>
            <Text style={styles.charCount}>{svc.characteristics?.length || 0} characteristics</Text>
            {(svc.characteristics || []).slice(0, 5).map((ch, j) => (
              <View key={j} style={styles.charRow}>
                <Text style={styles.charUuid}>{ch.characteristic}</Text>
                <Text style={styles.charProps}>
                  {[
                    ch.properties?.Read ? 'R' : '',
                    ch.properties?.Write ? 'W' : '',
                    ch.properties?.Notify ? 'N' : '',
                    ch.properties?.Indicate ? 'I' : '',
                  ].filter(Boolean).join(' ') || '—'}
                </Text>
              </View>
            ))}
          </View>
        ))}

        {connected && services.length === 0 && !loading && (
          <Text style={styles.noServices}>No services discovered</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md,
    paddingTop: 8, paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: Colors.text },
  headerTitle: { flex: 1, fontSize: Fonts.sizes.lg, fontWeight: Fonts.bold, color: Colors.text, marginLeft: Spacing.md },
  content: { padding: Spacing.md, paddingBottom: 100 },
  card: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md,
  },
  deviceName: {
    fontSize: Fonts.sizes.xl, fontWeight: Fonts.bold,
    color: Colors.text, marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  label: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  value: { fontSize: Fonts.sizes.sm, color: Colors.text, fontWeight: Fonts.medium, fontFamily: 'monospace' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.sm },
  statusText: { fontSize: Fonts.sizes.sm, color: Colors.textSecondary },
  btnRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  connectBtn: {
    flex: 1, backgroundColor: Colors.primary, borderRadius: 12,
    padding: 12, alignItems: 'center',
  },
  connectBtnText: { color: Colors.white, fontWeight: Fonts.semibold, fontSize: Fonts.sizes.md },
  sectionTitle: {
    fontSize: Fonts.sizes.lg, fontWeight: Fonts.bold, color: Colors.text,
    marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  serviceCard: {},
  serviceUuid: {
    fontSize: Fonts.sizes.sm, color: Colors.primaryLight,
    fontFamily: 'monospace', marginBottom: 4,
  },
  charCount: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  charRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6, borderTopWidth: 1, borderTopColor: Colors.border,
    marginTop: Spacing.sm,
  },
  charUuid: { fontSize: Fonts.sizes.xs, color: Colors.textSecondary, fontFamily: 'monospace', flex: 1 },
  charProps: { fontSize: Fonts.sizes.xs, color: Colors.success, fontWeight: Fonts.bold },
  noServices: {
    textAlign: 'center', color: Colors.textMuted,
    fontSize: Fonts.sizes.md, padding: Spacing.xl,
  },
});
