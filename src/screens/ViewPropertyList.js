import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyDetailScreen } from './PropertyDetailScreen';
import { getPropertiesForCategory } from '../data/mockProperties';
import { ACCENT, ACCENT_DEEP, ACCENT_LIGHT, BG, SURFACE, TEXT } from '../theme/colors';

/** @typedef {'all'|'3bhk'|'2bhk'|'1bhk'|'1rk'} LayoutFilterKey */

const HEADER_GRADIENT = ['#1D4ED8', '#3B82F6', '#3B82F6'];
const H_PAD = 18;

const LAYOUT_FILTER_LABELS = {
  all: 'All',
  '3bhk': '3BHK',
  '2bhk': '2BHK',
  '1bhk': '1BHK',
  '1rk': '1RK',
};

function bhkDigit(p) {
  return p.bhk?.match(/\d+/)?.[0] ?? '';
}

/** @param {object[]} list @param {LayoutFilterKey} key */
function filterByLayoutKey(list, key) {
  if (key === 'all') return list;
  const t = (s) => (s || '').toLowerCase();
  return list.filter((p) => {
    const d = bhkDigit(p);
    if (key === '3bhk') return d === '3';
    if (key === '2bhk') return d === '2';
    if (key === '1bhk') {
      if (d !== '1') return false;
      if (t(p.title).includes('rk')) return false;
      if (/share|hostel|pg|bunk|studio/.test(t(p.title))) return false;
      return true;
    }
    if (key === '1rk') {
      if (d === '0') return true;
      const title = t(p.title);
      if (title.includes('1rk') || title.includes(' rk') || title.includes('room kitchen')) return true;
      if (d === '1' && /share|hostel|pg|bunk|studio/.test(title)) return true;
      return false;
    }
    return true;
  });
}

/** @param {{ selected: boolean; onPress: () => void; icon: string; label: string }} props */
function LayoutFilterChip({ selected, onPress, icon, label }) {
  if (selected) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.chipGlow, pressed && styles.chipPressed]}
        accessibilityRole="button"
        accessibilityState={{ selected: true }}
      >
        <LinearGradient
          colors={[ACCENT_DEEP, ACCENT, ACCENT_LIGHT]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.chipSelectedBody}
        >
          <Ionicons name={icon} size={14} color="#FFFFFF" />
          <Text style={styles.chipLabelOnGradient}>{label}</Text>
        </LinearGradient>
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chipNeutral, pressed && styles.chipPressed]}
      accessibilityRole="button"
      accessibilityState={{ selected: false }}
    >
      <Ionicons name={icon} size={14} color={ACCENT} />
      <Text style={styles.chipLabelNeutral}>{label}</Text>
    </Pressable>
  );
}

/**
 * Full-screen list of properties for the category selected on Home.
 *
 * @param {{ category: { id: string; label: string; icon?: string; color?: string; iconSource?: number }; onBack: () => void; onFilterPress?: () => void }} props
 */
export function ViewPropertyList({ category, onBack, onFilterPress = () => { } }) {
  const [activeLayoutKey, setActiveLayoutKey] = useState(/** @type {LayoutFilterKey} */('all'));
  const [detailProperty, setDetailProperty] = useState(/** @type {object | null} */(null));

  const baseProperties = useMemo(() => getPropertiesForCategory(category.id), [category.id]);

  const filteredProperties = useMemo(
    () => filterByLayoutKey(baseProperties, activeLayoutKey),
    [baseProperties, activeLayoutKey],
  );

  useEffect(() => {
    setActiveLayoutKey('all');
    setDetailProperty(null);
  }, [category.id]);

  const layoutLabel = LAYOUT_FILTER_LABELS[activeLayoutKey];

  if (detailProperty) {
    return (
      <PropertyDetailScreen
        property={detailProperty}
        category={category}
        onBack={() => setDetailProperty(null)}
      />
    );
  }

  return (
    <View style={styles.shell}>
      <LinearGradient colors={[BG.top, BG.mid]} style={StyleSheet.absoluteFill} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
      <StatusBar style="light" />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <LinearGradient colors={HEADER_GRADIENT} locations={[0, 0.45, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.headerIconBtn, pressed && styles.headerIconBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </Pressable>
            <View style={styles.headerTitleBlock}>
              <Text style={styles.headerEyebrow}>Browse listings</Text>
              <Text style={styles.headerTitle}>Properties</Text>
            </View>
            <Pressable
              onPress={onFilterPress}
              style={({ pressed }) => [styles.headerIconBtn, pressed && styles.headerIconBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Open filters"
            >
              <Ionicons name="options-outline" size={19} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* <View style={styles.filterCard}>
            <View style={[styles.filterIconRing, { borderColor: `${category.color ?? ACCENT}55` }]}>
              {category.iconSource ? (
                <Image source={category.iconSource} style={styles.filterIconImg} resizeMode="contain" />
              ) : (
                <Ionicons name={category.icon ?? 'apps-outline'} size={22} color={category.color ?? ACCENT} />
              )}
            </View>
            <View style={styles.filterTextCol}>
              <Text style={styles.filterLabel}>Active filter</Text>
              <Text style={styles.filterValue}>{category.label}</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{filteredProperties.length} found</Text>
            </View>
          </View> */}
        </LinearGradient>



        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.cardGap} />}

          renderItem={({ item }) => (
            <PropertyCard property={item} variant="listing" onPress={() => setDetailProperty(item)} style={styles.card} />
          )}
        />
      </SafeAreaView>
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
  header: {
    paddingHorizontal: H_PAD,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    marginBottom: 14,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBtnPressed: {
    opacity: 0.88,
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 0.35,
    textTransform: 'uppercase',
  },
  headerTitle: {
    marginTop: 2,
    fontSize: 21,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.45,
  },
  filterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  filterIconRing: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIconImg: {
    width: 28,
    height: 28,
  },
  filterTextCol: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  filterValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: '800',
    color: TEXT.primary,
    letterSpacing: -0.35,
  },
  countPill: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: ACCENT,
  },
  filtersStripWrap: {
    marginTop: -14,
    marginHorizontal: 0,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  filtersStripGradient: {
    paddingTop: 16,
    paddingBottom: 14,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
  },
  filtersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    marginBottom: 14,
    gap: 12,
  },
  filtersTitleCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    minWidth: 0,
  },
  filtersTitleIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.18)',
  },
  filtersTitleIconGlyph: {
    zIndex: 1,
  },
  filtersTitleTextCol: {
    flex: 1,
    minWidth: 0,
  },
  filtersStripHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.4,
  },
  filtersStripSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT.secondary,
    letterSpacing: -0.1,
  },
  resultCountPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.2)',
    minWidth: 56,
  },
  resultCountValue: {
    fontSize: 17,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -0.5,
  },
  resultCountLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: TEXT.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  chipsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    gap: 8,
    paddingBottom: 2,
  },
  chipGlow: {
    borderRadius: 999,
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_DEEP,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      // android: { elevation: 4 },
      default: {},
    }),
  },
  chipSelectedBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  chipLabelOnGradient: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  chipNeutral: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    maxWidth: 260,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  chipLabelNeutral: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT.primary,
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  chipPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  chipMore: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  chipMoreInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    borderColor: ACCENT,
  },
  chipMoreLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -0.2,
  },
  scopeBanner: {
    marginHorizontal: H_PAD,
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  scopeAccentBar: {
    width: 4,
    backgroundColor: ACCENT,
    opacity: 0.95,
  },
  scopeBannerInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingRight: 14,
    paddingLeft: 12,
    gap: 12,
  },
  scopeIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scopeTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  scopeEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  scopeTitleLine: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.primary,
    lineHeight: 19,
    letterSpacing: -0.25,
  },
  scopeTitleStrong: {
    fontWeight: '800',
    color: TEXT.primary,
  },
  scopeTitleDim: {
    fontWeight: '600',
    color: TEXT.tertiary,
  },
  scopeMeta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT.secondary,
    letterSpacing: -0.1,
  },
  listContent: {
    paddingHorizontal: H_PAD,
    paddingTop: 16,
    paddingBottom: 28,
  },
  listIntro: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT.secondary,
    lineHeight: 17,
    marginBottom: 14,
    letterSpacing: -0.08,
  },
  cardGap: {
    height: 14,
  },
  card: {
    marginHorizontal: 0,
  },
});

/** Alias for the requested screen name */
export const ViewPropartyList = ViewPropertyList;
