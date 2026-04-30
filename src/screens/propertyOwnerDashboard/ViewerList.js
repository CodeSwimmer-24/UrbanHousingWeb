import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT, SURFACE, TEXT } from '../../theme/colors';
import { InterestBadge } from './InterestBadge';
import { MOCK_VIEWERS } from './constants';

export function ViewerList() {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Recent Viewers</Text>
          <Text style={styles.sub}>People interested in your property</Text>
        </View>
        <TouchableOpacity style={styles.seeAllBtn} activeOpacity={0.8}>
          <Text style={styles.seeAll}>See all</Text>
          <Ionicons name="arrow-forward" size={13} color={ACCENT} />
        </TouchableOpacity>
      </View>

      {MOCK_VIEWERS.map((v, idx) => (
        <View key={v.id}>
          <View style={styles.row}>
            <View style={[styles.avatarWrap, { borderColor: `${v.color}30` }]}>
              <View style={[styles.avatar, { backgroundColor: `${v.color}18` }]}>
                <Text style={[styles.initials, { color: v.color }]}>{v.initials}</Text>
              </View>
            </View>
            <View style={styles.body}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{v.name}</Text>
                <InterestBadge level={v.interest} />
              </View>
              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="time-outline" size={10} color={TEXT.tertiary} />
                  <Text style={styles.metaText}>{v.viewedAt}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Ionicons name="search-outline" size={10} color={TEXT.tertiary} />
                  <Text style={styles.metaText}>{v.source}</Text>
                </View>
              </View>
              <Text style={styles.phone}>{v.phone}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.callBtn]}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Call', `Calling ${v.name}…`)}
              >
                <Ionicons name="call" size={15} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.waBtn]}
                activeOpacity={0.8}
                onPress={() => Alert.alert('WhatsApp', `Opening WhatsApp for ${v.name}…`)}
              >
                <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          {idx < MOCK_VIEWERS.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20, marginTop: 0,
    backgroundColor: SURFACE, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: 18, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  title: { fontSize: 15, fontWeight: '700', color: TEXT.primary },
  sub: { fontSize: 12, color: TEXT.tertiary, marginTop: 2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  seeAll: { fontSize: 12.5, fontWeight: '600', color: ACCENT },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  divider: { height: 1, backgroundColor: '#F8FAFC', marginHorizontal: 16 },
  avatarWrap: { borderWidth: 2, borderRadius: 26, padding: 1 },
  avatar: { width: 42, height: 42, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontWeight: '700' },
  body: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 14, fontWeight: '700', color: TEXT.primary },
  metaRow: { flexDirection: 'row', gap: 6 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  metaText: { fontSize: 10, color: TEXT.secondary, fontWeight: '500' },
  phone: { fontSize: 12, color: TEXT.secondary, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  callBtn: { backgroundColor: '#F0FDF4', borderWidth: 1.5, borderColor: '#BBF7D0' },
  waBtn: { backgroundColor: '#25D366' },
});
