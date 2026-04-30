import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyDetailScreen } from './PropertyDetailScreen';
import { getPropertiesForCategory } from '../data/mockProperties';
import { ACCENT, ACCENT_DARK, ACCENT_DEEP, ACCENT_LIGHT, BG, SURFACE, TEXT } from '../theme/colors';

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
export function ViewPropertyList({ category, onBack, onFilterPress }) {
  const [activeLayoutKey, setActiveLayoutKey] = useState(/** @type {LayoutFilterKey} */('all'));
  const [detailProperty, setDetailProperty] = useState(/** @type {object | null} */(null));
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sheetFilters, setSheetFilters] = useState({ ...DEFAULT_SHEET_FILTERS });

  const baseProperties = useMemo(() => getPropertiesForCategory(category.id), [category.id]);

  const filteredProperties = useMemo(() => {
    let list = filterByLayoutKey(baseProperties, activeLayoutKey);

    /* price range */
    const mn = priceNum(sheetFilters.minPrice);
    const mx = priceNum(sheetFilters.maxPrice);
    if (mn) list = list.filter((p) => priceNum(p.price) >= mn);
    if (mx) list = list.filter((p) => priceNum(p.price) <= mx);

    /* bhk */
    if (sheetFilters.bhk !== 'All') {
      list = list.filter((p) => {
        const b = p.bhk ?? '';
        if (sheetFilters.bhk === 'Studio') return b === '0' || b === '';
        if (sheetFilters.bhk.includes('4+')) return parseInt(b, 10) >= 4;
        return b === (sheetFilters.bhk.match(/\d+/)?.[0] ?? '');
      });
    }

    return list;
  }, [baseProperties, activeLayoutKey, sheetFilters]);

  useEffect(() => {
    setActiveLayoutKey('all');
    setDetailProperty(null);
    setSheetFilters({ ...DEFAULT_SHEET_FILTERS });
  }, [category.id]);

  const fc = countSheetFilters(sheetFilters);

  const handleApply = (f) => {
    setSheetFilters(f);
    setFilterSheetOpen(false);
  };

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
              <Text style={styles.headerTitle}>{category.label}</Text>
            </View>
            <Pressable
              onPress={() => setFilterSheetOpen(true)}
              style={({ pressed }) => [styles.headerIconBtn, pressed && styles.headerIconBtnPressed]}
              accessibilityRole="button"
              accessibilityLabel="Open filters"
            >
              <Ionicons name="options-outline" size={19} color="#FFFFFF" />
              {fc > 0 && <View style={styles.filterDot} />}
            </Pressable>
          </View>

          {/* active filter summary strip */}
          {fc > 0 && (
            <View style={styles.activeStrip}>
              <Ionicons name="funnel" size={12} color="rgba(255,255,255,0.85)" />
              <Text style={styles.activeStripText}>
                {fc} filter{fc > 1 ? 's' : ''} active · {filteredProperties.length} result{filteredProperties.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity onPress={() => setSheetFilters({ ...DEFAULT_SHEET_FILTERS })} activeOpacity={0.8}>
                <Text style={styles.activeStripClear}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </LinearGradient>

        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.cardGap} />}
          ListHeaderComponent={
            filteredProperties.length > 0 ? (
              <Text style={styles.listIntro}>
                {filteredProperties.length} propert{filteredProperties.length === 1 ? 'y' : 'ies'} found
                {fc > 0 ? ` · ${fc} filter${fc > 1 ? 's' : ''} applied` : ''}
              </Text>
            ) : (
              <View style={styles.emptyWrap}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="search-outline" size={30} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>No properties found</Text>
                <Text style={styles.emptySub}>Try adjusting your filters.</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => setSheetFilters({ ...DEFAULT_SHEET_FILTERS })} activeOpacity={0.8}>
                  <Text style={styles.emptyBtnText}>Clear filters</Text>
                </TouchableOpacity>
              </View>
            )
          }
          renderItem={({ item }) => (
            <PropertyCard property={item} variant="listing" onPress={() => setDetailProperty(item)} style={styles.card} />
          )}
        />
      </SafeAreaView>

      <PropertyFilterSheet
        visible={filterSheetOpen}
        filters={sheetFilters}
        onApply={handleApply}
        onClose={() => setFilterSheetOpen(false)}
      />
    </View>
  );
}

/* ─── filter sheet constants ─────────────────────────────────────────────────── */
const BHK_OPTS = ['All', 'Studio', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
const FURNISH_OPTS = ['All', 'Unfurnished', 'Semi-furnished', 'Fully Furnished'];
const BATH_OPTS = ['All', '1', '2', '3', '4+'];
const FACING_OPTS = ['All', 'East', 'West', 'North', 'South', 'Front', 'Corner'];
const BUDGET_PRESETS = [
  { label: 'All', min: '', max: '' },
  { label: '< 10k', min: '', max: '10000' },
  { label: '10k–15k', min: '10000', max: '15000' },
  { label: '15k–20k', min: '15000', max: '20000' },
  { label: '20k–30k', min: '20000', max: '30000' },
  { label: '30k–40k', min: '30000', max: '40000' },
  { label: '40k+', min: '40000', max: '' },
];

const DEFAULT_SHEET_FILTERS = {
  bhk: 'All',
  furnishing: 'All',
  bathrooms: 'All',
  facing: 'All',
  minPrice: '',
  maxPrice: '',
};

function priceNum(s) { return parseFloat(String(s || '0').replace(/,/g, '')) || 0; }

function countSheetFilters(f) {
  let n = 0;
  if (f.bhk !== 'All') n++;
  if (f.furnishing !== 'All') n++;
  if (f.bathrooms !== 'All') n++;
  if (f.facing !== 'All') n++;
  if (f.minPrice || f.maxPrice) n++;
  return n;
}

/* ── small chip ── */
function FChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[fs.chip, selected && fs.chipSel]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {selected && <Ionicons name="checkmark" size={11} color={ACCENT} style={{ marginRight: 2 }} />}
      <Text style={[fs.chipText, selected && fs.chipSelText]}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ── section label ── */
function FLabel({ color = ACCENT, children }) {
  return (
    <View style={fs.secRow}>
      <View style={[fs.secBar, { backgroundColor: color }]} />
      <Text style={fs.secLabel}>{children}</Text>
    </View>
  );
}


/* ─── PropertyFilterSheet ────────────────────────────────────────────────────── */
function PropertyFilterSheet({ visible, filters, onApply, onClose }) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState({ ...filters });

  useEffect(() => { if (visible) setDraft({ ...filters }); }, [visible, filters]);

  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));
  const fc = countSheetFilters(draft);

  const activePreset = BUDGET_PRESETS.find(
    (p) => p.min === draft.minPrice && p.max === draft.maxPrice,
  ) ?? null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={fs.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={fs.avoidWrap}
        >
          <View style={[fs.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            {/* handle */}
            <View style={fs.handle} />

            {/* header */}
            <View style={fs.header}>
              <TouchableOpacity style={fs.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <Ionicons name="close" size={20} color={TEXT.primary} />
              </TouchableOpacity>
              <Text style={fs.headerTitle}>Filters</Text>
              <TouchableOpacity
                style={fs.resetBtn}
                onPress={() => setDraft({ ...DEFAULT_SHEET_FILTERS })}
                activeOpacity={0.8}
              >
                <Text style={[fs.resetText, fc === 0 && { color: '#CBD5E1' }]}>Reset all</Text>
              </TouchableOpacity>
            </View>

            {/* active badge */}
            {fc > 0 && (
              <View style={fs.activeBanner}>
                <Ionicons name="funnel" size={13} color={ACCENT} />
                <Text style={fs.activeBannerText}>{fc} filter{fc > 1 ? 's' : ''} active</Text>
              </View>
            )}

            <ScrollView
              style={fs.scroll}
              contentContainerStyle={fs.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* BUDGET */}
              <View style={fs.section}>
                <FLabel color="#22C55E">Budget (AED / month)</FLabel>
                {/* preset grid */}
                <View style={fs.presetGrid}>
                  {BUDGET_PRESETS.map((p) => {
                    const sel = activePreset?.label === p.label;
                    return (
                      <TouchableOpacity
                        key={p.label}
                        style={[fs.presetCell, sel && fs.presetCellSel]}
                        onPress={() => { set('minPrice', p.min); set('maxPrice', p.max); }}
                        activeOpacity={0.78}
                      >
                        {sel && <Ionicons name="checkmark-circle" size={12} color={ACCENT} />}
                        <Text style={[fs.presetText, sel && fs.presetTextSel]}>{p.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {/* custom min / max */}
                <View style={fs.budgetRow}>
                  <View style={[fs.budgetBox, draft.minPrice && fs.budgetBoxActive]}>
                    <Text style={fs.budgetLbl}>MIN</Text>
                    <TextInput
                      style={fs.budgetField}
                      placeholder="0"
                      placeholderTextColor="#CBD5E1"
                      value={draft.minPrice}
                      onChangeText={(v) => set('minPrice', v)}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                    <Text style={fs.budgetCcy}>AED</Text>
                  </View>
                  <View style={fs.budgetConn}>
                    <View style={[fs.budgetLine, (draft.minPrice || draft.maxPrice) && fs.budgetLineActive]} />
                    <Text style={fs.budgetTo}>to</Text>
                    <View style={[fs.budgetLine, (draft.minPrice || draft.maxPrice) && fs.budgetLineActive]} />
                  </View>
                  <View style={[fs.budgetBox, draft.maxPrice && fs.budgetBoxActive]}>
                    <Text style={fs.budgetLbl}>MAX</Text>
                    <TextInput
                      style={fs.budgetField}
                      placeholder="Any"
                      placeholderTextColor="#CBD5E1"
                      value={draft.maxPrice}
                      onChangeText={(v) => set('maxPrice', v)}
                      keyboardType="numeric"
                      returnKeyType="done"
                    />
                    <Text style={fs.budgetCcy}>AED</Text>
                  </View>
                </View>
                {(draft.minPrice || draft.maxPrice) && (
                  <View style={fs.budgetSummary}>
                    <Ionicons name="cash-outline" size={13} color={ACCENT} />
                    <Text style={fs.budgetSummaryText}>
                      {draft.minPrice ? `AED ${priceNum(draft.minPrice).toLocaleString()}` : 'No min'}
                      {'  →  '}
                      {draft.maxPrice ? `AED ${priceNum(draft.maxPrice).toLocaleString()}` : 'No max'}
                    </Text>
                    <TouchableOpacity onPress={() => { set('minPrice', ''); set('maxPrice', ''); }} activeOpacity={0.8}>
                      <Ionicons name="close-circle" size={15} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* BHK */}
              <View style={fs.section}>
                <FLabel color={ACCENT}>BHK / Configuration</FLabel>
                <View style={fs.chipRow}>
                  {BHK_OPTS.map((o) => (
                    <FChip key={o} label={o} selected={draft.bhk === o} onPress={() => set('bhk', o)} />
                  ))}
                </View>
              </View>

              {/* FURNISHING */}
              <View style={fs.section}>
                <FLabel color="#8B5CF6">Furnishing</FLabel>
                <View style={fs.chipRow}>
                  {FURNISH_OPTS.map((o) => (
                    <FChip key={o} label={o} selected={draft.furnishing === o} onPress={() => set('furnishing', o)} />
                  ))}
                </View>
              </View>

              {/* BATHROOMS */}
              <View style={fs.section}>
                <FLabel color="#06B6D4">Bathrooms</FLabel>
                <View style={fs.chipRow}>
                  {BATH_OPTS.map((o) => (
                    <FChip key={o} label={o} selected={draft.bathrooms === o} onPress={() => set('bathrooms', o)} />
                  ))}
                </View>
              </View>

              {/* FACING */}
              <View style={[fs.section, { borderBottomWidth: 0 }]}>
                <FLabel color="#F59E0B">Facing</FLabel>
                <View style={fs.chipRow}>
                  {FACING_OPTS.map((o) => (
                    <FChip key={o} label={o} selected={draft.facing === o} onPress={() => set('facing', o)} />
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* apply footer */}
            <View style={fs.footer}>
              <TouchableOpacity
                style={[fs.footReset, fc === 0 && fs.footResetDim]}
                onPress={() => setDraft({ ...DEFAULT_SHEET_FILTERS })}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={15} color={fc ? TEXT.secondary : '#CBD5E1'} />
                <Text style={[fs.footResetText, fc === 0 && { color: '#CBD5E1' }]}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={fs.applyBtn}
                onPress={() => onApply(draft)}
                activeOpacity={0.88}
              >
                <LinearGradient
                  colors={[ACCENT_LIGHT, ACCENT, ACCENT_DARK]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={fs.applyGrad}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={fs.applyText}>Apply filters</Text>
                  {fc > 0 && (
                    <View style={fs.applyBadge}>
                      <Text style={fs.applyBadgeText}>{fc}</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
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
  filterDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#FCD34D', borderWidth: 1.5, borderColor: 'rgba(30,58,138,0.6)',
  },
  activeStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 8, paddingHorizontal: 4,
  },
  activeStripText: { flex: 1, fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  activeStripClear: { fontSize: 12, fontWeight: '800', color: '#FCD34D' },
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: TEXT.primary, marginBottom: 6 },
  emptySub: { fontSize: 13, color: TEXT.secondary, textAlign: 'center', lineHeight: 19, marginBottom: 18 },
  emptyBtn: {
    backgroundColor: '#EFF6FF', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10,
    borderWidth: 1.5, borderColor: ACCENT,
  },
  emptyBtnText: { fontSize: 13, fontWeight: '700', color: ACCENT },
});

/* ─── filter sheet styles ────────────────────────────────────────────────────── */
const fs = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.5)',
    justifyContent: 'flex-end',
  },
  avoidWrap: { justifyContent: 'flex-end', flex: 1 },
  sheet: {
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    height: '85%',
    flexDirection: 'column',
    borderWidth: 1, borderColor: 'rgba(15,23,42,0.08)',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.12, shadowRadius: 20 },
      android: { elevation: 24 },
    }),
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },

  /* header */
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800',
    color: TEXT.primary, letterSpacing: -0.3,
  },
  resetBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  resetText: { fontSize: 13.5, fontWeight: '700', color: '#DC2626' },

  /* active banner */
  activeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#BFDBFE',
  },
  activeBannerText: { fontSize: 12.5, fontWeight: '700', color: ACCENT },

  /* scroll */
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 12 },

  /* sections */
  section: {
    backgroundColor: '#fff', paddingHorizontal: 16,
    paddingTop: 18, paddingBottom: 10,
    marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  secBar: { width: 4, height: 16, borderRadius: 2 },
  secLabel: { fontSize: 11.5, fontWeight: '800', color: TEXT.primary, textTransform: 'uppercase', letterSpacing: 0.6 },

  /* chips */
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 13, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  chipSel: { borderColor: ACCENT, backgroundColor: '#EFF6FF' },
  chipText: { fontSize: 13, fontWeight: '600', color: TEXT.secondary },
  chipSelText: { color: ACCENT, fontWeight: '700' },

  /* budget */
  presetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 14 },
  presetCell: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  presetCellSel: { borderColor: ACCENT, backgroundColor: '#EFF6FF' },
  presetText: { fontSize: 12.5, fontWeight: '600', color: TEXT.secondary },
  presetTextSel: { color: ACCENT, fontWeight: '800' },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: 10 },
  budgetBox: {
    flex: 1, backgroundColor: '#F8FAFC',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  budgetBoxActive: { borderColor: ACCENT, backgroundColor: '#EFF6FF' },
  budgetLbl: { fontSize: 9, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 },
  budgetField: { fontSize: 20, fontWeight: '800', color: TEXT.primary, padding: 0 },
  budgetCcy: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginTop: 2 },
  budgetConn: { width: 36, alignItems: 'center', justifyContent: 'center', gap: 3 },
  budgetLine: { flex: 1, width: 1.5, backgroundColor: '#E2E8F0', maxHeight: 16 },
  budgetLineActive: { backgroundColor: ACCENT },
  budgetTo: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  budgetSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#EFF6FF', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 4,
  },
  budgetSummaryText: { flex: 1, fontSize: 12.5, fontWeight: '700', color: ACCENT },

  /* footer */
  footer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 12 },
    }),
  },
  footReset: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  footResetDim: { borderColor: '#F1F5F9' },
  footResetText: { fontSize: 13, fontWeight: '700', color: TEXT.secondary },
  applyBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  applyGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, gap: 8,
  },
  applyText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.1 },
  applyBadge: {
    minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  applyBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
});

/** Alias for the requested screen name */
export const ViewPropartyList = ViewPropertyList;
