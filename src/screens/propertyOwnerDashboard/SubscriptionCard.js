import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT_DARK, ACCENT_LIGHT } from '../../theme/colors';

export function SubscriptionCard({ planName, planExpiresAt }) {
  return (
    <View style={styles.wrap}>
      <LinearGradient colors={['#0F172A', '#1E3A8A', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.grad}>
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />

        <View style={styles.topRow}>
          <View style={styles.iconBox}>
            <Ionicons name="diamond" size={22} color={ACCENT_LIGHT} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.planBadge}>Active Plan</Text>
            <Text style={styles.planName}>{planName}</Text>
          </View>
          <TouchableOpacity style={styles.renewBtn} activeOpacity={0.85}>
            <Text style={styles.renewText}>Renew Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressMeta}>
            <Text style={styles.progressLabel}>Plan usage</Text>
            <Text style={styles.progressPct}>62% used</Text>
          </View>
          <View style={styles.track}>
            <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fill} />
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { icon: 'calendar-outline', label: '3 months', sub: 'Duration' },
            { icon: 'eye-outline', label: '847', sub: 'Total views' },
            { icon: 'time-outline', label: '55 days', sub: 'Remaining' },
          ].map((item) => (
            <View key={item.sub} style={styles.statCell}>
              <View style={styles.statIcon}>
                <Ionicons name={item.icon} size={14} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={styles.statVal}>{item.label}</Text>
              <Text style={styles.statSub}>{item.sub}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.expireLabel}>
          Expires on <Text style={styles.expireDate}>{planExpiresAt}</Text>
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20, marginTop: 14,
    borderRadius: 24, overflow: 'hidden',
    shadowColor: ACCENT_DARK, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  grad: { padding: 22, position: 'relative', overflow: 'hidden' },
  blob1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.06)', top: -50, right: -30 },
  blob2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)', bottom: 0, left: -30 },
  blob3: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.05)', top: 40, right: 80 },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 50, height: 50, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  planBadge: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.55)', letterSpacing: 0.8, textTransform: 'uppercase' },
  planName: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 2, letterSpacing: -0.3 },
  renewBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  renewText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  progressSection: { marginTop: 20 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  progressPct: { fontSize: 11, color: '#fff', fontWeight: '700' },
  track: { height: 7, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', width: '62%', borderRadius: 4 },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 20, paddingTop: 18,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statCell: { alignItems: 'center', flex: 1, gap: 4 },
  statIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  statVal: { fontSize: 14, fontWeight: '700', color: '#fff' },
  statSub: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  expireLabel: { marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'right' },
  expireDate: { color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
});
