import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar,
} from 'react-native';
import { Colors, Spacing, Fonts, Shadows } from '../theme';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>BS</Text>
          </View>
          <Text style={styles.title}>GoatedScanner</Text>
          <Text style={styles.subtitle}>
            Discover Bluetooth devices around you.{'\n'}
            Find, analyze, and connect to nearby BLE peripherals.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Scanner')}
        >
          <Text style={styles.scanIconText}>📡</Text>
          <View style={styles.scanBtnContent}>
            <Text style={styles.scanBtnTitle}>Start Scanning</Text>
            <Text style={styles.scanBtnSub}>Search for BLE devices nearby</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.features}>
          <FeatureCard icon="🔍" title="Real-time Scan" desc="Live device discovery with signal strength" />
          <FeatureCard icon="📊" title="Rich Details" desc="MAC, RSSI, services, manufacturer data" />
          <FeatureCard icon="⚡" title="Fast & Light" desc="Optimized for performance and battery life" />
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <View style={[styles.featureCard, Shadows.sm]}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  hero: { alignItems: 'center', paddingVertical: Spacing.xl },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg, ...Shadows.md,
  },
  iconText: { fontSize: Fonts.sizes.xxl, fontWeight: Fonts.extrabold, color: Colors.white },
  title: {
    fontSize: Fonts.sizes.xxl, fontWeight: Fonts.extrabold,
    color: Colors.text, marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Fonts.sizes.md, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  scanButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary,
    borderRadius: 16, padding: Spacing.md, marginVertical: Spacing.lg,
    ...Shadows.md,
  },
  scanIconText: { fontSize: 32, marginRight: Spacing.md },
  scanBtnContent: { flex: 1 },
  scanBtnTitle: { fontSize: Fonts.sizes.lg, fontWeight: Fonts.bold, color: Colors.white },
  scanBtnSub: { fontSize: Fonts.sizes.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  featureCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface,
    borderRadius: 14, padding: Spacing.md, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  featureIcon: { fontSize: 28, marginBottom: Spacing.sm },
  featureTitle: {
    fontSize: Fonts.sizes.md, fontWeight: Fonts.semibold,
    color: Colors.text, marginBottom: 4, textAlign: 'center',
  },
  featureDesc: {
    fontSize: Fonts.sizes.xs, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 16,
  },
});
