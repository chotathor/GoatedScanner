import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, StatusBar, SafeAreaView, Platform, PermissionsAndroid } from 'react-native';
import BleManager from 'react-native-ble-manager';

export default function App() {
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
      doScan();
    });
    () => BleManager.stopScan();
  }, []);

  const doScan = () => {
    setScanning(true);
    BleManager.scan([], 5, true).catch(console.log);
  };

  useEffect(() => {
    let sub = BleManager.addListener('BleManagerDiscoverPeripheral', (device) => {
      setDevices(prev => {
        const idx = prev.findIndex(d => d.id === device.id);
        if (idx >= 0) {
          const u = [...prev]; u[idx] = { ...u[idx], rssi: device.rssi }; return u;
        }
        return [...prev, { ...device, id: device.id || Math.random().toString(36).slice(2) }];
      });
    });
    let end = BleManager.addListener('BleManagerStopScan', () => setScanning(false));
    return () => { sub.remove(); end.remove(); };
  }, []);

  const getDist = (rssi) => { const r = rssi || -100; if (r > -50) return '<1m'; if (r > -70) return '~10m'; if (r > -85) return '~20m'; return '50m+'; };
  const getClr = (rssi) => { const r = rssi || -100; if (r > -50) return '#00d684'; if (r > -70) return '#88aa00'; if (r > -85) return '#ff8800'; return '#ff3355'; };
  const sorted = [...devices].sort((a, b) => (b.rssi || -100) - (a.rssi || -100));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a10' }}>
      <StatusBar barStyle='light-content' />
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 8 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#f0f0f0', flex: 1 }}>Goated Scanner</Text>
        <View style={{ backgroundColor: '#00d684', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4 }}>
          <Text style={{ color: '#000', fontWeight: '700' }}>{devices.length}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={doScan} style={{ marginHorizontal: 20, backgroundColor: '#00d684', borderRadius: 10, padding: 12, alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: '#000', fontWeight: '700' }}>{scanning ? 'Scanning...' : 'Scan Devices'}</Text>
      </TouchableOpacity>
      <FlatList
        data={sorted}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0e0e18', borderRadius: 12, padding: 16, marginHorizontal: 16, marginVertical: 3 }}>
            <View style={{ width: 3, height: 32, borderRadius: 2, marginRight: 14, backgroundColor: getClr(item.rssi) }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: '#f0f0f0', fontWeight: '600' }}>{item.name || item.localName || 'Unknown'}</Text>
              <Text style={{ fontSize: 11, color: '#666688', marginTop: 3 }}>{getDist(item.rssi)} {item.rssi || '?'}dBm</Text>
            </View>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getClr(item.rssi) }} />
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={{ color: '#555', textAlign: 'center', padding: 40 }}>No devices. Tap Scan.</Text>}
      />
    </SafeAreaView>
  );
}
