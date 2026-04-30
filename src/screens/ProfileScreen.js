import { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ACCENT,
  ACCENT_DARK,
  ACCENT_LIGHT,
  BG,
  BORDER_SUBTLE,
  TEXT,
} from '../theme/colors';

/* ─── Mock user data ──────────────────────────────────────────────────────────── */
const USER = {
  name: 'Rahul Sharma',
  role: 'Property Owner',
  phone: '+91 98765 43210',
  email: 'rahul.sharma@email.com',
  location: 'Mumbai, Maharashtra',
  memberSince: 'Jan 2024',
  initials: 'RS',
  verified: true,
  stats: {
    listings: 3,
    totalViews: 1240,
    saved: 18,
  },
};

const GRADIENT_HERO = ['#1E3A8A', '#1D4ED8', '#2563EB', '#3B82F6'];
const SUCCESS = '#16A34A';
const WARN = '#D97706';
const DANGER = '#DC2626';

/* ─── Menu data ───────────────────────────────────────────────────────────────── */
const ACCOUNT_ITEMS = [
  { key: 'edit', label: 'Edit Profile', icon: 'person-outline', iconBg: '#EFF6FF', iconColor: ACCENT },
  { key: 'listings', label: 'My Listings', icon: 'home-outline', iconBg: '#F0FDF4', iconColor: SUCCESS, badge: USER.stats.listings },
  { key: 'saved', label: 'Saved Properties', icon: 'heart-outline', iconBg: '#FFF1F2', iconColor: '#E11D48', badge: USER.stats.saved },
  { key: 'enquiries', label: 'My Enquiries', icon: 'chatbubble-ellipses-outline', iconBg: '#FFFBEB', iconColor: WARN },
  { key: 'payments', label: 'Payment History', icon: 'card-outline', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
];

const TOOLS_ITEMS = [
  { key: 'notifications', label: 'Notifications', icon: 'notifications-outline', iconBg: '#EFF6FF', iconColor: ACCENT, toggle: true },
  { key: 'language', label: 'Language', icon: 'language-outline', iconBg: '#F0FDF4', iconColor: SUCCESS, value: 'English' },
  { key: 'currency', label: 'Currency', icon: 'cash-outline', iconBg: '#FFFBEB', iconColor: WARN, value: 'AED' },
];

const SUPPORT_ITEMS = [
  { key: 'help', label: 'Help & Support', icon: 'help-circle-outline', iconBg: '#EFF6FF', iconColor: ACCENT },
  { key: 'rate', label: 'Rate Al-Bayt', icon: 'star-outline', iconBg: '#FFFBEB', iconColor: WARN },
  { key: 'share', label: 'Share App', icon: 'share-social-outline', iconBg: '#F0FDF4', iconColor: SUCCESS },
  { key: 'privacy', label: 'Privacy Policy', icon: 'shield-outline', iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  { key: 'terms', label: 'Terms of Service', icon: 'document-text-outline', iconBg: '#FFF1F2', iconColor: '#E11D48' },
];

/* ─── Sub-components ─────────────────────────────────────────────────────────── */
function StatPill({ value, label, accent }) {
  return (
    <View style={stat.pill}>
      <Text style={[stat.value, accent && { color: accent }]}>{value}</Text>
      <Text style={stat.label}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, children }) {
  return (
    <View style={card.wrap}>
      {title ? <Text style={card.title}>{title}</Text> : null}
      <View style={card.box}>{children}</View>
    </View>
  );
}

function MenuItem({ item, onPress, isFirst, isLast, toggleValue, onToggleChange }) {
  return (
    <TouchableOpacity
      style={[menu.row, !isFirst && menu.rowBorder]}
      onPress={item.toggle ? undefined : () => onPress(item.key)}
      activeOpacity={0.72}
    >
      <View style={[menu.iconWrap, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={18} color={item.iconColor} />
      </View>
      <Text style={menu.label}>{item.label}</Text>
      <View style={menu.right}>
        {item.badge != null && (
          <View style={menu.badge}>
            <Text style={menu.badgeText}>{item.badge}</Text>
          </View>
        )}
        {item.value && (
          <Text style={menu.valueText}>{item.value}</Text>
        )}
        {item.toggle ? (
          <Switch
            value={toggleValue}
            onValueChange={onToggleChange}
            trackColor={{ false: '#CBD5E1', true: ACCENT_LIGHT }}
            thumbColor={toggleValue ? ACCENT : '#F1F5F9'}
            ios_backgroundColor="#CBD5E1"
          />
        ) : (
          <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ─── Main screen ────────────────────────────────────────────────────────────── */
export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [notificationsOn, setNotificationsOn] = useState(true);

  const handleAction = (key) => {
    switch (key) {
      case 'edit':
        Alert.alert('Edit Profile', 'Profile editing coming soon.');
        break;
      case 'listings':
        Alert.alert('My Listings', 'Opens your active property listings.');
        break;
      case 'saved':
        Alert.alert('Saved Properties', 'Your bookmarked properties will appear here.');
        break;
      case 'enquiries':
        Alert.alert('My Enquiries', 'Your sent enquiries will appear here.');
        break;
      case 'payments':
        Alert.alert('Payment History', 'Your subscription and transaction history.');
        break;
      case 'language':
        Alert.alert('Language', 'Language selection coming soon.');
        break;
      case 'currency':
        Alert.alert('Currency', 'Currency preference coming soon.');
        break;
      case 'help':
        Linking.openURL('mailto:support@albayt.ae').catch(() =>
          Alert.alert('Help', 'Email us at support@albayt.ae'),
        );
        break;
      case 'rate':
        Alert.alert('Rate Al-Bayt', 'Thank you! Redirecting to store…');
        break;
      case 'share':
        Alert.alert('Share App', 'Share Al-Bayt with friends!');
        break;
      case 'privacy':
        Alert.alert('Privacy Policy', 'Opens privacy policy page.');
        break;
      case 'terms':
        Alert.alert('Terms of Service', 'Opens terms of service page.');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign out?',
      'You will be logged out of your Al-Bayt account.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: () => Alert.alert('Signed out') },
      ],
    );
  };

  const bottomPad = insets.bottom + 110;

  return (
    <View style={s.shell}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Hero ────────────────────────────────────────────────── */}
        <LinearGradient
          colors={GRADIENT_HERO}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: Math.max(insets.top + 12, 36) }]}
        >
          {/* decorative rings */}
          <View style={s.ringOuter} />
          <View style={s.ringInner} />

          {/* settings shortcut */}
          <TouchableOpacity style={s.settingsBtn} onPress={() => handleAction('edit')} activeOpacity={0.8}>
            <Ionicons name="settings-outline" size={20} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>

          {/* avatar */}
          <View style={s.avatarRing}>
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.08)']}
              style={s.avatarGlass}
            >
              <Text style={s.avatarInitials}>{USER.initials}</Text>
            </LinearGradient>
            {USER.verified && (
              <View style={s.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
                <View style={s.verifiedDot} />
              </View>
            )}
          </View>

          {/* name + role */}
          <Text style={s.heroName}>{USER.name}</Text>
          <View style={s.rolePill}>
            <Ionicons name="briefcase-outline" size={12} color={ACCENT_LIGHT} />
            <Text style={s.rolePillText}>{USER.role}</Text>
          </View>

          {/* contact row */}
          <View style={s.contactRow}>
            <View style={s.contactChip}>
              <Ionicons name="call-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={s.contactChipText}>{USER.phone}</Text>
            </View>
            <View style={s.contactChip}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.7)" />
              <Text style={s.contactChipText}>{USER.location}</Text>
            </View>
          </View>

          {/* stats row */}
          <View style={s.statsRow}>
            <StatPill value={USER.stats.listings} label="Listings" accent="#93C5FD" />
            <View style={s.statsDivider} />
            <StatPill value={`${(USER.stats.totalViews / 1000).toFixed(1)}k`} label="Total Views" accent="#6EE7B7" />
            <View style={s.statsDivider} />
            <StatPill value={USER.stats.saved} label="Saved" accent="#FCA5A5" />
          </View>

          {/* member badge */}
          <View style={s.memberBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color="rgba(255,255,255,0.65)" />
            <Text style={s.memberText}>Member since {USER.memberSince}</Text>
          </View>
        </LinearGradient>

        {/* ── Completion banner ───────────────────────────────────── */}
        <View style={s.completionWrap}>
          <View style={s.completionCard}>
            <View style={s.completionLeft}>
              <View style={s.completionIconWrap}>
                <Ionicons name="person-add-outline" size={20} color={ACCENT} />
              </View>
              <View>
                <Text style={s.completionTitle}>Complete your profile</Text>
                <Text style={s.completionSub}>Add email & bio to get 2× more leads</Text>
              </View>
            </View>
            <View style={s.completionRight}>
              <View style={s.completionBarTrack}>
                <View style={[s.completionBarFill, { width: '70%' }]} />
              </View>
              <Text style={s.completionPct}>70%</Text>
            </View>
          </View>
        </View>

        {/* ── Account ─────────────────────────────────────────────── */}
        <SectionCard title="My Account">
          {ACCOUNT_ITEMS.map((item, i) => (
            <MenuItem
              key={item.key}
              item={item}
              onPress={handleAction}
              isFirst={i === 0}
              isLast={i === ACCOUNT_ITEMS.length - 1}
            />
          ))}
        </SectionCard>

        {/* ── Preferences ─────────────────────────────────────────── */}
        <SectionCard title="Preferences">
          {TOOLS_ITEMS.map((item, i) => (
            <MenuItem
              key={item.key}
              item={item}
              onPress={handleAction}
              isFirst={i === 0}
              toggleValue={item.toggle ? notificationsOn : undefined}
              onToggleChange={item.toggle ? setNotificationsOn : undefined}
            />
          ))}
        </SectionCard>

        {/* ── Subscription card ───────────────────────────────────── */}
        <View style={s.subWrap}>
          <LinearGradient
            colors={['#1E3A8A', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.subCard}
          >
            <View style={s.subContent}>
              <View>
                <Text style={s.subLabel}>Current Plan</Text>
                <Text style={s.subPlan}>Featured · 3 Months</Text>
                <Text style={s.subExpiry}>Expires 18 Jul 2026</Text>
              </View>
              <TouchableOpacity style={s.subBtn} activeOpacity={0.85}>
                <Text style={s.subBtnText}>Upgrade</Text>
                <Ionicons name="arrow-forward" size={14} color={ACCENT} />
              </TouchableOpacity>
            </View>
            <View style={s.subRingA} />
            <View style={s.subRingB} />
          </LinearGradient>
        </View>

        {/* ── Support & Legal ─────────────────────────────────────── */}
        <SectionCard title="Support & Legal">
          {SUPPORT_ITEMS.map((item, i) => (
            <MenuItem
              key={item.key}
              item={item}
              onPress={handleAction}
              isFirst={i === 0}
            />
          ))}
        </SectionCard>

        {/* ── Sign out ────────────────────────────────────────────── */}
        <View style={s.signOutWrap}>
          <TouchableOpacity style={s.signOutBtn} onPress={handleLogout} activeOpacity={0.82}>
            <View style={s.signOutIconWrap}>
              <Ionicons name="log-out-outline" size={19} color={DANGER} />
            </View>
            <Text style={s.signOutText}>Sign out</Text>
            <Ionicons name="chevron-forward" size={15} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* ── App version ─────────────────────────────────────────── */}
        <Text style={s.version}>Al-Bayt v1.0.0 · Build 100</Text>
      </ScrollView>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────────── */
const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#F1F5F9' },

  /* hero */
  hero: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  ringOuter: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    top: -130,
    right: -60,
  },
  ringInner: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    top: -80,
    right: -20,
  },
  settingsBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    marginTop: Platform.OS === 'ios' ? 32 : 12,
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.35)',
    padding: 3,
    marginBottom: 14,
    marginTop: 6,
    position: 'relative',
  },
  avatarGlass: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  avatarInitials: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    bottom: 0,
    right: 0,
  },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4, marginBottom: 6 },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rolePillText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  contactRow: { flexDirection: 'row', gap: 10, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' },
  contactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  contactChipText: { fontSize: 11.5, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },

  /* stats */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  statsDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.18)', marginHorizontal: 4 },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  memberText: { fontSize: 11.5, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },

  /* completion */
  completionWrap: { paddingHorizontal: 16, marginTop: -16 },
  completionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 5 },
    }),
  },
  completionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  completionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionTitle: { fontSize: 13, fontWeight: '700', color: TEXT.primary, marginBottom: 2 },
  completionSub: { fontSize: 11.5, color: TEXT.secondary, lineHeight: 16 },
  completionRight: { alignItems: 'flex-end', gap: 5, paddingLeft: 12 },
  completionBarTrack: {
    width: 72,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  completionBarFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  completionPct: { fontSize: 11, fontWeight: '700', color: ACCENT },

  /* sign out */
  signOutWrap: { paddingHorizontal: 16, marginTop: 8 },
  signOutBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  signOutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: { flex: 1, fontSize: 14.5, fontWeight: '700', color: DANGER },

  /* version */
  version: {
    textAlign: 'center',
    fontSize: 11.5,
    color: TEXT.tertiary,
    marginTop: 24,
    marginBottom: 8,
  },

  /* subscription */
  subWrap: { paddingHorizontal: 16, marginTop: 8 },
  subCard: {
    borderRadius: 18,
    padding: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: ACCENT_DARK, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14 },
      android: { elevation: 8 },
    }),
  },
  subContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 2 },
  subPlan: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  subExpiry: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3 },
  subBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  subBtnText: { fontSize: 13, fontWeight: '800', color: ACCENT },
  subRingA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    bottom: -60,
    right: -40,
  },
  subRingB: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    bottom: -20,
    right: 20,
  },
});

/* ─── Stat pill ──────────────────────────────────────────────────────────────── */
const stat = StyleSheet.create({
  pill: { flex: 1, alignItems: 'center', gap: 2 },
  value: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  label: { fontSize: 10.5, fontWeight: '600', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.3 },
});

/* ─── Section card ───────────────────────────────────────────────────────────── */
const card = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 16 },
  title: {
    fontSize: 11,
    fontWeight: '800',
    color: TEXT.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingLeft: 4,
  },
  box: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
});

/* ─── Menu row ───────────────────────────────────────────────────────────────── */
const menu = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 14,
    backgroundColor: '#fff',
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: TEXT.primary },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    backgroundColor: ACCENT,
    borderRadius: 20,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  valueText: { fontSize: 12.5, fontWeight: '600', color: TEXT.secondary },
});
