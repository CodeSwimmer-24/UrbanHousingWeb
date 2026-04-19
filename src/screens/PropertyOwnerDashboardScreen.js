import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT, ACCENT_DARK, ACCENT_LIGHT, SURFACE, TEXT } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ─── Mock data ─────────────────────────────────────────────────────────────── */
const MOCK_VIEWERS = [
  { id: '1', name: 'Arjun Mehta', initials: 'AM', phone: '+91 98••••3210', viewedAt: 'Today, 10:24 AM', source: 'Search', interest: 'High', color: '#3B82F6' },
  { id: '2', name: 'Priya Sharma', initials: 'PS', phone: '+91 87••••8844', viewedAt: 'Yesterday', source: 'Category', interest: 'Medium', color: '#8B5CF6' },
  { id: '3', name: 'Vikram Singh', initials: 'VS', phone: '+91 76••••1192', viewedAt: '2 days ago', source: 'Bookmark', interest: 'High', color: '#EC4899' },
  { id: '4', name: 'Neha Kapoor', initials: 'NK', phone: '+91 99••••5566', viewedAt: '3 days ago', source: 'Search', interest: 'Low', color: '#F59E0B' },
];

const WEEKLY_BARS = [
  { day: 'Mon', count: 32 },
  { day: 'Tue', count: 57 },
  { day: 'Wed', count: 44 },
  { day: 'Thu', count: 90 },
  { day: 'Fri', count: 71 },
  { day: 'Sat', count: 103 },
  { day: 'Sun', count: 68 },
];
const WEEK_MAX = Math.max(...WEEKLY_BARS.map((b) => b.count));

/* ─── Interest badge ────────────────────────────────────────────────────────── */
function InterestBadge({ level }) {
  const cfg = {
    High: { bg: '#DCFCE7', color: '#15803D', dot: '#22C55E' },
    Medium: { bg: '#FEF9C3', color: '#92400E', dot: '#EAB308' },
    Low: { bg: '#F1F5F9', color: '#64748B', dot: '#94A3B8' },
  };
  const c = cfg[level] || cfg.Low;
  return (
    <View style={[ib.wrap, { backgroundColor: c.bg }]}>
      <View style={[ib.dot, { backgroundColor: c.dot }]} />
      <Text style={[ib.text, { color: c.color }]}>{level}</Text>
    </View>
  );
}
const ib = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 10, fontweight: '600', letterSpacing: 0.2 },
});

/* ─── Action buttons below the listing card ─────────────────────────────────── */
const ACTIONS = [
  { key: 'view', label: 'View', icon: 'eye-outline', bg: '#EFF6FF', icon_color: ACCENT, border: '#BFDBFE' },
  { key: 'edit', label: 'Edit', icon: 'create-outline', bg: '#F0FDF4', icon_color: '#16A34A', border: '#BBF7D0' },
  { key: 'add', label: 'Add More', icon: 'add-circle-outline', bg: '#FFF7ED', icon_color: '#EA580C', border: '#FED7AA' },
  { key: 'sold', label: 'Sold', icon: 'ribbon-outline', bg: '#FAF5FF', icon_color: '#7C3AED', border: '#DDD6FE' },
  { key: 'delete', label: 'Delete', icon: 'trash-outline', bg: '#FEF2F2', icon_color: '#DC2626', border: '#FECACA' },
];

function ActionGrid({ onAction }) {
  return (
    <View style={ag.row}>
      {ACTIONS.map((a) => (
        <TouchableOpacity
          key={a.key}
          style={ag.cell}
          onPress={() => onAction(a.key)}
          activeOpacity={0.78}
        >
          <View style={[ag.iconBox, { backgroundColor: a.bg, borderColor: a.border }]}>
            <Ionicons name={a.icon} size={21} color={a.icon_color} />
          </View>
          <Text style={ag.label}>{a.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const ag = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 18 },
  cell: { alignItems: 'center', flex: 1 },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, marginBottom: 6,
  },
  label: { fontSize: 10.5, fontweight: '600', color: TEXT.secondary, textAlign: 'center' },
});

/* ─── 2-stat row ────────────────────────────────────────────────────────────── */
const STATS = [
  { key: 'views', label: 'Total Views', value: '847', delta: '+12%', deltaUp: true, icon: 'eye-outline', iconBg: '#EFF6FF', iconColor: ACCENT, accent: ACCENT },
  { key: 'enq', label: 'Enquiries', value: '23', delta: '+5', deltaUp: true, icon: 'chatbubbles-outline', iconBg: '#F5F3FF', iconColor: '#7C3AED', accent: '#7C3AED' },
];

function StatGrid() {
  return (
    <View style={sg.row}>
      {STATS.map((s, idx) => (
        <View key={s.key} style={[sg.card, idx === 0 && sg.cardDivider]}>
          <View style={[sg.iconWrap, { backgroundColor: s.iconBg }]}>
            <Ionicons name={s.icon} size={15} color={s.iconColor} />
          </View>
          <View style={sg.textCol}>
            <Text style={[sg.value, { color: s.accent }]}>{s.value}</Text>
            <Text style={sg.label}>{s.label}</Text>
          </View>
          <View style={[sg.delta, { backgroundColor: s.deltaUp ? '#F0FDF4' : '#FEF2F2' }]}>
            <Text style={[sg.deltaText, { color: s.deltaUp ? '#16A34A' : '#DC2626' }]}>{s.delta}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
const sg = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: 20, marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.07)',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  card: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, gap: 10,
  },
  cardDivider: { borderRightWidth: 1, borderRightColor: 'rgba(15,23,42,0.07)' },
  iconWrap: {
    width: 32, height: 32, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  textCol: { flex: 1 },
  value: { fontSize: 18, fontweight: '600', letterSpacing: -0.4, lineHeight: 21 },
  label: { fontSize: 10.5, fontWeight: '600', color: TEXT.tertiary, marginTop: 1 },
  delta: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 6, paddingVertical: 3, borderRadius: 20,
  },
  deltaText: { fontSize: 10, fontweight: '600' },
});

/* ─── Weekly performance bar chart ──────────────────────────────────────────── */
function WeeklyChart() {
  return (
    <View style={wc.card}>
      <View style={wc.head}>
        <View>
          <Text style={wc.title}>Weekly Performance</Text>
          <Text style={wc.sub}>Views per day this week</Text>
        </View>
        <View style={wc.totalBadge}>
          <Text style={wc.totalVal}>465</Text>
          <Text style={wc.totalLabel}>total</Text>
        </View>
      </View>
      <View style={wc.barsRow}>
        {WEEKLY_BARS.map((b) => {
          const pct = (b.count / WEEK_MAX) * 100;
          const isToday = b.day === 'Sat';
          return (
            <View key={b.day} style={wc.barCol}>
              <Text style={wc.barCount}>{b.count}</Text>
              <View style={wc.barTrack}>
                <LinearGradient
                  colors={isToday ? [ACCENT_LIGHT, ACCENT] : ['#E2E8F0', '#CBD5E1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[wc.barFill, { height: `${pct}%` }]}
                />
              </View>
              <Text style={[wc.barDay, isToday && wc.barDayActive]}>{b.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
const wc = StyleSheet.create({
  card: {
    marginHorizontal: 20, marginTop: 20,
    backgroundColor: SURFACE, borderRadius: 20, padding: 18,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)',
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 15, fontweight: '600', color: TEXT.primary },
  sub: { fontSize: 12, color: TEXT.tertiary, marginTop: 2 },
  totalBadge: { alignItems: 'flex-end' },
  totalVal: { fontSize: 22, fontweight: '600', color: ACCENT, letterSpacing: -0.5 },
  totalLabel: { fontSize: 11, color: TEXT.tertiary, marginTop: 1 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 90 },
  barCol: { flex: 1, alignItems: 'center' },
  barCount: { fontSize: 9, fontWeight: '600', color: TEXT.tertiary, marginBottom: 4 },
  barTrack: {
    width: 26, height: 70, borderRadius: 8, backgroundColor: '#F1F5F9',
    justifyContent: 'flex-end', overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: 8 },
  barDay: { fontSize: 10, color: TEXT.tertiary, fontWeight: '600', marginTop: 6 },
  barDayActive: { color: ACCENT, fontweight: '600' },
});

/* ─── Subscription card ─────────────────────────────────────────────────────── */
function SubscriptionCard({ planName, planExpiresAt }) {
  return (
    <View style={sc.wrap}>
      <LinearGradient colors={['#1E3A8A', '#1D4ED8', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sc.grad}>
        {/* decorative blobs */}
        <View style={sc.blob1} />
        <View style={sc.blob2} />

        <View style={sc.row}>
          <View style={sc.iconBox}>
            <Ionicons name="diamond" size={20} color={ACCENT_LIGHT} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={sc.planName}>{planName}</Text>
            <Text style={sc.expireText}>
              Expires <Text style={sc.expireDate}>{planExpiresAt}</Text>
            </Text>
          </View>
          <TouchableOpacity style={sc.renewBtn} activeOpacity={0.85}>
            <Text style={sc.renewText}>Renew</Text>
          </TouchableOpacity>
        </View>

        <View style={sc.progressSection}>
          <View style={sc.progressMeta}>
            <Text style={sc.progressLabel}>Plan usage</Text>
            <Text style={sc.progressPct}>62%</Text>
          </View>
          <View style={sc.track}>
            <View style={sc.fill} />
            <View style={sc.fillGlow} />
          </View>
        </View>

        <View style={sc.statsRow}>
          {[
            { icon: 'calendar-outline', label: '3 months', sub: 'Duration' },
            { icon: 'eye-outline', label: '847', sub: 'Total views' },
            { icon: 'time-outline', label: '55 days', sub: 'Remaining' },
          ].map((item) => (
            <View key={item.label} style={sc.statCell}>
              <Ionicons name={item.icon} size={14} color="rgba(255,255,255,0.6)" />
              <Text style={sc.statVal}>{item.label}</Text>
              <Text style={sc.statSub}>{item.sub}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
}
const sc = StyleSheet.create({
  wrap: {
    marginHorizontal: 20, marginTop: 20,
    borderRadius: 22, overflow: 'hidden',
    shadowColor: ACCENT_DARK, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  grad: { padding: 20, position: 'relative', overflow: 'hidden' },
  blob1: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -30, right: -20,
  },
  blob2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: 10, left: -20,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  planName: { fontSize: 16, fontweight: '600', color: '#fff', letterSpacing: -0.3 },
  expireText: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  expireDate: { color: '#fff', fontweight: '600' },
  renewBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
  },
  renewText: { fontSize: 12, fontweight: '600', color: '#fff' },
  progressSection: { marginTop: 18 },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  progressPct: { fontSize: 11, color: '#fff', fontweight: '600' },
  track: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3, overflow: 'visible', position: 'relative',
  },
  fill: {
    position: 'absolute', left: 0, top: 0, height: '100%',
    width: '62%', borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  fillGlow: {
    position: 'absolute', left: 0, top: -2,
    height: 10, width: '62%', borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 18, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)',
  },
  statCell: { alignItems: 'center', flex: 1, gap: 3 },
  statVal: { fontSize: 13, fontweight: '600', color: '#fff' },
  statSub: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
});

/* ─── Viewer list ───────────────────────────────────────────────────────────── */
function ViewerList() {
  return (
    <View style={vl.wrap}>
      <View style={vl.head}>
        <View>
          <Text style={vl.title}>Recent Viewers</Text>
          <Text style={vl.sub}>People interested in your property</Text>
        </View>
        <TouchableOpacity style={vl.seeAllBtn} activeOpacity={0.8}>
          <Text style={vl.seeAll}>See all</Text>
          <Ionicons name="arrow-forward" size={13} color={ACCENT} />
        </TouchableOpacity>
      </View>

      {MOCK_VIEWERS.map((v, idx) => (
        <View key={v.id}>
          <View style={vl.row}>
            <View style={[vl.avatar, { backgroundColor: `${v.color}18` }]}>
              <Text style={[vl.initials, { color: v.color }]}>{v.initials}</Text>
            </View>
            <View style={vl.body}>
              <Text style={vl.name}>{v.name}</Text>
              <View style={vl.meta}>
                <Ionicons name="time-outline" size={11} color={TEXT.tertiary} />
                <Text style={vl.metaText}>{v.viewedAt}</Text>
                <View style={vl.metaDivider} />

              </View>
              <Text style={vl.phone}>{v.phone}</Text>
            </View>
            <View style={vl.actions}>
              <TouchableOpacity
                style={[vl.actionBtn, vl.callBtn]}
                activeOpacity={0.8}
                onPress={() => Alert.alert('Call', `Calling ${v.name}…`)}
              >
                <Ionicons name="call" size={15} color="#16A34A" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[vl.actionBtn, vl.waBtn]}
                activeOpacity={0.8}
                onPress={() => Alert.alert('WhatsApp', `Opening WhatsApp for ${v.name}…`)}
              >
                <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          {idx < MOCK_VIEWERS.length - 1 && <View style={vl.divider} />}
        </View>
      ))}
    </View>
  );
}
const vl = StyleSheet.create({
  wrap: {
    marginHorizontal: 20, marginTop: 20,
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
  title: { fontSize: 15, fontweight: '600', color: TEXT.primary },
  sub: { fontSize: 12, color: TEXT.tertiary, marginTop: 2 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  seeAll: { fontSize: 12.5, fontweight: '600', color: ACCENT },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 12 },
  divider: { height: 1, backgroundColor: '#F8FAFC', marginHorizontal: 18 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  initials: { fontSize: 15, fontweight: '600' },
  body: { flex: 1, gap: 5 },
  name: { fontSize: 14, fontweight: '600', color: TEXT.primary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 11, color: TEXT.tertiary, fontWeight: '500' },
  metaDivider: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#CBD5E1' },
  sourcePill: { backgroundColor: '#F1F5F9', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  sourceText: { fontSize: 10, fontWeight: '600', color: TEXT.secondary },
  phone: { fontSize: 12, color: TEXT.secondary, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  callBtn: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
  },
  waBtn: {
    backgroundColor: '#25D366',
  },
});

/* ─── Main export ───────────────────────────────────────────────────────────── */
export function PropertyOwnerDashboardScreen({
  listingTitle = '2 BHK Flat · Sector 15, Noida',
  listingTag = 'Rent · Furnished',
  planName = '3 Months — Featured',
  planExpiresAt = '18 Jul 2026',
  onViewPropertyDetails,
  onEditListing,
  onDeleteListing,
  onMarkSold,
  onAddMoreListing,
}) {
  const insets = useSafeAreaInsets();

  const handleAction = (key) => {
    switch (key) {
      case 'view':
        if (onViewPropertyDetails) { onViewPropertyDetails(); return; }
        Alert.alert('Property Details', `Previewing:\n\n${listingTitle}`);
        break;
      case 'edit':
        if (onEditListing) { onEditListing(); return; }
        Alert.alert('Edit Listing', 'The edit form will open here.');
        break;
      case 'delete':
        Alert.alert(
          'Delete listing?',
          'This permanently removes your property from Al-Bayt.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { if (onDeleteListing) onDeleteListing(); } },
          ],
        );
        break;
      case 'sold':
        Alert.alert(
          'Mark as Sold?',
          'Your listing will be closed and hidden from search results.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Mark Sold', onPress: () => { if (onMarkSold) onMarkSold(); } },
          ],
        );
        break;
      case 'add':
        if (onAddMoreListing) { onAddMoreListing(); return; }
        Alert.alert('Add Listing', 'Add another property to your profile.');
        break;
      default: break;
    }
  };

  return (
    <View style={styles.root}>
      {/* ── Page header ── */}
      <View style={[styles.pageHeader]}>
        <View style={styles.greetCol}>
          <Text style={styles.greetLabel}>My Dashboard</Text>
          <Text style={styles.greetSub}>Track your listing performance</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={22} color={TEXT.primary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Listing card ── */}
        <View style={styles.listingCard}>
          <LinearGradient
            colors={['#0F172A', '#1E293B', '#1E3A8A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.listingCardGrad}
          >
            {/* decorative rings */}
            <View style={styles.ring1} />
            <View style={styles.ring2} />

            <View style={styles.listingCardTop}>
              <View style={styles.liveDot}>
                <View style={styles.livePulse} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <View style={styles.listingTypePill}>
                <Text style={styles.listingTypeText}>{listingTag}</Text>
              </View>
            </View>
            <Text style={styles.listingCardTitle}>{listingTitle}</Text>
            <View style={styles.listingCardMeta}>
              <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.55)" />
              <Text style={styles.listingCardMetaText}>Sector 15, Noida · Floor 4 / 10</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── Action grid ── */}
        <ActionGrid onAction={handleAction} />

        {/* ── Stats ── */}
        <StatGrid />

        {/* ── Weekly chart ── */}


        {/* ── Subscription ── */}
        <SubscriptionCard planName={planName} planExpiresAt={planExpiresAt} />

        {/* ── Viewers ── */}
        <ViewerList />

        {/* ── Quick actions ── */}
        <View style={styles.quickSection}>
          <Text style={styles.quickTitle}>More actions</Text>
          <View style={styles.quickRow}>
            {[
              { label: 'Share listing', icon: 'share-social-outline', bg: '#EFF6FF', color: ACCENT },
              { label: 'Pause listing', icon: 'pause-circle-outline', bg: '#FFF7ED', color: '#EA580C' },
              { label: 'Download report', icon: 'download-outline', bg: '#F0FDF4', color: '#16A34A' },
            ].map((q) => (
              <TouchableOpacity key={q.label} style={[styles.quickCard, { backgroundColor: q.bg }]} activeOpacity={0.8}>
                <Ionicons name={q.icon} size={20} color={q.color} />
                <Text style={[styles.quickCardLabel, { color: q.color }]}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  /* header */
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  greetCol: {},
  greetLabel: { fontSize: 22, fontweight: '600', color: TEXT.primary, letterSpacing: -0.5 },
  greetSub: { fontSize: 13, color: TEXT.tertiary, marginTop: 2 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(15,23,42,0.08)',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  notifDot: {
    position: 'absolute', top: 9, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#fff',
  },

  /* listing card */
  listingCard: {
    marginHorizontal: 20,
    marginTop: 4,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  listingCardGrad: { padding: 22, position: 'relative', overflow: 'hidden', minHeight: 100 },
  ring1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    top: -60, right: -50,
  },
  ring2: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)',
    top: -20, right: -10,
  },
  listingCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  liveDot: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(34,197,94,0.2)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  livePulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  liveText: { fontSize: 10, fontweight: '600', color: '#22C55E', letterSpacing: 1 },
  listingTypePill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  listingTypeText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  listingCardIcon: {
    width: 60, height: 60, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  listingCardTitle: { fontSize: 19, fontweight: '600', color: '#fff', letterSpacing: -0.4, lineHeight: 25 },
  listingCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  listingCardMetaText: { fontSize: 12.5, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },

  /* quick section */
  quickSection: { paddingHorizontal: 20, marginTop: 20 },
  quickTitle: { fontSize: 15, fontweight: '600', color: TEXT.primary, marginBottom: 12 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  quickCardLabel: { fontSize: 11, fontweight: '600', textAlign: 'center', lineHeight: 14 },
});
