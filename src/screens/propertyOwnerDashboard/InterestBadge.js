import { StyleSheet, Text, View } from 'react-native';

export function InterestBadge({ level }) {
  const cfg = {
    High: { bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' },
    Medium: { bg: '#FEF9C3', color: '#92400E', dot: '#EAB308' },
    Low: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
  };
  const c = cfg[level] || cfg.Low;
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.color }]}>{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
});
