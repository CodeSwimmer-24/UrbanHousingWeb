import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT, TEXT } from '../../theme/colors';

const STATS = [
  { key: 'views', label: 'Total Views', value: '847', delta: '+12%', deltaUp: true, icon: 'eye-outline', iconBg: '#EFF6FF', iconColor: ACCENT, accent: ACCENT },
  { key: 'enq', label: 'Enquiries', value: '23', delta: '+5', deltaUp: true, icon: 'chatbubbles-outline', iconBg: '#F5F3FF', iconColor: '#7C3AED', accent: '#7C3AED' },
];

export function StatGrid() {
  return (
    <View style={styles.grid}>
      {STATS.map((s) => (
        <View key={s.key} style={styles.card}>
          <View style={styles.cardTop}>
            <View style={[styles.iconWrap, { backgroundColor: s.iconBg }]}>
              <Ionicons name={s.icon} size={16} color={s.iconColor} />
            </View>
            <View style={[styles.delta, { backgroundColor: s.deltaUp ? '#F0FDF4' : '#FEF2F2' }]}>
              <Ionicons name={s.deltaUp ? 'trending-up' : 'trending-down'} size={10} color={s.deltaUp ? '#16A34A' : '#DC2626'} />
              <Text style={[styles.deltaText, { color: s.deltaUp ? '#16A34A' : '#DC2626' }]}>{s.delta}</Text>
            </View>
          </View>
          <Text style={[styles.value, { color: s.accent }]}>{s.value}</Text>
          <Text style={styles.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    marginHorizontal: 20, marginTop: 16, gap: 10,
  },
  card: {
    width: '47.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: 'rgba(15,23,42,0.07)',
    shadowColor: '#64748B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 20 },
  deltaText: { fontSize: 10, fontWeight: '700' },
  value: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, lineHeight: 28 },
  label: { fontSize: 11, fontWeight: '600', color: TEXT.tertiary, marginTop: 3 },
});
