import { useRef, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
const SCREEN_W = Dimensions.get('window').width;
const TAB_KEYS = ['dashboard', 'recent_views', 'property_list'];

const DASHBOARD_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { key: 'recent_views', label: 'Recent Views', icon: 'people-outline' },
  { key: 'property_list', label: 'Properties', icon: 'business-outline' },
];

const MOCK_PROPERTIES = [
  { id: 'p1', title: '2 BHK Flat', subtitle: 'Sector 15, Noida · Floor 4/10', type: 'Rent', price: 'AED 1,200/mo', status: 'Live', icon: 'home-outline', iconBg: '#EFF6FF', iconColor: ACCENT },
  { id: 'p2', title: '1 BHK Apartment', subtitle: 'Downtown · Floor 8/20', type: 'Sale', price: 'AED 480,000', status: 'Live', icon: 'business-outline', iconBg: '#F0FDF4', iconColor: '#16A34A' },
  { id: 'p3', title: 'Studio Apartment', subtitle: 'Marina View · Floor 12/30', type: 'Rent', price: 'AED 2,100/mo', status: 'Sold', icon: 'bed-outline', iconBg: '#FAF5FF', iconColor: '#7C3AED' },
];

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
  text: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 },
});

/* ─── 4-stat grid ───────────────────────────────────────────────────────────── */
const STATS = [
  { key: 'views', label: 'Total Views', value: '847', delta: '+12%', deltaUp: true, icon: 'eye-outline', iconBg: '#EFF6FF', iconColor: ACCENT, accent: ACCENT },
  { key: 'enq', label: 'Enquiries', value: '23', delta: '+5', deltaUp: true, icon: 'chatbubbles-outline', iconBg: '#F5F3FF', iconColor: '#7C3AED', accent: '#7C3AED' },

];

function StatGrid() {
  return (
    <View style={sg.grid}>
      {STATS.map((s) => (
        <View key={s.key} style={sg.card}>
          <View style={sg.cardTop}>
            <View style={[sg.iconWrap, { backgroundColor: s.iconBg }]}>
              <Ionicons name={s.icon} size={16} color={s.iconColor} />
            </View>
            <View style={[sg.delta, { backgroundColor: s.deltaUp ? '#F0FDF4' : '#FEF2F2' }]}>
              <Ionicons name={s.deltaUp ? 'trending-up' : 'trending-down'} size={10} color={s.deltaUp ? '#16A34A' : '#DC2626'} />
              <Text style={[sg.deltaText, { color: s.deltaUp ? '#16A34A' : '#DC2626' }]}>{s.delta}</Text>
            </View>
          </View>
          <Text style={[sg.value, { color: s.accent }]}>{s.value}</Text>
          <Text style={sg.label}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}
const sg = StyleSheet.create({
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

/* ─── Weekly performance bar chart ──────────────────────────────────────────── */

const wc = StyleSheet.create({
  card: {
    marginHorizontal: 20, marginTop: 14,
    backgroundColor: SURFACE, borderRadius: 20, padding: 18,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: 'rgba(15,23,42,0.06)',
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  title: { fontSize: 15, fontWeight: '700', color: TEXT.primary },
  sub: { fontSize: 12, color: TEXT.tertiary, marginTop: 2 },
  totalBadge: { alignItems: 'flex-end' },
  totalVal: { fontSize: 22, fontWeight: '700', color: ACCENT, letterSpacing: -0.5 },
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
  barDayActive: { color: ACCENT, fontWeight: '700' },
});

/* ─── Subscription card ─────────────────────────────────────────────────────── */
function SubscriptionCard({ planName, planExpiresAt }) {
  return (
    <View style={sc.wrap}>
      <LinearGradient colors={['#0F172A', '#1E3A8A', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={sc.grad}>
        <View style={sc.blob1} />
        <View style={sc.blob2} />
        <View style={sc.blob3} />

        <View style={sc.topRow}>
          <View style={sc.iconBox}>
            <Ionicons name="diamond" size={22} color={ACCENT_LIGHT} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={sc.planBadge}>Active Plan</Text>
            <Text style={sc.planName}>{planName}</Text>
          </View>
          <TouchableOpacity style={sc.renewBtn} activeOpacity={0.85}>
            <Text style={sc.renewText}>Renew Now</Text>
          </TouchableOpacity>
        </View>

        <View style={sc.progressSection}>
          <View style={sc.progressMeta}>
            <Text style={sc.progressLabel}>Plan usage</Text>
            <Text style={sc.progressPct}>62% used</Text>
          </View>
          <View style={sc.track}>
            <LinearGradient colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={sc.fill} />
          </View>
        </View>

        <View style={sc.statsRow}>
          {[
            { icon: 'calendar-outline', label: '3 months', sub: 'Duration' },
            { icon: 'eye-outline', label: '847', sub: 'Total views' },
            { icon: 'time-outline', label: '55 days', sub: 'Remaining' },
          ].map((item) => (
            <View key={item.sub} style={sc.statCell}>
              <View style={sc.statIcon}>
                <Ionicons name={item.icon} size={14} color="rgba(255,255,255,0.7)" />
              </View>
              <Text style={sc.statVal}>{item.label}</Text>
              <Text style={sc.statSub}>{item.sub}</Text>
            </View>
          ))}
        </View>

        <Text style={sc.expireLabel}>
          Expires on <Text style={sc.expireDate}>{planExpiresAt}</Text>
        </Text>
      </LinearGradient>
    </View>
  );
}
const sc = StyleSheet.create({
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
            <View style={[vl.avatarWrap, { borderColor: `${v.color}30` }]}>
              <View style={[vl.avatar, { backgroundColor: `${v.color}18` }]}>
                <Text style={[vl.initials, { color: v.color }]}>{v.initials}</Text>
              </View>
            </View>
            <View style={vl.body}>
              <View style={vl.nameRow}>
                <Text style={vl.name}>{v.name}</Text>
                <InterestBadge level={v.interest} />
              </View>
              <View style={vl.metaRow}>
                <View style={vl.metaPill}>
                  <Ionicons name="time-outline" size={10} color={TEXT.tertiary} />
                  <Text style={vl.metaText}>{v.viewedAt}</Text>
                </View>
                <View style={vl.metaPill}>
                  <Ionicons name="search-outline" size={10} color={TEXT.tertiary} />
                  <Text style={vl.metaText}>{v.source}</Text>
                </View>
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const pagerRef = useRef(null);

  const goToTab = (key) => {
    const idx = TAB_KEYS.indexOf(key);
    if (idx === -1) return;
    setActiveTab(key);
    pagerRef.current?.scrollTo({ x: idx * SCREEN_W, animated: true });
  };

  const handlePageChange = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (TAB_KEYS[idx]) setActiveTab(TAB_KEYS[idx]);
  };

  const handleAction = (key, propTitle) => {
    switch (key) {
      case 'view':
        if (onViewPropertyDetails) { onViewPropertyDetails(); return; }
        Alert.alert('Property Details', `Previewing:\n\n${propTitle || listingTitle}`);
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

  /* ── Dashboard tab ────────────────────────────────────────────────────────── */
  const renderDashboardTab = () => (
    <>
      {/* Hero listing card */}
      <View style={styles.listingCard}>
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#1E3A8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.listingCardGrad}
        >
          <View style={styles.ring1} />
          <View style={styles.ring2} />
          <View style={styles.ring3} />

          <View style={styles.listingCardTop}>
            <View style={styles.liveDot}>
              <View style={styles.livePulse} />
              <Text style={styles.liveText}>● LIVE</Text>
            </View>
            <View style={styles.listingTypePill}>
              <Ionicons name="pricetag-outline" size={10} color="rgba(255,255,255,0.85)" />
              <Text style={styles.listingTypeText}>{listingTag}</Text>
            </View>
          </View>


          <Text style={styles.listingCardTitle}>Hello, Fahad Mahmood</Text>
          <View style={styles.listingCardMeta}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.55)" />
            <Text style={styles.listingCardMetaText}>You can find all the properties information here</Text>
          </View>

          <View style={styles.listingStatsRow}>
            {[
              { icon: 'eye-outline', val: '847', label: 'Views' },
              { icon: 'chatbubbles-outline', val: '23', label: 'Enquiries' },
              { icon: 'bookmark-outline', val: '3', label: 'Total Properties' },
            ].map((s) => (
              <View key={s.label} style={styles.listingStatCell}>
                <Ionicons name={s.icon} size={13} color="rgba(255,255,255,0.6)" />
                <Text style={styles.listingStatVal}>{s.val}</Text>
                <Text style={styles.listingStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      {/* 4-stat grid */}
      <StatGrid />

      {/* Weekly chart */}
      {/* <WeeklyChart /> */}

      {/* Subscription */}
      <SubscriptionCard planName={planName} planExpiresAt={planExpiresAt} />

      {/* Quick actions */}
      <View style={styles.quickSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {[
            { label: 'Share listing', icon: 'share-social-outline', bg: '#EFF6FF', color: ACCENT, border: '#BFDBFE' },
            { label: 'Pause listing', icon: 'pause-circle-outline', bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
            { label: 'Download report', icon: 'download-outline', bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
          ].map((q) => (
            <TouchableOpacity key={q.label} style={[styles.quickCard, { backgroundColor: q.bg, borderColor: q.border }]} activeOpacity={0.8}>
              <View style={[styles.quickIconWrap, { backgroundColor: q.color + '18' }]}>
                <Ionicons name={q.icon} size={20} color={q.color} />
              </View>
              <Text style={[styles.quickCardLabel, { color: q.color }]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  /* ── Recent Views tab ─────────────────────────────────────────────────────── */
  const renderRecentViewsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabContentHead}>
        <View style={[styles.tabContentIcon, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="people-outline" size={18} color={ACCENT} />
        </View>
        <View>
          <Text style={styles.tabContentTitle}>Recent Views</Text>
          <Text style={styles.tabContentSub}>People who viewed your listings</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        {[
          { label: 'Total', value: '4', color: ACCENT, bg: '#EFF6FF' },
          { label: 'High Interest', value: '2', color: '#15803D', bg: '#DCFCE7' },
          { label: 'This Week', value: '3', color: '#7C3AED', bg: '#F5F3FF' },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, { color: s.color + 'BB' }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <ViewerList />
    </View>
  );

  /* ── Property List tab ────────────────────────────────────────────────────── */
  const renderPropertyListTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabContentHead}>
        <View style={[styles.tabContentIcon, { backgroundColor: '#F0FDF4' }]}>
          <Ionicons name="business-outline" size={18} color="#16A34A" />
        </View>
        <View>
          <Text style={styles.tabContentTitle}>My Properties</Text>
          <Text style={styles.tabContentSub}>{MOCK_PROPERTIES.length} listings added</Text>
        </View>
        <TouchableOpacity style={styles.addPropertyBtn} activeOpacity={0.85} onPress={() => handleAction('add')}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addPropertyText}>Add</Text>
        </TouchableOpacity>
      </View>

      {MOCK_PROPERTIES.map((property) => (
        <View key={property.id} style={styles.propertyCard}>
          <View style={styles.propertyCardInner}>
            {/* Left color icon block */}
            <View style={[styles.propertyIconBlock, { backgroundColor: property.iconBg }]}>
              <Ionicons name={property.icon} size={22} color={property.iconColor} />
            </View>

            {/* Content */}
            <View style={styles.propertyBody}>
              <View style={styles.propertyTitleRow}>
                <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
                <View style={[
                  styles.statusPill,
                  property.status === 'Sold' ? styles.statusSold : styles.statusLive,
                ]}>
                  <View style={[styles.statusDot, { backgroundColor: property.status === 'Sold' ? '#7C3AED' : '#22C55E' }]} />
                  <Text style={[styles.statusText, { color: property.status === 'Sold' ? '#7C3AED' : '#15803D' }]}>
                    {property.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.propertySubtitle} numberOfLines={1}>{property.subtitle}</Text>
              <View style={styles.propertyPriceRow}>
                <View style={styles.typePill}>
                  <Text style={styles.typeText}>{property.type}</Text>
                </View>
                <Text style={styles.propertyPrice}>{property.price}</Text>
              </View>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.propertyDivider} />
          <View style={styles.propertyActionsRow}>
            <TouchableOpacity
              style={[styles.propertyActionBtn, styles.editAction]}
              activeOpacity={0.85}
              onPress={() => handleAction('edit', property.title)}
            >
              <Ionicons name="create-outline" size={14} color="#16A34A" />
              <Text style={[styles.propertyActionText, { color: '#16A34A' }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.propertyActionBtn, styles.soldAction]}
              activeOpacity={0.85}
              onPress={() => handleAction('sold', property.title)}
            >
              <Ionicons name="ribbon-outline" size={14} color="#7C3AED" />
              <Text style={[styles.propertyActionText, { color: '#7C3AED' }]}>Mark Sold</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.propertyActionBtn, styles.deleteAction]}
              activeOpacity={0.85}
              onPress={() => handleAction('delete', property.title)}
            >
              <Ionicons name="trash-outline" size={14} color="#DC2626" />
              <Text style={[styles.propertyActionText, { color: '#DC2626' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  /* ── Root render ──────────────────────────────────────────────────────────── */
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* ── Page header ── */}
      <View style={styles.pageHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={ACCENT} />
          </View>
          <View>
            <Text style={styles.greetLabel}>My Dashboard</Text>
            <Text style={styles.greetSub}>Track your listing performance</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={20} color={TEXT.primary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* ── Tab bar (fixed, outside pager) ── */}
      <View style={styles.tabsWrap}>
        {DASHBOARD_TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabBtn}
              activeOpacity={0.75}
              onPress={() => goToTab(tab.key)}
            >
              <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                <Ionicons
                  name={isActive ? tab.icon.replace('-outline', '') : tab.icon}
                  size={20}
                  color={isActive ? ACCENT : TEXT.tertiary}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Horizontal pager ── */}
      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handlePageChange}
        style={{ flex: 1 }}
      >
        {/* Page 0 – Dashboard */}
        <ScrollView
          style={{ width: SCREEN_W }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderDashboardTab()}
        </ScrollView>

        {/* Page 1 – Recent Views */}
        <ScrollView
          style={{ width: SCREEN_W }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderRecentViewsTab()}
        </ScrollView>

        {/* Page 2 – Property List */}
        <ScrollView
          style={{ width: SCREEN_W }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderPropertyListTab()}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8FAFC' },

  /* ── Header ── */
  pageHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: 'rgba(15,23,42,0.06)',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: ACCENT + '30',
  },
  greetLabel: { fontSize: 17, fontWeight: '700', color: TEXT.primary, letterSpacing: -0.3 },
  greetSub: { fontSize: 12, color: TEXT.tertiary, marginTop: 1 },
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

  /* ── Tabs ── */
  tabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15,23,42,0.07)',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 0,
    gap: 4,
    position: 'relative',
  },
  tabIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  tabIconWrapActive: {
    backgroundColor: ACCENT + '12',
  },
  tabLabel: {
    fontSize: 11, fontWeight: '600',
    color: TEXT.tertiary,
    marginBottom: 10,
  },
  tabLabelActive: {
    color: ACCENT,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 3,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },

  /* ── Listing hero card ── */
  listingCard: {
    marginHorizontal: 20, marginTop: 16,
    borderRadius: 24, overflow: 'hidden',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 10,
  },
  listingCardGrad: { padding: 22, position: 'relative', overflow: 'hidden' },
  ring1: { position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', top: -80, right: -60 },
  ring2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', top: -20, right: -10 },
  ring3: { position: 'absolute', width: 90, height: 90, borderRadius: 45, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', bottom: 20, left: -20 },
  listingCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  liveDot: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.18)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.3)',
  },
  liveText: { fontSize: 10, fontWeight: '700', color: '#22C55E', letterSpacing: 0.5 },
  listingTypePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  listingTypeText: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  listingIconWrap: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  listingCardTitle: { fontSize: 20, fontWeight: '700', color: '#fff', letterSpacing: -0.5, lineHeight: 26 },
  listingCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  listingCardMetaText: { fontSize: 12.5, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  listingStatsRow: {
    flexDirection: 'row', marginTop: 18, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  listingStatCell: { flex: 1, alignItems: 'center', gap: 3 },
  listingStatVal: { fontSize: 16, fontWeight: '700', color: '#fff' },
  listingStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  /* ── Section label ── */
  sectionTitle: { fontSize: 15, fontWeight: '700', color: TEXT.primary, marginBottom: 12 },

  /* ── Quick actions ── */
  quickSection: { paddingHorizontal: 20, marginTop: 20 },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 8,
    borderWidth: 1,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  quickIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  quickCardLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14 },

  /* ── Tab content header ── */
  tabContent: { paddingTop: 4 },
  tabContentHead: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginTop: 16, marginBottom: 14,
  },
  tabContentIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabContentTitle: { fontSize: 16, fontWeight: '700', color: TEXT.primary },
  tabContentSub: { fontSize: 12, color: TEXT.tertiary, marginTop: 1 },

  /* ── Summary mini-cards ── */
  summaryRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 14, gap: 10 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 2 },
  summaryVal: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  summaryLabel: { fontSize: 10.5, fontWeight: '600', textAlign: 'center' },

  /* ── Add property button ── */
  addPropertyBtn: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: ACCENT, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12,
  },
  addPropertyText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  /* ── Property cards ── */
  propertyCard: {
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(15,23,42,0.07)',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },
  propertyCardInner: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  propertyIconBlock: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  propertyBody: { flex: 1, gap: 4 },
  propertyTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  propertyTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: TEXT.primary },
  propertySubtitle: { fontSize: 12, color: TEXT.secondary },
  propertyPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  typePill: { backgroundColor: '#EFF6FF', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typeText: { fontSize: 10, fontWeight: '700', color: ACCENT },
  propertyPrice: { fontSize: 13, fontWeight: '700', color: TEXT.primary },

  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusLive: { backgroundColor: '#DCFCE7' },
  statusSold: { backgroundColor: '#EDE9FE' },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },

  propertyDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 14 },
  propertyActionsRow: { flexDirection: 'row', gap: 0 },
  propertyActionBtn: {
    flex: 1, paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    borderRightWidth: 1, borderRightColor: '#F1F5F9',
  },
  propertyActionText: { fontSize: 12, fontWeight: '700' },
  editAction: { /* no extra */ },
  soldAction: { /* no extra */ },
  deleteAction: { borderRightWidth: 0 },
});
