import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar } from '../components/BottomTabBar';
import { PlaceholderTabScreen } from './PlaceholderTabScreen';
import { ACCENT, BG, SURFACE, TEXT } from '../theme/colors';

/** Payment List grid — matches reference: colorful icons on light squircles */
const CATEGORIES = [
  { id: 'flat', label: 'Flat', icon: 'bed', color: '#3B82F6' },
  { id: 'shop', label: 'Shop', icon: 'storefront-outline', color: '#22C55E' },
  { id: 'office', label: 'Office', icon: 'briefcase-outline', color: '#F59E0B' },
  { id: 'pg', label: 'PG/Hostel', icon: 'bed-outline', color: '#8B5CF6' },
  { id: 'parking', label: 'Parking', icon: 'car-outline', color: '#EF4444' },
  { id: 'warehouse', label: 'Warehouse', icon: 'cube-outline', color: '#06B6D4' },
  { id: 'sharing', label: 'Room Sharing', icon: 'people-outline', color: '#EC4899' },
  { id: 'more', label: 'More', icon: 'apps-outline', color: '#7C3AED' },
];

const QUICK_ACTIONS = [
  { key: 'buy', label: 'Buy', icon: 'cart-outline' },
  { key: 'sell', label: 'Sell', icon: 'cash-outline' },
  { key: 'rent', label: 'Rent', icon: 'key-outline' },
  { key: 'explore', label: 'Explore', icon: 'search-outline' },
];

const PURPLE_HEADER = ['#3B0764', '#581C87', '#6D28D9'];
const PROMO_PURPLE = ['#4C1D95', '#6B21A8', '#7C3AED'];
const CATEGORY_TILE_BG = '#F8F9FB';
const QUICK_ICON_RING = '#DDD6FE';

/**
 * Height of the tab bar chrome that overlaps scrollable content (bar row + vertical padding).
 * Bottom safe area is added only once — see `tabBarPad` below (not doubled with BottomTabBar’s own inset padding).
 */
const TAB_BAR_OVERLAP = 98;

const CATEGORY_GRID_COLS = 4;
const CATEGORY_GRID_GAP = 12;
const CATEGORY_H_PAD = 18;

export function HomeScreen() {
  const [tab, setTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('flat');
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const tabBarPad = TAB_BAR_OVERLAP + insets.bottom;

  const categoryCellWidth = Math.floor(
    (windowWidth - CATEGORY_H_PAD * 2 - CATEGORY_GRID_GAP * (CATEGORY_GRID_COLS - 1)) / CATEGORY_GRID_COLS,
  );

  return (
    <View style={styles.shell}>
      <LinearGradient
        colors={[BG.top, BG.mid]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {tab === 'home' && (
          <View style={[styles.homeLayout, { paddingBottom: tabBarPad }]}>
            <LinearGradient
              colors={PURPLE_HEADER}
              locations={[0, 0.45, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerTopRow}>
                <View style={styles.brandRow}>
                  <View style={styles.logoMarkLight}>
                    <Ionicons name="home" size={22} color="#FFFFFF" />
                  </View>
                  <View style={styles.brandTextCol}>
                    <Text style={styles.brandNameOnGradient}>Al-Bayt</Text>
                    <Text style={styles.brandTagOnGradient}>Find your space</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.notifyBtnOnGradient} activeOpacity={0.85}>
                  <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
                  <View style={styles.notifyDotOnGradient} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchRow}>
                <Pressable
                  style={({ pressed }) => [styles.searchHeroShell, pressed && styles.searchHeroPressed]}
                  onPress={() => setTab('search')}
                  accessibilityRole="button"
                  accessibilityLabel="Open search"
                >
                  <View style={styles.searchHeroInner}>
                    <View style={styles.searchIconBubble}>
                      <Ionicons name="search" size={18} color={ACCENT} />
                    </View>
                    <TextInput
                      placeholder="What are you looking for?"
                      placeholderTextColor="#94A3B8"
                      style={styles.searchHeroInput}
                      returnKeyType="search"
                      cursorColor={ACCENT}
                      selectionColor="rgba(124, 58, 237, 0.35)"
                      editable={false}
                      pointerEvents="none"
                    />
                    <View style={styles.searchMicHint}>
                      <Ionicons name="mic-outline" size={20} color="#636366" />
                    </View>
                  </View>
                </Pressable>
                <TouchableOpacity style={styles.filterOnHero} activeOpacity={0.85}>
                  <Ionicons name="options-outline" size={22} color={ACCENT} />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={styles.quickCardWrap}>
              <View style={styles.quickActionCard}>
                {QUICK_ACTIONS.map((a) => (
                  <TouchableOpacity
                    key={a.key}
                    style={styles.quickActionItem}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={a.label}
                  >
                    <View style={styles.quickIconRing}>
                      <Ionicons name={a.icon} size={22} color={ACCENT} />
                    </View>
                    <Text style={styles.quickActionLabel}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <ScrollView
              style={styles.homeScroll}
              contentContainerStyle={styles.homeScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.categorySectionTitle}>Payment List</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((c) => (
                  <CategoryGlassChip
                    key={c.id}
                    c={c}
                    tileWidth={categoryCellWidth}
                    active={selectedCategory === c.id}
                    onPress={() => setSelectedCategory(c.id)}
                  />
                ))}
              </View>

              <View style={styles.promoHeaderRow}>
                <Text style={styles.promoSectionTitle}>Promo & Discount</Text>
                <TouchableOpacity activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.promoSeeMore}>See more</Text>
                </TouchableOpacity>
              </View>

              <LinearGradient colors={PROMO_PURPLE} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promoCard}>
                <View style={[styles.promoBlob, styles.promoBlob1]} />
                <View style={[styles.promoBlob, styles.promoBlob2]} />
                <View style={[styles.promoBlob, styles.promoBlob3]} />
                <Text style={styles.promoCardTitle}>Special Offer for Today&apos;s Top Up</Text>
                <Text style={styles.promoCardSub}>Limited time — tap to view details</Text>
              </LinearGradient>
            </ScrollView>
          </View>
        )}

        {tab === 'search' && (
          <View style={[styles.tabPane, { paddingBottom: tabBarPad }]}>
            <PlaceholderTabScreen title="Search" />
          </View>
        )}
        {tab === 'add' && (
          <View style={[styles.tabPane, { paddingBottom: tabBarPad }]}>
            <PlaceholderTabScreen title="Add property" />
          </View>
        )}
        {tab === 'bookmark' && (
          <View style={[styles.tabPane, { paddingBottom: tabBarPad }]}>
            <PlaceholderTabScreen title="Bookmark" />
          </View>
        )}
        {tab === 'profile' && (
          <View style={[styles.tabPane, { paddingBottom: tabBarPad }]}>
            <PlaceholderTabScreen title="Profile" />
          </View>
        )}
      </SafeAreaView>

      <BottomTabBar activeKey={tab} onTabChange={setTab} bottomInset={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: BG.bottom,
  },
  safe: {
    flex: 1,
  },
  tabPane: {
    flex: 1,
  },
  homeLayout: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  headerGradient: {
    paddingHorizontal: CATEGORY_H_PAD,
    paddingTop: 32,
    paddingBottom: 50,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  searchHeroShell: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: SURFACE,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 14,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  searchHeroPressed: {
    opacity: 0.94,
  },
  searchHeroInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    minHeight: 52,
  },
  searchIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  searchHeroInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT.primary,
    fontWeight: '300',
    letterSpacing: -0.2,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    paddingRight: 6,
  },
  searchMicHint: {
    opacity: 0.85,
    paddingLeft: 4,
  },
  filterOnHero: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoMarkLight: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextCol: {
    flex: 1,
  },
  brandNameOnGradient: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.35,
  },
  brandTagOnGradient: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.88)',
    marginTop: 3,
    fontWeight: '500',
  },
  notifyBtnOnGradient: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifyDotOnGradient: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FCA5A5',
    borderWidth: 2,
    borderColor: 'rgba(15, 23, 42, 0.35)',
  },
  quickCardWrap: {
    marginTop: -22,
    marginBottom: 10,
    paddingHorizontal: CATEGORY_H_PAD,
    zIndex: 2,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    backgroundColor: SURFACE,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  quickIconRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: QUICK_ICON_RING,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAF5FF',
  },
  quickActionLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  homeScroll: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  homeScrollContent: {
    paddingHorizontal: CATEGORY_H_PAD,
    paddingTop: 8,
    paddingBottom: 8,
  },
  categorySectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT.primary,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CATEGORY_GRID_GAP,
    marginBottom: 24,
  },
  categoryTile: {
    alignItems: 'stretch',
  },
  categoryCellInner: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 2,
    minHeight: 100,
  },
  categoryIconSquircle: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: CATEGORY_TILE_BG,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  categoryIconSquircleActive: {
    backgroundColor: '#FAF5FF',
    borderWidth: 2,
    borderColor: ACCENT,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
    lineHeight: 14,
    letterSpacing: -0.1,
  },
  categoryLabelActive: {
    color: ACCENT,
    fontWeight: '700',
  },
  promoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  promoSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT.primary,
    letterSpacing: -0.3,
  },
  promoSeeMore: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
  },
  promoCard: {
    borderRadius: 16,
    paddingVertical: 22,
    paddingHorizontal: 20,
    overflow: 'hidden',
    minHeight: 120,
    justifyContent: 'center',
  },
  promoCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.35,
    maxWidth: '88%',
  },
  promoCardSub: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  promoBlob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.35,
  },
  promoBlob1: {
    width: 120,
    height: 120,
    backgroundColor: '#A78BFA',
    top: -40,
    right: -20,
  },
  promoBlob2: {
    width: 64,
    height: 64,
    backgroundColor: '#FBCFE8',
    bottom: 12,
    right: 48,
    opacity: 0.45,
  },
  promoBlob3: {
    width: 88,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C4B5FD',
    bottom: -12,
    left: 24,
    opacity: 0.3,
  },
});

function CategoryGlassChip({ c, active, onPress, tileWidth }) {
  const iconColor = active ? ACCENT : c.color;
  return (
    <TouchableOpacity
      style={[styles.categoryTile, { width: tileWidth }]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={c.label}
    >
      <View style={styles.categoryCellInner}>
        <View style={[styles.categoryIconSquircle, active && styles.categoryIconSquircleActive]}>
          <Ionicons name={c.icon} size={26} color={iconColor} />
        </View>
        <Text style={[styles.categoryLabel, active && styles.categoryLabelActive]} numberOfLines={2}>
          {c.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
