import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Platform, PermissionsAndroid, RefreshControl,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { Colors, Spacing, Fonts, Shadows } from '../theme';

export default function ScannerScreen({ navigation }) {
  const [devices, setDevices] = useState([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    BleManager.start({ showAlert: false }).then(() => {
      if (Platform.OS === 'android' && Platform.Version >= 31) {
        PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      }
      startScan();
    });
    return () => { BleManager.stopScan(); };
  }, []);

  useEffect(() => {
    const discover = BleManager.addListener('BleManagerDiscoverPeripheral', (device) => {
      setDevices(prev => {
        const idx = prev.findIndex(d => d.id === device.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], rssi: Math.round(device.rssi), advertising: device.advertising || updated[idx].advertising };
          return updated;
        }
        return [...prev, { ...device, rssi: Math.round(device.rssi), firstSeen: Date.now() }];
      });
    });
    const stop = BleManager.addListener('BleManagerStopScan', () => setScanning(false));
    return () => { discover.remove(); stop.remove(); };
  }, []);

  const startScan = useCallback(() => {
    setScanning(true);
    BleManager.scan([], 30, true)
      .then(() => console.log('Scan started'))
      .catch(err => { console.log(err); setScanning(false); });
  }, []);

  const getSignalColor = (rssi) => {
    const r = rssi || -100;
    if (r > -55) return Colors.success;
    if (r > -70) return Colors.accent;
    if (r > -85) return Colors.warning;
    return Colors.error;
  };

  const getDistance = (rssi) => {
    const r = rssi || -100;
    if (r > -50) return '< 1m';
    if (r > -70) return '~10m';
    if (r > -85) return '~20m';
    return '50m+';
  };

  const sorted = [...devices].sort((a, b) => (b.rssi || -100) - (a.rssi || -100));

  const renderDevice = ({ item }) => (
    <TouchableOpacity
      style={[styles.deviceCard, Shadows.sm]}
      activeOpacity={0.7}
      onPress={() => navigation.navigate('Detail', { device: item })}
    >
      <View style={[styles.signalBar, { backgroundColor: getSignalColor(item.rssi) }]} />
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName} numberOfLines={1}>
          {item.name || item.localName || 'Unknown Device'}
        </Text>
        <View style={styles.deviceMeta}>
          <Text style={styles.metaText}>{item.id?.slice(0, 17)}</Text>
          <Text style={styles.metaDot}> · </Text>
          <Text style={[styles.metaText, { color: getSignalColor(item.rssi) }]}>
            {item.rssi || '?'} dBm
          </Text>
          <Text style={styles.metaDot}> · </Text>
          <Text style={styles.metaText}>{getDistance(item.rssi)}</Text>
        </View>
      </View>
      <View style={styles.signalDots}>
        {[0, 1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: (item.rssi || -100) > (-55 - i * 12) ? getSignalColor(item.rssi) : Colors.surfaceLight },
            ]}
          />
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BLE Scanner</Text>
        <View style={styles.deviceCount}>
          <Text style={styles.countText}>{devices.length}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.scanBtn, scanning && styles.scanBtnActive]}
        activeOpacity={0.85}
        onPress={startScan}
        disabled={scanning}
      >
        {scanning ? (
          <View style={styles.scanningRow}>
            <ActivityIndicator color={Colors.white} size="small" />
            <Text style={styles.scanBtnText}> Scanning...</Text>
          </View>
        ) : (
          <Text style={styles.scanBtnText}>🔍 Scan for Devices</Text>
        )}
      </TouchableOpacity>

      <FlatList
        data={sorted}
        renderItem={renderDevice}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={scanning} onRefresh={startScan} tintColor={Colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyTitle}>No Devices Found</Text>
            <Text style={styles.emptySub}>
              {devices.length === 0 ? 'Tap the scan button to start discovering BLE devices' : 'Adjust range or try again'}
            </Text>
          </View>
        }
      />
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
  headerTitle: {
    flex: 1, fontSize: Fonts.sizes.lg, fontWeight: Fonts.bold,
    color: Colors.text, marginLeft: Spacing.md,
  },
  deviceCount: {
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  countText: { color: Colors.white, fontWeight: Fonts.bold, fontSize: Fonts.sizes.sm },
  scanBtn: {
    marginHorizontal: Spacing.md, backgroundColor: Colors.primary,
    borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  scanBtnActive: { backgroundColor: Colors.primaryDark, opacity: 0.8 },
  scanBtnText: { color: Colors.white, fontSize: Fonts.sizes.md, fontWeight: Fonts.semibold },
  scanningRow: { flexDirection: 'row', alignItems: 'center' },
  list: { paddingHorizontal: Spacing.md, paddingBottom: 100 },
  deviceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: 14, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  signalBar: { width: 4, height: 36, borderRadius: 2, marginRight: 14 },
  deviceInfo: { flex: 1 },
  deviceName: {
    fontSize: Fonts.sizes.md, fontWeight: Fonts.semibold,
    color: Colors.text, marginBottom: 4,
  },
  deviceMeta: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  metaDot: { fontSize: Fonts.sizes.xs, color: Colors.textMuted },
  signalDots: { flexDirection: 'row', gap: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyTitle: {
    fontSize: Fonts.sizes.lg, fontWeight: Fonts.bold,
    color: Colors.text, marginBottom: Spacing.sm,
  },
  emptySub: {
    fontSize: Fonts.sizes.sm, color: Colors.textMuted,
    textAlign: 'center', paddingHorizontal: Spacing.xl,
  },
});
