import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACCENT, ACCENT_DARK, ACCENT_LIGHT, BORDER_SUBTLE, TEXT } from '../theme/colors';
import { MOCK_PROPERTIES_BY_CATEGORY } from '../data/mockProperties';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyDetailScreen } from './PropertyDetailScreen';

/* ─── constants ─────────────────────────────────────────────────────────────── */
const ACCENT_MUTED = '#EFF6FF';
const DANGER = '#DC2626';

const PROPERTY_TYPES = [
  { id: 'flat', label: 'Flat', icon: 'business-outline', color: '#3B82F6' },
  { id: 'shop', label: 'Shop', icon: 'storefront-outline', color: '#F59E0B' },
  { id: 'office', label: 'Office', icon: 'briefcase-outline', color: '#8B5CF6' },
  { id: 'pg', label: 'PG/Hostel', icon: 'bed-outline', color: '#EC4899' },
  { id: 'parking', label: 'Parking', icon: 'car-outline', color: '#EF4444' },
  { id: 'warehouse', label: 'Warehouse', icon: 'cube-outline', color: '#06B6D4' },
  { id: 'sharing', label: 'Sharing', icon: 'people-outline', color: '#22C55E' },
  { id: 'more', label: 'More', icon: 'apps-outline', color: '#94A3B8' },
];

const BHK_OPTIONS = ['Studio', '1 BHK', '2 BHK', '3 BHK', '4+ BHK'];
const FURNISH_OPTIONS = ['Unfurnished', 'Semi-furnished', 'Fully Furnished'];
const FACING_OPTIONS = ['East', 'West', 'North', 'South', 'Front', 'Corner'];
const BATH_OPTIONS = ['1', '2', '3', '4+'];
const POSTED_OPTIONS = ['Any time', 'Today', 'Last 3 days', 'Last week', 'Last month'];
const SORT_OPTIONS = [
  { id: 'relevance', label: 'Relevance', icon: 'star-outline' },
  { id: 'price_asc', label: 'Price: Low → High', icon: 'trending-up-outline' },
  { id: 'price_desc', label: 'Price: High → Low', icon: 'trending-down-outline' },
  { id: 'newest', label: 'Newest first', icon: 'time-outline' },
];
const AMENITY_OPTIONS = [
  { id: 'lift', label: 'Lift', icon: 'arrow-up-circle-outline' },
  { id: 'parking', label: 'Car Parking', icon: 'car-outline' },
  { id: 'backup', label: 'Power Backup', icon: 'flash-outline' },
  { id: 'pool', label: 'Pool', icon: 'water-outline' },
  { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
  { id: 'security', label: 'Security', icon: 'shield-outline' },
  { id: 'cctv', label: 'CCTV', icon: 'videocam-outline' },
  { id: 'pet', label: 'Pet Friendly', icon: 'paw-outline' },
  { id: 'wifi', label: 'Wi-Fi', icon: 'wifi-outline' },
  { id: 'fire', label: 'Fire Safety', icon: 'flame-outline' },
  { id: 'garden', label: 'Garden', icon: 'leaf-outline' },
  { id: 'intercom', label: 'Intercom', icon: 'call-outline' },
];

const DEFAULT_FILTERS = {
  listingType: '',
  categories: [],
  minPrice: '',
  maxPrice: '',
  bhk: [],
  furnishing: [],
  facing: [],
  bathrooms: [],
  amenities: [],
  postedWithin: 'Any time',
  sortBy: 'relevance',
};

const ALL_LISTINGS = Object.entries(MOCK_PROPERTIES_BY_CATEGORY).flatMap(
  ([cat, items]) => items.map((p) => ({ ...p, categoryId: cat })),
);

const priceNum = (s) => parseFloat(String(s || '0').replace(/,/g, '')) || 0;

function countFilters(f) {
  let n = 0;
  if (f.listingType) n++;
  if (f.categories.length) n += f.categories.length;
  if (f.minPrice || f.maxPrice) n++;
  if (f.bhk.length) n += f.bhk.length;
  if (f.furnishing.length) n += f.furnishing.length;
  if (f.facing.length) n += f.facing.length;
  if (f.bathrooms.length) n += f.bathrooms.length;
  if (f.amenities.length) n += f.amenities.length;
  if (f.postedWithin !== 'Any time') n++;
  if (f.sortBy !== 'relevance') n++;
  return n;
}

/* ─── small shared ui ────────────────────────────────────────────────────────── */
function SecLabel({ children }) {
  return <Text style={ui.secLabel}>{children}</Text>;
}

function Chip({ label, selected, onPress, color, small }) {
  return (
    <TouchableOpacity
      style={[ui.chip, selected && ui.chipSel, small && ui.chipSm,
      selected && color && { backgroundColor: `${color}18`, borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[ui.chipText, selected && ui.chipSelText, selected && color && { color }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ChipRow({ options, value, onChange, multi, color, small }) {
  const toggle = (opt) => {
    if (multi) onChange(value.includes(opt) ? value.filter((x) => x !== opt) : [...value, opt]);
    else onChange(value === opt ? '' : opt);
  };
  return (
    <View style={ui.chipRow}>
      {options.map((o) => (
        <Chip key={o} label={o} selected={multi ? value.includes(o) : value === o}
          onPress={() => toggle(o)} color={color} small={small} />
      ))}
    </View>
  );
}

/* ─── Budget filter ─────────────────────────────────────────────────────────── */
const BUDGET_PRESETS = [
  { label: 'All', min: '', max: '', icon: 'apps-outline' },
  { label: '< 10k', min: '', max: '10000', icon: 'arrow-down-outline' },
  { label: '10k – 15k', min: '10000', max: '15000', icon: 'remove-outline' },
  { label: '15k – 20k', min: '15000', max: '20000', icon: 'remove-outline' },
  { label: '20k – 30k', min: '20000', max: '30000', icon: 'remove-outline' },
  { label: '30k – 40k', min: '30000', max: '40000', icon: 'remove-outline' },
  { label: '40k +', min: '40000', max: '', icon: 'arrow-up-outline' },
];

/* Visual bar: what % of 40k does a value represent (capped) */
const BAR_MAX = 40000;
function barPct(val) {
  const n = priceNum(val);
  if (!n) return 0;
  return Math.min(n / BAR_MAX, 1);
}

function BudgetFilter({ minPrice, maxPrice, onChangeMin, onChangeMax }) {
  const hasRange = minPrice || maxPrice;
  const minNum = priceNum(minPrice);
  const maxNum = priceNum(maxPrice);

  const activePreset = BUDGET_PRESETS.find(
    (p) => p.min === minPrice && p.max === maxPrice,
  ) ?? null;

  /* visual fill: left edge = minPct, right edge = (1 - maxPct) */
  const minPct = barPct(minPrice);
  const maxPct = maxNum ? barPct(maxPrice) : 1;
  const fillLeft = `${(minPct * 100).toFixed(1)}%`;
  const fillRight = `${((1 - maxPct) * 100).toFixed(1)}%`;

  return (
    <View style={bg.wrap}>

      {/* ── preset grid (2 × 3) ── */}
      <View style={bg.presetGrid}>
        {BUDGET_PRESETS.map((p) => {
          const sel = activePreset?.label === p.label;
          return (
            <TouchableOpacity
              key={p.label}
              style={[bg.presetCell, sel && bg.presetCellSel]}
              onPress={() => { onChangeMin(p.min); onChangeMax(p.max); }}
              activeOpacity={0.78}
            >
              {sel
                ? <Ionicons name="checkmark-circle" size={14} color={ACCENT} />
                : <Ionicons name={p.icon} size={13} color="#94A3B8" />}
              <Text style={[bg.presetText, sel && bg.presetTextSel]}>{p.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── divider ── */}
      <View style={bg.divider} />

      {/* ── custom range label ── */}
      <Text style={bg.orLabel}>Or enter a custom range</Text>

      {/* ── min / max inputs ── */}
      <View style={bg.inputRow}>
        <View style={[bg.inputBox, minPrice && bg.inputBoxActive]}>
          <Text style={bg.inputCurrencyTop}>AED</Text>
          <TextInput
            style={bg.inputField}
            placeholder="Min"
            placeholderTextColor="#CBD5E1"
            value={minPrice}
            onChangeText={onChangeMin}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={bg.inputHint}>Minimum</Text>
        </View>

        <View style={bg.inputConnector}>
          <View style={[bg.connectorLine, hasRange && bg.connectorLineActive]} />
          <Text style={bg.connectorTo}>to</Text>
          <View style={[bg.connectorLine, hasRange && bg.connectorLineActive]} />
        </View>

        <View style={[bg.inputBox, maxPrice && bg.inputBoxActive]}>
          <Text style={bg.inputCurrencyTop}>AED</Text>
          <TextInput
            style={bg.inputField}
            placeholder="Max"
            placeholderTextColor="#CBD5E1"
            value={maxPrice}
            onChangeText={onChangeMax}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={bg.inputHint}>Maximum</Text>
        </View>
      </View>

      {/* ── visual range bar ── */}
      <View style={bg.barWrap}>
        <View style={bg.barTrack}>
          <View style={[bg.barFill, { left: fillLeft, right: fillRight }]} />
          {hasRange && (
            <>
              <View style={[bg.barThumb, { left: fillLeft }]} />
              <View style={[bg.barThumb, { right: fillRight }]} />
            </>
          )}
        </View>
        <View style={bg.barLabels}>
          <Text style={bg.barLabel}>0</Text>
          <Text style={bg.barLabel}>10k</Text>
          <Text style={bg.barLabel}>20k</Text>
          <Text style={bg.barLabel}>30k</Text>
          <Text style={bg.barLabel}>40k+</Text>
        </View>
      </View>

      {/* ── live summary / clear ── */}
      {hasRange ? (
        <View style={bg.summary}>
          <View style={bg.summaryLeft}>
            <Ionicons name="cash-outline" size={15} color={ACCENT} />
            <View>
              <Text style={bg.summaryLabel}>Selected range</Text>
              <Text style={bg.summaryValue}>
                {minNum ? `AED ${minNum.toLocaleString()}` : 'No min'}
                {'  →  '}
                {maxNum ? `AED ${maxNum.toLocaleString()}` : 'No max'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={bg.clearBtn}
            onPress={() => { onChangeMin(''); onChangeMax(''); }}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={13} color={ACCENT} />
            <Text style={bg.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={bg.allPrices}>
          <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
          <Text style={bg.allPricesText}>Showing all price ranges</Text>
        </View>
      )}
    </View>
  );
}

/* ─── VIEW 1: search + filter form ──────────────────────────────────────────── */
function SearchFilterView({ onSearch }) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [showMore, setShowMore] = useState(false);

  const set = (key, val) => setFilters((p) => ({ ...p, [key]: val }));
  const fc = countFilters(filters);
  const topPad = Math.max(insets.top, Platform.OS === 'android' ? 28 : 0);

  /* count active "more" filters (only the hidden ones) */
  const moreActiveCount = useMemo(() => {
    let n = 0;
    if (filters.facing.length) n += filters.facing.length;
    if (filters.amenities.length) n += filters.amenities.length;
    if (filters.postedWithin !== 'Any time') n++;
    if (filters.sortBy !== 'relevance') n++;
    return n;
  }, [filters]);

  const handleSearch = () => onSearch(query.trim(), filters);

  return (
    <View style={s.shell}>
      {/* ── gradient header ── */}
      <View style={[s.header, { paddingTop: topPad + 10 }]}>
        <LinearGradient
          colors={['#1E3A8A', '#1D4ED8', '#2563EB']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.heroRow}>
          <View>
            <Text style={s.heroTitle}>Find your home</Text>
            <Text style={s.heroSub}>Search across {ALL_LISTINGS.length} active listings</Text>
          </View>
          <View style={s.heroBadge}>
            <Ionicons name="home-outline" size={16} color="rgba(255,255,255,0.85)" />
          </View>
        </View>

        {/* search bar */}
        <View style={s.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            ref={inputRef}
            style={s.searchInput}
            placeholder="Location, area, property name…"
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} activeOpacity={0.7} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
          <View style={s.searchDiv} />
          <TouchableOpacity style={s.micBtn} activeOpacity={0.8}>
            <Ionicons name="mic-outline" size={18} color={ACCENT} />
          </TouchableOpacity>
        </View>

        {/* filter tally */}
        {fc > 0 && (
          <View style={s.filterTally}>
            <Ionicons name="funnel" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={s.filterTallyText}>{fc} filter{fc > 1 ? 's' : ''} active</Text>
            <TouchableOpacity onPress={() => setFilters({ ...DEFAULT_FILTERS })} activeOpacity={0.8}>
              <Text style={s.filterTallyReset}>Reset all</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── scrollable filter form ── */}
      <ScrollView
        style={s.formScroll}
        contentContainerStyle={[s.formContent, { paddingBottom: 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── TOP 5 FILTERS ─────────────────────────────── */}

        {/* 1. LISTING TYPE */}
        <View style={s.section}>
          <View style={s.secRow}>
            <View style={[s.secDot, { backgroundColor: ACCENT }]} />
            <SecLabel>Looking to</SecLabel>
          </View>
          {/* "All" is default = empty string */}
          <ChipRow
            options={['All', 'Rent', 'Buy']}
            value={filters.listingType === '' ? 'All' : filters.listingType}
            onChange={(v) => set('listingType', v === 'All' ? '' : v)}
            color={ACCENT}
          />
        </View>

        {/* 2. PROPERTY TYPE */}
        <View style={s.section}>
          <View style={s.secRow}>
            <View style={[s.secDot, { backgroundColor: '#8B5CF6' }]} />
            <SecLabel>Property type</SecLabel>
            {filters.categories.length === 0 && (
              <Text style={s.secDefault}>All selected</Text>
            )}
          </View>
          <View style={s.typeGrid}>
            {PROPERTY_TYPES.map((pt) => {
              const sel = filters.categories.includes(pt.id);
              return (
                <TouchableOpacity
                  key={pt.id}
                  style={[s.typeCell, sel && s.typeCellSel, sel && { borderColor: pt.color }]}
                  onPress={() =>
                    set('categories', sel
                      ? filters.categories.filter((x) => x !== pt.id)
                      : [...filters.categories, pt.id])
                  }
                  activeOpacity={0.75}
                >
                  <View style={[s.typeIcon, { backgroundColor: `${pt.color}18` }]}>
                    <Ionicons name={pt.icon} size={20} color={pt.color} />
                  </View>
                  <Text style={[s.typeLabel, sel && { color: pt.color, fontWeight: '700' }]}>
                    {pt.label}
                  </Text>
                  {sel && (
                    <View style={[s.typeTick, { backgroundColor: pt.color }]}>
                      <Ionicons name="checkmark" size={9} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {filters.categories.length > 0 && (
            <TouchableOpacity onPress={() => set('categories', [])} style={s.clearSec} activeOpacity={0.8}>
              <Ionicons name="close-circle-outline" size={14} color="#94A3B8" />
              <Text style={s.clearSecText}>Clear selection (show all)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 3. BUDGET */}
        <View style={s.section}>
          <View style={s.secRow}>
            <View style={[s.secDot, { backgroundColor: '#22C55E' }]} />
            <SecLabel>Budget (AED / month)</SecLabel>
            {!filters.minPrice && !filters.maxPrice && (
              <Text style={s.secDefault}>All prices</Text>
            )}
          </View>
          <BudgetFilter
            minPrice={filters.minPrice}
            maxPrice={filters.maxPrice}
            onChangeMin={(v) => set('minPrice', v)}
            onChangeMax={(v) => set('maxPrice', v)}
          />
        </View>

        {/* 4. BHK */}
        <View style={s.section}>
          <View style={s.secRow}>
            <View style={[s.secDot, { backgroundColor: '#F59E0B' }]} />
            <SecLabel>BHK / Configuration</SecLabel>
            {filters.bhk.length === 0 && (
              <Text style={s.secDefault}>All</Text>
            )}
          </View>
          <ChipRow options={BHK_OPTIONS} value={filters.bhk} multi
            onChange={(v) => set('bhk', v)} color={ACCENT} />
        </View>

        {/* 5. FURNISHING */}
        <View style={s.section}>
          <View style={s.secRow}>
            <View style={[s.secDot, { backgroundColor: '#8B5CF6' }]} />
            <SecLabel>Furnishing</SecLabel>
            {filters.furnishing.length === 0 && <Text style={s.secDefault}>All</Text>}
          </View>
          <ChipRow options={FURNISH_OPTIONS} value={filters.furnishing} multi
            onChange={(v) => set('furnishing', v)} color="#8B5CF6" />
        </View>

        {/* 6. BATHROOMS */}
        <View style={s.section}>
          <View style={s.secRow}>
            <View style={[s.secDot, { backgroundColor: '#06B6D4' }]} />
            <SecLabel>Bathrooms</SecLabel>
            {filters.bathrooms.length === 0 && <Text style={s.secDefault}>All</Text>}
          </View>
          <ChipRow options={BATH_OPTIONS} value={filters.bathrooms} multi small
            onChange={(v) => set('bathrooms', v)} color="#06B6D4" />
        </View>

        {/* ── SHOW MORE TOGGLE ──────────────────────────── */}
        <TouchableOpacity
          style={[s.showMoreBtn, showMore && s.showMoreBtnOpen]}
          onPress={() => setShowMore((x) => !x)}
          activeOpacity={0.82}
        >
          <Ionicons
            name={showMore ? 'chevron-up' : 'chevron-down'}
            size={17}
            color={showMore ? ACCENT : TEXT.secondary}
          />
          <Text style={[s.showMoreText, showMore && { color: ACCENT }]}>
            {showMore ? 'Show fewer filters' : 'Show more filters'}
          </Text>
          {moreActiveCount > 0 && (
            <View style={s.showMoreBadge}>
              <Text style={s.showMoreBadgeText}>{moreActiveCount} active</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── EXPANDED FILTERS ──────────────────────────── */}
        {showMore && (
          <>
            {/* FACING */}
            <View style={s.section}>
              <View style={s.secRow}>
                <View style={[s.secDot, { backgroundColor: '#F59E0B' }]} />
                <SecLabel>Facing</SecLabel>
                {filters.facing.length === 0 && <Text style={s.secDefault}>All</Text>}
              </View>
              <ChipRow options={FACING_OPTIONS} value={filters.facing} multi small
                onChange={(v) => set('facing', v)} color="#F59E0B" />
            </View>

            {/* AMENITIES */}
            <View style={s.section}>
              <View style={s.secRow}>
                <View style={[s.secDot, { backgroundColor: '#22C55E' }]} />
                <SecLabel>Amenities</SecLabel>
                {filters.amenities.length === 0 && <Text style={s.secDefault}>Any</Text>}
              </View>
              <View style={s.amenGrid}>
                {AMENITY_OPTIONS.map((a) => {
                  const sel = filters.amenities.includes(a.id);
                  return (
                    <TouchableOpacity
                      key={a.id}
                      style={[s.amenCell, sel && s.amenCellSel]}
                      onPress={() =>
                        set('amenities', sel
                          ? filters.amenities.filter((x) => x !== a.id)
                          : [...filters.amenities, a.id])
                      }
                      activeOpacity={0.75}
                    >
                      <Ionicons name={a.icon} size={17} color={sel ? ACCENT : '#94A3B8'} />
                      <Text style={[s.amenLabel, sel && { color: ACCENT, fontWeight: '700' }]}>{a.label}</Text>
                      {sel && (
                        <View style={s.amenCheck}><Ionicons name="checkmark" size={9} color="#fff" /></View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* POSTED WITHIN */}
            <View style={s.section}>
              <View style={s.secRow}>
                <View style={[s.secDot, { backgroundColor: '#EF4444' }]} />
                <SecLabel>Posted within</SecLabel>
              </View>
              <ChipRow options={POSTED_OPTIONS} value={filters.postedWithin} small
                onChange={(v) => set('postedWithin', v)} />
            </View>

            {/* SORT BY */}
            <View style={[s.section, { borderBottomWidth: 0 }]}>
              <View style={s.secRow}>
                <View style={[s.secDot, { backgroundColor: '#06B6D4' }]} />
                <SecLabel>Sort results by</SecLabel>
              </View>
              <View style={s.sortList}>
                {SORT_OPTIONS.map((so) => {
                  const sel = filters.sortBy === so.id;
                  return (
                    <TouchableOpacity
                      key={so.id}
                      style={[s.sortRow, sel && s.sortRowSel]}
                      onPress={() => set('sortBy', so.id)}
                      activeOpacity={0.78}
                    >
                      <View style={[s.sortIconWrap, sel && s.sortIconWrapSel]}>
                        <Ionicons name={so.icon} size={17} color={sel ? ACCENT : '#94A3B8'} />
                      </View>
                      <Text style={[s.sortLabel, sel && { color: ACCENT, fontWeight: '700' }]}>{so.label}</Text>
                      {sel
                        ? <Ionicons name="checkmark-circle" size={19} color={ACCENT} />
                        : <Ionicons name="radio-button-off" size={19} color="#CBD5E1" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* ── Apply CTA ── */}
      <View style={s.cta}>
        <View style={s.ctaInner}>
          <TouchableOpacity
            style={[s.ctaReset, !fc && s.ctaResetDim]}
            onPress={() => setFilters({ ...DEFAULT_FILTERS })}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={15} color={fc ? TEXT.secondary : '#CBD5E1'} />
            <Text style={[s.ctaResetText, !fc && { color: '#CBD5E1' }]}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.ctaBtn} onPress={handleSearch} activeOpacity={0.88}>
            <LinearGradient
              colors={[ACCENT_LIGHT, ACCENT, ACCENT_DARK]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.ctaGrad}
            >
              <Ionicons name="search" size={18} color="#fff" />
              <Text style={s.ctaText}>Apply & Search</Text>
              {fc > 0 && (
                <View style={s.ctaBadge}>
                  <Text style={s.ctaBadgeText}>{fc}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {/* spacer clears the tab bar */}
        <View style={{ height: Math.max(insets.bottom + 98, 108) }} />
      </View>
    </View>
  );
}

/* ─── VIEW 2: results list ───────────────────────────────────────────────────── */
function SearchResultsView({ query, filters, onBack, onEditFilters }) {
  const insets = useSafeAreaInsets();
  const [detail, setDetail] = useState(null);

  const results = useMemo(() => {
    let pool = ALL_LISTINGS;
    if (query) {
      const q = query.toLowerCase();
      pool = pool.filter(
        (p) => p.title.toLowerCase().includes(q) || (p.area ?? '').toLowerCase().includes(q),
      );
    }
    if (filters.categories.length)
      pool = pool.filter((p) => filters.categories.includes(p.categoryId));
    const mn = priceNum(filters.minPrice);
    const mx = priceNum(filters.maxPrice);
    if (mn) pool = pool.filter((p) => priceNum(p.price) >= mn);
    if (mx) pool = pool.filter((p) => priceNum(p.price) <= mx);
    if (filters.bhk.length) {
      pool = pool.filter((p) => {
        const b = p.bhk ?? '';
        return filters.bhk.some((opt) => {
          if (opt === 'Studio') return b === '0' || b === '';
          if (opt.includes('4+')) return parseInt(b, 10) >= 4;
          return b === (opt.match(/\d+/)?.[0] ?? '');
        });
      });
    }
    if (filters.sortBy === 'price_asc') pool = [...pool].sort((a, b) => priceNum(a.price) - priceNum(b.price));
    if (filters.sortBy === 'price_desc') pool = [...pool].sort((a, b) => priceNum(b.price) - priceNum(a.price));
    if (filters.sortBy === 'newest') pool = [...pool].reverse();
    return pool;
  }, [query, filters]);

  const fc = countFilters(filters);
  const topPad = Math.max(insets.top, Platform.OS === 'android' ? 28 : 0);

  /* show detail */
  if (detail) {
    const pt = PROPERTY_TYPES.find((t) => t.id === detail.categoryId) ?? PROPERTY_TYPES[0];
    return (
      <PropertyDetailScreen
        property={detail}
        category={{ id: detail.categoryId, label: pt.label }}
        onBack={() => setDetail(null)}
      />
    );
  }

  return (
    <View style={s.shell}>
      {/* header */}
      <View style={[res.header, { paddingTop: topPad + 8 }]}>
        <LinearGradient
          colors={['#1E3A8A', '#1D4ED8', '#2563EB']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={res.topRow}>
          <TouchableOpacity style={res.backBtn} onPress={onBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={res.titleBlock}>
            <Text style={res.title}>{results.length} Properties</Text>
            <Text style={res.sub} numberOfLines={1}>
              {query || (filters.categories.length
                ? filters.categories.map((id) => PROPERTY_TYPES.find((p) => p.id === id)?.label ?? id).join(', ')
                : 'All categories')}
            </Text>
          </View>
          <TouchableOpacity style={res.filterBtn} onPress={onEditFilters} activeOpacity={0.82}>
            <Ionicons name="options-outline" size={19} color="#fff" />
            {fc > 0 && <View style={res.filterDot} />}
          </TouchableOpacity>
        </View>

        {/* active category chips */}
        {filters.categories.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={res.chipStrip} contentContainerStyle={res.chipStripContent}>
            {filters.categories.map((id) => {
              const pt = PROPERTY_TYPES.find((p) => p.id === id);
              return (
                <View key={id} style={[res.activeChip, { borderColor: pt?.color ?? ACCENT, backgroundColor: `${pt?.color ?? ACCENT}22` }]}>
                  <Ionicons name={pt?.icon ?? 'home-outline'} size={12} color={pt?.color ?? ACCENT} />
                  <Text style={[res.activeChipText, { color: pt?.color ?? ACCENT }]}>{pt?.label ?? id}</Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* list */}
      {results.length === 0 ? (
        <View style={res.empty}>
          <View style={res.emptyIcon}>
            <Ionicons name="search-outline" size={34} color="#94A3B8" />
          </View>
          <Text style={res.emptyTitle}>No properties found</Text>
          <Text style={res.emptySub}>Try adjusting your filters or search term.</Text>
          <TouchableOpacity style={res.emptyBtn} onPress={onEditFilters} activeOpacity={0.8}>
            <Text style={res.emptyBtnText}>Edit filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={res.cardWrap}>
              <PropertyCard property={item} onPress={() => setDetail(item)} variant="listing" />
            </View>
          )}
          contentContainerStyle={[res.listContent, { paddingBottom: insets.bottom + 110 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={res.listHeader}>
              <Text style={res.resultMeta}>
                Showing <Text style={{ color: ACCENT, fontWeight: '600' }}>{results.length}</Text> result{results.length !== 1 ? 's' : ''}
                {fc > 0 ? ` · ${fc} filter${fc > 1 ? 's' : ''} active` : ''}
              </Text>
              <TouchableOpacity onPress={onEditFilters} activeOpacity={0.8}>
                <Text style={res.editFiltersText}>Edit filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

/* ─── root: manages which view is active ─────────────────────────────────────── */
export function SearchScreen() {
  const [view, setView] = useState('search'); // 'search' | 'results'
  const [appliedQuery, setAppliedQuery] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ ...DEFAULT_FILTERS });

  const handleSearch = (q, f) => {
    setAppliedQuery(q);
    setAppliedFilters(f);
    setView('results');
  };

  if (view === 'results') {
    return (
      <SearchResultsView
        query={appliedQuery}
        filters={appliedFilters}
        onBack={() => setView('search')}
        onEditFilters={() => setView('search')}
      />
    );
  }

  return <SearchFilterView onSearch={handleSearch} />;
}

/* ─── styles: shared shell ───────────────────────────────────────────────────── */
const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: '#F1F5F9' },

  /* header */
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: 'hidden',
    zIndex: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 16, paddingVertical: 16 },
  heroTitle: { fontSize: 24, fontWeight: '600', color: '#fff', letterSpacing: -0.4 },
  heroSub: { fontSize: 12.5, color: 'rgba(255,255,255,0.65)', marginTop: 3, fontWeight: '500' },
  heroBadge: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },

  /* search bar */
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 12, height: 50,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  searchInput: { flex: 1, fontSize: 14.5, color: TEXT.primary, fontWeight: '500' },
  searchDiv: { width: 1, height: 22, backgroundColor: '#E2E8F0', marginHorizontal: 8 },
  micBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: ACCENT_MUTED,
    alignItems: 'center', justifyContent: 'center',
  },
  filterTally: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10,
  },
  filterTallyText: { fontSize: 12.5, color: 'rgba(255,255,255,0.8)', fontWeight: '600', flex: 1 },
  filterTallyReset: { fontSize: 12.5, color: '#FCD34D', fontWeight: '700' },

  /* form scroll */
  formScroll: { flex: 1 },
  formContent: { paddingTop: 6 },
  section: {
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 6,
    borderBottomWidth: 1, borderBottomColor: '#E8EEF4',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  secRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12,
  },
  secDot: {
    width: 4, height: 18, borderRadius: 2,
  },
  secDefault: {
    marginLeft: 'auto', fontSize: 11.5, fontWeight: '600',
    color: '#94A3B8', backgroundColor: '#F1F5F9',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  clearSec: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginBottom: 10, alignSelf: 'flex-start',
  },
  clearSecText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

  /* show more */
  showMoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', marginBottom: 8,
    borderTopWidth: 1, borderTopColor: '#E8EEF4',
  },
  showMoreBtnOpen: { borderBottomWidth: 1, borderBottomColor: '#E8EEF4' },
  showMoreText: { flex: 1, fontSize: 14, fontWeight: '700', color: TEXT.secondary },
  showMoreBadge: {
    backgroundColor: ACCENT, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  showMoreBadgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },

  /* budget improved */
  budgetPresets: { gap: 8, paddingBottom: 12 },
  budgetPresetChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  budgetPresetChipSel: { borderColor: ACCENT, backgroundColor: '#EFF6FF' },
  budgetPresetText: { fontSize: 13, fontWeight: '600', color: TEXT.secondary },
  budgetPresetTextSel: { color: ACCENT, fontWeight: '600' },
  budgetInputRow: { flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: 10 },
  budgetInputBox: {
    flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E2E8F0',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  budgetInputBoxActive: { borderColor: ACCENT, backgroundColor: '#EFF6FF' },
  budgetInputLbl: {
    fontSize: 9.5, fontWeight: '600', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3,
  },
  budgetInputField: { fontSize: 18, fontWeight: '600', color: TEXT.primary, padding: 0 },
  budgetCurrency: { fontSize: 11, fontWeight: '700', color: '#94A3B8', marginTop: 2 },
  budgetRangeLine: {
    width: 40, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  budgetRangeTrack: { width: 24, height: 2, backgroundColor: '#E2E8F0', borderRadius: 1 },
  budgetRangeTrackActive: { backgroundColor: ACCENT },
  budgetRangeDot: {
    position: 'absolute',
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E2E8F0',
  },
  budgetRangeDotActive: { backgroundColor: ACCENT },
  budgetSummary: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EFF6FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 8, borderWidth: 1, borderColor: '#BFDBFE',
  },
  budgetSummaryText: { flex: 1, fontSize: 13, fontWeight: '700', color: ACCENT },

  /* type grid */
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  typeCell: {
    width: '22%', alignItems: 'center', paddingVertical: 12,
    borderRadius: 14, backgroundColor: '#F8FAFC',
    borderWidth: 1.5, borderColor: '#E2E8F0', gap: 6, position: 'relative',
  },
  typeCellSel: { backgroundColor: '#EFF6FF' },
  typeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  typeLabel: { fontSize: 10.5, fontWeight: '600', color: TEXT.secondary, textAlign: 'center' },
  typeTick: {
    position: 'absolute', top: -6, right: -6,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },

  /* amenities */
  amenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  amenCell: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 11, paddingVertical: 8,
    backgroundColor: '#F8FAFC', borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E2E8F0', position: 'relative',
  },
  amenCellSel: { borderColor: ACCENT, backgroundColor: '#EFF6FF' },
  amenLabel: { fontSize: 12.5, fontWeight: '600', color: TEXT.secondary },
  amenCheck: {
    position: 'absolute', top: -5, right: -5,
    width: 16, height: 16, borderRadius: 8, backgroundColor: ACCENT,
    alignItems: 'center', justifyContent: 'center',
  },

  /* sort */
  sortList: { gap: 8, marginBottom: 12 },
  sortRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    backgroundColor: '#F8FAFC', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  sortRowSel: { borderColor: ACCENT, backgroundColor: '#EFF6FF' },
  sortIconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center',
  },
  sortIconWrapSel: { backgroundColor: ACCENT_MUTED },
  sortLabel: { flex: 1, fontSize: 14, color: TEXT.primary, fontWeight: '500' },

  /* CTA */
  cta: {
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.07, shadowRadius: 10 },
      android: { elevation: 12 },
    }),
  },
  ctaInner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
  },
  ctaReset: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 16, paddingVertical: 13,
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  ctaResetText: { fontSize: 13, fontWeight: '700', color: TEXT.secondary },
  ctaResetDim: { borderColor: '#F1F5F9', backgroundColor: '#FAFAFA' },
  ctaBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8,
  },
  ctaText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.1 },
  ctaBadge: {
    minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff' },
});

/* results page styles */
const res = StyleSheet.create({
  header: {
    paddingHorizontal: 16, paddingBottom: 12,
    overflow: 'hidden', zIndex: 10,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 12 },
      android: { elevation: 10 },
    }),
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  titleBlock: { flex: 1 },
  title: { fontSize: 20, fontWeight: '600', color: '#fff', letterSpacing: -0.3 },
  sub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: '500' },
  filterBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  filterDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#FCD34D',
  },
  chipStrip: { marginTop: 8 },
  chipStripContent: { gap: 8, paddingBottom: 2 },
  activeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1.5,
  },
  activeChipText: { fontSize: 12, fontWeight: '700' },

  listContent: { paddingHorizontal: 16, paddingTop: 8 },
  listHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10,
  },
  resultMeta: { fontSize: 13, color: TEXT.secondary, fontWeight: '500' },
  editFiltersText: { fontSize: 13, fontWeight: '700', color: ACCENT },
  cardWrap: { marginBottom: 14 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#F1F5F9',
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: TEXT.primary, marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 13.5, color: TEXT.secondary, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 20, backgroundColor: ACCENT_MUTED, borderRadius: 12,
    paddingHorizontal: 22, paddingVertical: 11,
    borderWidth: 1.5, borderColor: ACCENT,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: ACCENT },
});

/* ─── budget stylesheet ─────────────────────────────────────────────────────── */
const bg = StyleSheet.create({
  wrap: { paddingBottom: 8 },

  /* preset grid 2×3 */
  presetGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16,
  },
  presetCell: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 13, paddingVertical: 9,
    borderRadius: 22, borderWidth: 1.5, borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC', minWidth: '30%', flexShrink: 0,
  },
  presetCellSel: {
    borderColor: ACCENT, backgroundColor: '#EFF6FF',
  },
  presetText: { fontSize: 13, fontWeight: '600', color: TEXT.secondary },
  presetTextSel: { color: ACCENT, fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 14 },
  orLabel: {
    fontSize: 11, fontWeight: '700', color: '#94A3B8',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },

  /* inputs */
  inputRow: { flexDirection: 'row', alignItems: 'stretch', gap: 0, marginBottom: 16 },
  inputBox: {
    flex: 1, backgroundColor: '#F8FAFC',
    borderWidth: 1.5, borderColor: '#E2E8F0',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    justifyContent: 'space-between',
  },
  inputBoxActive: { borderColor: ACCENT, backgroundColor: '#EFF6FF' },
  inputCurrencyTop: {
    fontSize: 10, fontWeight: '600', color: '#94A3B8',
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4,
  },
  inputField: {
    fontSize: 22, fontWeight: '600', color: TEXT.primary, padding: 0,
    minHeight: 32,
  },
  inputHint: { fontSize: 10.5, color: '#CBD5E1', fontWeight: '500', marginTop: 4 },
  inputConnector: {
    width: 36, alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  connectorLine: { flex: 1, width: 1.5, backgroundColor: '#E2E8F0', maxHeight: 18 },
  connectorLineActive: { backgroundColor: ACCENT },
  connectorTo: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },

  /* range bar */
  barWrap: { marginBottom: 14 },
  barTrack: {
    height: 6, backgroundColor: '#E2E8F0', borderRadius: 3,
    marginHorizontal: 2, position: 'relative', overflow: 'visible',
  },
  barFill: {
    position: 'absolute', top: 0, bottom: 0,
    backgroundColor: ACCENT, borderRadius: 3,
  },
  barThumb: {
    position: 'absolute', top: -5,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: ACCENT, borderWidth: 3, borderColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: ACCENT, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
    marginLeft: -8,
  },
  barLabels: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 8,
  },
  barLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '500' },

  /* summary */
  summary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryLabel: { fontSize: 10.5, fontWeight: '600', color: '#64748B', marginBottom: 1 },
  summaryValue: { fontSize: 13.5, fontWeight: '600', color: ACCENT },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1.5, borderColor: ACCENT,
  },
  clearText: { fontSize: 12, fontWeight: '700', color: ACCENT },

  allPrices: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  allPricesText: { fontSize: 12.5, fontWeight: '600', color: '#16A34A' },
});

/* shared chip styles */
const ui = StyleSheet.create({
  secLabel: {
    fontSize: 11.5, fontWeight: '600', color: TEXT.secondary,
    textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC',
  },
  chipSel: { borderColor: ACCENT, backgroundColor: '#EFF6FF' },
  chipSm: { paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontSize: 13, fontWeight: '600', color: TEXT.secondary },
  chipSelText: { color: ACCENT, fontWeight: '700' },
});
