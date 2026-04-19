import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  ACCENT,
  ACCENT_DARK,
  ACCENT_LIGHT,
  BORDER_SUBTLE,
  SURFACE,
  TEXT,
} from '../theme/colors';

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const TOTAL_STEPS = 5;
const ACCENT_MUTED = '#EFF6FF';
const SUCCESS = '#16A34A';

const STEP_META = [
  { label: 'Listing', icon: 'home-outline' },
  { label: 'Contact', icon: 'person-outline' },
  { label: 'Details', icon: 'document-text-outline' },
  { label: 'Media', icon: 'images-outline' },
  { label: 'Plan', icon: 'card-outline' },
];

const PROPERTY_TYPES = [
  { id: 'flat', label: 'Flat / Apartment', icon: 'business-outline', color: '#3B82F6' },
  { id: 'shop', label: 'Shop / Showroom', icon: 'storefront-outline', color: '#F59E0B' },
  { id: 'office', label: 'Office Space', icon: 'briefcase-outline', color: '#8B5CF6' },
  { id: 'pg', label: 'PG / Hostel', icon: 'bed-outline', color: '#EC4899' },
  { id: 'parking', label: 'Parking Spot', icon: 'car-outline', color: '#EF4444' },
  { id: 'warehouse', label: 'Warehouse', icon: 'cube-outline', color: '#06B6D4' },
  { id: 'sharing', label: 'Room Sharing', icon: 'people-outline', color: '#22C55E' },
  { id: 'plot', label: 'Plot / Land', icon: 'map-outline', color: '#F97316' },
];

const AMENITIES = [
  { id: 'lift', label: 'Lift', icon: 'arrow-up-circle-outline' },
  { id: 'power', label: 'Power Backup', icon: 'flash-outline' },
  { id: 'bike_parking', label: 'Bike Parking', icon: 'bicycle-outline' },
  { id: 'car_parking', label: 'Car Parking', icon: 'car-outline' },
  { id: 'cctv', label: 'CCTV', icon: 'videocam-outline' },
  { id: 'security', label: 'Security', icon: 'shield-checkmark-outline' },
  { id: 'fire', label: 'Fire Safety', icon: 'flame-outline' },
  { id: 'gym', label: 'Gym', icon: 'barbell-outline' },
  { id: 'pool', label: 'Swimming Pool', icon: 'water-outline' },
  { id: 'garden', label: 'Garden', icon: 'leaf-outline' },
];

const PLANS = [
  {
    id: '1m',
    title: '1 Month',
    price: '₹99',
    per: '/month',
    tag: null,
    features: ['Listed on Al-Bayt app', 'Basic visibility', 'Buyer enquiries'],
    accent: false,
  },
  {
    id: '3m',
    title: '3 Months',
    price: '₹199',
    per: '/3 months',
    tag: 'Most Popular',
    features: ['All Basic features', 'Priority listing', 'Analytics dashboard'],
    accent: true,
  },
  {
    id: '6m',
    title: '6 Months',
    price: '₹499',
    per: '/6 months',
    tag: 'Best Value',
    features: ['All Pro features', 'Top of search results', 'Verified badge'],
    accent: false,
  },
];

/* ─── Step Progress Bar ─────────────────────────────────────────────────────── */
function ProgressBar({ step }) {
  const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;
  return (
    <View style={pb.wrap}>
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${pct}%` }]} />
        {STEP_META.map((s, i) => {
          const done = i + 1 < step;
          const active = i + 1 === step;
          return (
            <View key={i} style={[pb.dot, { left: `${(i / (TOTAL_STEPS - 1)) * 100}%` }, (done || active) && pb.dotActive, done && pb.dotDone]}>
              {done
                ? <Ionicons name="checkmark" size={10} color="#fff" />
                : <Text style={[pb.dotNum, active && pb.dotNumActive]}>{i + 1}</Text>}
            </View>
          );
        })}
      </View>
      <View style={pb.labels}>
        {STEP_META.map((s, i) => (
          <Text key={i} style={[pb.label, i + 1 === step && pb.labelActive]} numberOfLines={1}>
            {s.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const pb = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, backgroundColor: '#fff' },
  track: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginHorizontal: 10,
    marginBottom: 10,
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: ACCENT,
    borderRadius: 2,
  },
  dot: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E2E8F0',
    top: -9,
    marginLeft: -11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  dotActive: { backgroundColor: ACCENT },
  dotDone: { backgroundColor: SUCCESS },
  dotNum: { fontSize: 10, fontWeight: '700', color: '#94A3B8' },
  dotNumActive: { color: '#fff' },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: { fontSize: 10.5, color: '#94A3B8', fontWeight: '500', flex: 1, textAlign: 'center' },
  labelActive: { color: ACCENT, fontWeight: '700' },
});

/* ─── Reusable primitives ───────────────────────────────────────────────────── */
function Section({ title, subtitle, children, last }) {
  return (
    <View style={[sec.wrap, !last && sec.border]}>
      {title && (
        <View style={sec.head}>
          <Text style={sec.title}>{title}</Text>
          {subtitle && <Text style={sec.sub}>{subtitle}</Text>}
        </View>
      )}
      {children}
    </View>
  );
}

const sec = StyleSheet.create({
  wrap: { paddingVertical: 22, paddingHorizontal: 20 },
  border: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  head: { marginBottom: 16 },
  title: { fontSize: 15, fontWeight: '700', color: TEXT.primary, letterSpacing: -0.2 },
  sub: { fontSize: 12.5, color: '#64748B', marginTop: 3, lineHeight: 17 },
});

function Label({ text, required }) {
  return (
    <Text style={lbl.text}>
      {text}
      {required && <Text style={{ color: '#EF4444' }}> *</Text>}
    </Text>
  );
}
const lbl = StyleSheet.create({
  text: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
});

function Field({ label, required, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label && <Label text={label} required={required} />}
      <TextInput
        style={[fld.input, focused && fld.focused, props.multiline && fld.area]}
        placeholderTextColor="#9CA3AF"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textAlignVertical={props.multiline ? 'top' : 'center'}
        {...props}
      />
    </View>
  );
}
const fld = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: TEXT.primary,
    backgroundColor: '#FAFAFA',
    fontWeight: '500',
  },
  focused: { borderColor: ACCENT, backgroundColor: '#fff' },
  area: { minHeight: 96, paddingTop: 13 },
});

function Chips({ options, value, onChange, multi }) {
  const isSelected = (v) => (multi ? (value || []).includes(v) : value === v);
  const toggle = (v) => {
    if (multi) {
      const arr = value || [];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v === value ? '' : v);
    }
  };
  return (
    <View style={ch.row}>
      {options.map((opt) => {
        const sel = isSelected(typeof opt === 'object' ? opt.value : opt);
        const val = typeof opt === 'object' ? opt.value : opt;
        const label = typeof opt === 'object' ? opt.label : opt;
        return (
          <TouchableOpacity
            key={val}
            style={[ch.chip, sel && ch.chipSel]}
            onPress={() => toggle(val)}
            activeOpacity={0.75}
          >
            <Text style={[ch.label, sel && ch.labelSel]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const ch = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  chipSel: { backgroundColor: ACCENT, borderColor: ACCENT },
  label: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  labelSel: { color: '#fff' },
});

function RowFields({ children }) {
  return <View style={{ flexDirection: 'row', gap: 12 }}>{children}</View>;
}

/* ─── Step 1 ────────────────────────────────────────────────────────────────── */
function Step1({ role, setRole, listingType, setListingType, propertyType, setPropertyType }) {
  return (
    <View>
      <Section title="Your Role" subtitle="Select how you are associated with this property">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[
            { id: 'Owner', icon: 'home', desc: 'I own this property' },
            { id: 'Broker', icon: 'briefcase', desc: 'I am an agent/broker' },
          ].map((r) => {
            const sel = role === r.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => setRole(r.id)}
                activeOpacity={0.8}
                style={[s1.roleCard, sel && s1.roleCardSel]}
              >
                <View style={[s1.roleIcon, sel && s1.roleIconSel]}>
                  <Ionicons name={r.icon} size={24} color={sel ? '#fff' : ACCENT} />
                </View>
                <Text style={[s1.roleTitle, sel && s1.roleTitleSel]}>{r.id}</Text>
                <Text style={[s1.roleDesc, sel && s1.roleDescSel]}>{r.desc}</Text>
                {sel && (
                  <View style={s1.checkBadge}>
                    <Ionicons name="checkmark" size={11} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title="Listing Purpose" subtitle="What do you want to do with this property?">
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {[
            { id: 'Sell', icon: 'pricetag', color: '#16A34A', bg: '#F0FDF4', desc: 'Transfer ownership' },
            { id: 'Rent', icon: 'key', color: ACCENT, bg: ACCENT_MUTED, desc: 'Monthly rental' },
          ].map((t) => {
            const sel = listingType === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setListingType(t.id)}
                activeOpacity={0.8}
                style={[s1.typeCard, sel && { borderColor: t.color, backgroundColor: t.bg }]}
              >
                <View style={[s1.typeIcon, sel && { backgroundColor: t.color }]}>
                  <Ionicons name={t.icon} size={20} color={sel ? '#fff' : '#64748B'} />
                </View>
                <Text style={[s1.typeTitle, sel && { color: t.color }]}>{t.id}</Text>
                <Text style={s1.typeDesc}>{t.desc}</Text>
                {sel && (
                  <View style={[s1.typeCheck, { backgroundColor: t.color }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title="Property Category" subtitle="Select the type that best describes your property" last>
        <View style={s1.typeGrid}>
          {PROPERTY_TYPES.map((pt) => {
            const sel = propertyType === pt.id;
            return (
              <TouchableOpacity
                key={pt.id}
                onPress={() => setPropertyType(pt.id)}
                activeOpacity={0.8}
                style={[s1.ptCell, sel && s1.ptCellSel]}
              >
                <View style={[s1.ptIcon, { backgroundColor: sel ? pt.color : `${pt.color}18` }]}>
                  <Ionicons name={pt.icon} size={20} color={sel ? '#fff' : pt.color} />
                </View>
                <Text style={[s1.ptLabel, sel && s1.ptLabelSel]} numberOfLines={2}>
                  {pt.label}
                </Text>
                {sel && (
                  <View style={[s1.ptCheck, { backgroundColor: pt.color }]}>
                    <Ionicons name="checkmark" size={9} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>
    </View>
  );
}

const s1 = StyleSheet.create({
  roleCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  roleCardSel: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_MUTED,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  roleIconSel: { backgroundColor: ACCENT },
  roleTitle: { fontSize: 15, fontWeight: '700', color: TEXT.primary, marginBottom: 3 },
  roleTitleSel: { color: ACCENT },
  roleDesc: { fontSize: 11.5, color: '#64748B', textAlign: 'center' },
  roleDescSel: { color: '#3B82F6' },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCard: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  typeTitle: { fontSize: 18, fontWeight: '800', color: TEXT.primary, marginBottom: 2 },
  typeDesc: { fontSize: 12, color: '#64748B' },
  typeCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ptCell: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  ptCellSel: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_MUTED,
  },
  ptIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ptLabel: { fontSize: 12.5, fontWeight: '600', color: '#374151', flex: 1, lineHeight: 17 },
  ptLabelSel: { color: ACCENT },
  ptCheck: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
});

/* ─── Step 2 ────────────────────────────────────────────────────────────────── */
function Step2({ ownerName, setOwnerName, mobile, setMobile, whatsapp, setWhatsapp, email, setEmail, currentAddress, setCurrentAddress }) {
  return (
    <View>
      <Section title="Personal Information" subtitle="This contact info will be shared with interested parties">
        <Field label="Full Name" required placeholder="e.g. Rahul Sharma" value={ownerName} onChangeText={setOwnerName} />
        <RowFields>
          <View style={{ flex: 1 }}>
            <Field label="Mobile Number" required placeholder="98765 43210" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" style={{ marginBottom: 0 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="WhatsApp Number" placeholder="Same as mobile" value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" style={{ marginBottom: 0 }} />
          </View>
        </RowFields>
      </Section>
      <Section title="Additional Contact" last>
        <Field label="Email Address" placeholder="rahul@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Field label="Current Address" placeholder="Your current residential or office address" value={currentAddress} onChangeText={setCurrentAddress} multiline style={{ marginBottom: 0 }} />
      </Section>
    </View>
  );
}

/* ─── Step 3 ────────────────────────────────────────────────────────────────── */
function Step3(props) {
  const {
    fullAddress, setFullAddress, locality, setLocality,
    bhk, setBhk, facing, setFacing, propertyFloor, setPropertyFloor,
    totalFloors, setTotalFloors, furnishing, setFurnishing,
    bathrooms, setBathrooms, balconies, setBalconies,
    listingType, monthlyRent, setMonthlyRent, deposit, setDeposit,
    advance, setAdvance, saleAmount, setSaleAmount, negotiable, setNegotiable,
    maintenance, setMaintenance, description, setDescription,
    amenities, setAmenities, carpetArea, setCarpetArea, buildingAge, setBuildingAge,
  } = props;

  return (
    <View>
      <Section title="Location">
        <Field label="Full Address" required placeholder="Building, Street, Area" value={fullAddress} onChangeText={setFullAddress} multiline />
        <Field label="Locality / Neighbourhood" required placeholder="e.g. Sector 15, Noida" value={locality} onChangeText={setLocality} style={{ marginBottom: 0 }} />
      </Section>

      <Section title="Configuration">
        <View style={{ marginBottom: 16 }}>
          <Label text="BHK / Type" />
          <Chips
            options={['1 BHK', '2 BHK', '3 BHK', '4+ BHK', 'Studio', 'Single Room']}
            value={bhk}
            onChange={setBhk}
          />
        </View>
        <View style={{ marginBottom: 16 }}>
          <Label text="Facing" />
          <Chips
            options={['Front Side', 'Back Side', 'Corner', 'East', 'West', 'North', 'South']}
            value={facing}
            onChange={setFacing}
          />
        </View>
        <RowFields>
          <View style={{ flex: 1 }}>
            <Field label="Property Floor" placeholder="e.g. 5" value={propertyFloor} onChangeText={setPropertyFloor} keyboardType="numeric" style={{ marginBottom: 0 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Total Floors" placeholder="e.g. 10" value={totalFloors} onChangeText={setTotalFloors} keyboardType="numeric" style={{ marginBottom: 0 }} />
          </View>
        </RowFields>
      </Section>

      <Section title="Condition & Rooms">
        <View style={{ marginBottom: 16 }}>
          <Label text="Furnishing Status" />
          <Chips
            options={['Unfurnished', 'Semi-furnished', 'Fully Furnished']}
            value={furnishing}
            onChange={setFurnishing}
          />
        </View>
        <View style={{ marginBottom: 16 }}>
          <Label text="Bathrooms" />
          <Chips options={['1', '2', '3', '4+']} value={bathrooms} onChange={setBathrooms} />
        </View>
        <View>
          <Label text="Balconies" />
          <Chips options={['0', '1', '2', '3+']} value={balconies} onChange={setBalconies} />
        </View>
      </Section>

      <Section title={listingType === 'Rent' ? 'Financials — Rent' : 'Financials — Sale'}>
        {listingType === 'Rent' ? (
          <>
            <Field label="Monthly Rent (₹)" required placeholder="e.g. 15,000" value={monthlyRent} onChangeText={setMonthlyRent} keyboardType="numeric" />
            <RowFields>
              <View style={{ flex: 1 }}>
                <Field label="Security Deposit (₹)" placeholder="e.g. 45,000" value={deposit} onChangeText={setDeposit} keyboardType="numeric" style={{ marginBottom: 0 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Advance (₹)" placeholder="e.g. 30,000" value={advance} onChangeText={setAdvance} keyboardType="numeric" style={{ marginBottom: 0 }} />
              </View>
            </RowFields>
          </>
        ) : (
          <>
            <Field label="Sale Amount (₹)" required placeholder="e.g. 45,00,000" value={saleAmount} onChangeText={setSaleAmount} keyboardType="numeric" />
            <View style={{ marginBottom: 0 }}>
              <Label text="Negotiable?" />
              <Chips options={['Yes', 'No']} value={negotiable} onChange={setNegotiable} />
            </View>
          </>
        )}
        <Field label="Monthly Maintenance (₹)" placeholder="e.g. 500" value={maintenance} onChangeText={setMaintenance} keyboardType="numeric" style={{ marginTop: 16, marginBottom: 0 }} />
      </Section>

      <Section title="Description" subtitle="2-3 sentences highlighting key benefits">
        <TextInput
          style={[fld.input, fld.area, { marginBottom: 0 }]}
          placeholder="Describe the property — location, nearby facilities, special features..."
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
      </Section>

      <Section title="Amenities" subtitle="Select all that are available">
        <View style={s3.amenGrid}>
          {AMENITIES.map((a) => {
            const sel = amenities.includes(a.id);
            return (
              <TouchableOpacity
                key={a.id}
                style={[s3.amenCell, sel && s3.amenCellSel]}
                onPress={() => {
                  const next = sel ? amenities.filter((x) => x !== a.id) : [...amenities, a.id];
                  setAmenities(next);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name={a.icon} size={18} color={sel ? '#fff' : '#64748B'} />
                <Text style={[s3.amenLabel, sel && s3.amenLabelSel]}>{a.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title="Property Specs" last>
        <RowFields>
          <View style={{ flex: 1 }}>
            <Field label="Carpet Area" placeholder="e.g. 100 Gaz" value={carpetArea} onChangeText={setCarpetArea} style={{ marginBottom: 0 }} />
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Building Age" placeholder="e.g. 5 years" value={buildingAge} onChangeText={setBuildingAge} style={{ marginBottom: 0 }} />
          </View>
        </RowFields>
      </Section>
    </View>
  );
}

const s3 = StyleSheet.create({
  amenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
  },
  amenCellSel: { backgroundColor: ACCENT, borderColor: ACCENT },
  amenLabel: { fontSize: 12.5, fontWeight: '600', color: '#64748B' },
  amenLabelSel: { color: '#fff' },
});

/* ─── Step 4 ────────────────────────────────────────────────────────────────── */
function Step4({ videoCount, setVideoCount, imageCount, setImageCount }) {
  return (
    <View>
      <Section title="Photos & Videos" subtitle="Properties with great media get 3× more responses">
        <View style={s4.infoBox}>
          <Ionicons name="bulb-outline" size={18} color="#D97706" />
          <Text style={s4.infoText}>
            Shoot in natural light. Cover all rooms, kitchen, bathroom and the building exterior.
          </Text>
        </View>

        <Text style={s4.mediaLabel}>Videos <Text style={s4.mediaCount}>({videoCount}/2 added)</Text></Text>
        <View style={s4.slotRow}>
          {[0, 1].map((i) => {
            const filled = i < videoCount;
            return (
              <TouchableOpacity
                key={i}
                style={[s4.slot, s4.videoSlot, filled && s4.slotFilled]}
                onPress={() => setVideoCount(Math.min(videoCount + 1, 2))}
                activeOpacity={0.8}
              >
                {filled ? (
                  <>
                    <View style={s4.playBubble}>
                      <Ionicons name="play" size={16} color={ACCENT} />
                    </View>
                    <Text style={s4.slotFilledText}>Video {i + 1}</Text>
                  </>
                ) : (
                  <>
                    <View style={s4.addCircle}>
                      <Ionicons name="videocam-outline" size={22} color="#94A3B8" />
                    </View>
                    <Text style={s4.slotEmptyText}>Add Video</Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[s4.mediaLabel, { marginTop: 20 }]}>Photos <Text style={s4.mediaCount}>({imageCount}/10 added)</Text></Text>
        <View style={s4.photoGrid}>
          {Array.from({ length: 10 }).map((_, i) => {
            const filled = i < imageCount;
            return (
              <TouchableOpacity
                key={i}
                style={[s4.photoSlot, filled && s4.slotFilled]}
                onPress={() => setImageCount(Math.min(imageCount + 1, 10))}
                activeOpacity={0.8}
              >
                {filled ? (
                  <View style={s4.playBubble}>
                    <Ionicons name="image" size={18} color={ACCENT} />
                  </View>
                ) : (
                  <Ionicons name="add" size={22} color="#CBD5E1" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title="Photo Tips" last>
        {[
          'Shoot in natural daylight for best quality',
          'Cover all rooms: living, bedroom, kitchen, bathroom',
          'Include exterior and building entrance shots',
          'Keep videos under 60 seconds for faster upload',
        ].map((tip, i) => (
          <View key={i} style={s4.tipRow}>
            <View style={s4.tipDot} />
            <Text style={s4.tipText}>{tip}</Text>
          </View>
        ))}
      </Section>
    </View>
  );
}

const s4 = StyleSheet.create({
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoText: { flex: 1, fontSize: 13, color: '#92400E', lineHeight: 19 },
  mediaLabel: { fontSize: 13, fontWeight: '700', color: TEXT.primary, marginBottom: 10 },
  mediaCount: { fontWeight: '500', color: '#64748B' },
  slotRow: { flexDirection: 'row', gap: 12 },
  slot: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    gap: 6,
    paddingVertical: 22,
  },
  videoSlot: { minHeight: 100 },
  slotFilled: { borderStyle: 'solid', borderColor: ACCENT, backgroundColor: ACCENT_MUTED },
  addCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  playBubble: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  slotFilledText: { fontSize: 12, fontWeight: '600', color: ACCENT },
  slotEmptyText: { fontSize: 12, fontWeight: '500', color: '#94A3B8' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoSlot: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT, marginTop: 6 },
  tipText: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 19 },
});

/* ─── Step 5 ────────────────────────────────────────────────────────────────── */
function Step5({ plan, setPlan }) {
  const selected = PLANS.find((p) => p.id === plan);
  return (
    <View>
      <Section title="Choose a Plan" subtitle="Select how long your listing stays active">
        <View style={{ gap: 12 }}>
          {PLANS.map((p) => {
            const sel = plan === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[s5.card, sel && s5.cardSel]}
                onPress={() => setPlan(p.id)}
                activeOpacity={0.85}
              >
                {p.tag && (
                  <View style={[s5.tag, p.accent && s5.tagAccent]}>
                    <Text style={[s5.tagText, p.accent && s5.tagTextAccent]}>{p.tag}</Text>
                  </View>
                )}
                <View style={s5.cardRow}>
                  <View style={[s5.radio, sel && s5.radioSel]}>
                    {sel && <View style={s5.radioDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s5.planTitle, sel && s5.planTitleSel]}>{p.title}</Text>
                    <View style={s5.featList}>
                      {p.features.map((f, i) => (
                        <View key={i} style={s5.featRow}>
                          <Ionicons name="checkmark-circle" size={14} color={sel ? ACCENT : '#94A3B8'} />
                          <Text style={[s5.featText, sel && s5.featTextSel]}>{f}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={s5.priceCol}>
                    <Text style={[s5.price, sel && s5.priceSel]}>{p.price}</Text>
                    <Text style={s5.per}>{p.per}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      {selected && (
        <Section title="Order Summary" last>
          <View style={s5.summaryBox}>
            <View style={s5.summaryRow}>
              <Text style={s5.summaryLabel}>Plan</Text>
              <Text style={s5.summaryValue}>{selected.title}</Text>
            </View>
            <View style={s5.summaryDivider} />
            <View style={s5.summaryRow}>
              <Text style={s5.summaryLabel}>Total Amount</Text>
              <Text style={[s5.summaryValue, { color: ACCENT, fontSize: 18, fontWeight: '800' }]}>
                {selected.price}
              </Text>
            </View>
            <View style={s5.secureRow}>
              <Ionicons name="lock-closed" size={13} color={SUCCESS} />
              <Text style={s5.secureText}>100% secure payment · Listing goes live instantly after review</Text>
            </View>
          </View>
        </Section>
      )}
    </View>
  );
}

const s5 = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  cardSel: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_MUTED,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  tag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagAccent: { backgroundColor: ACCENT },
  tagText: { fontSize: 11, fontWeight: '700', color: '#B45309' },
  tagTextAccent: { color: '#fff' },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSel: { borderColor: ACCENT },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },
  planTitle: { fontSize: 15, fontWeight: '700', color: TEXT.primary, marginBottom: 8 },
  planTitleSel: { color: ACCENT },
  featList: { gap: 5 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featText: { fontSize: 12.5, color: '#64748B' },
  featTextSel: { color: '#3B82F6' },
  priceCol: { alignItems: 'flex-end', paddingTop: 2 },
  price: { fontSize: 22, fontWeight: '800', color: TEXT.primary, letterSpacing: -0.5 },
  priceSel: { color: ACCENT },
  per: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  summaryValue: { fontSize: 14, color: TEXT.primary, fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  secureRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  secureText: { fontSize: 12, color: '#64748B', flex: 1, lineHeight: 17 },
});

/* ─── Main Screen ───────────────────────────────────────────────────────────── */
export function AddPropertyScreen({ onClose }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [step, setStep] = useState(1);

  // Step 1
  const [role, setRole] = useState('');
  const [listingType, setListingType] = useState('');
  const [propertyType, setPropertyType] = useState('');

  // Step 2
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');

  // Step 3
  const [fullAddress, setFullAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [bhk, setBhk] = useState('');
  const [facing, setFacing] = useState('');
  const [propertyFloor, setPropertyFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [balconies, setBalconies] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [advance, setAdvance] = useState('');
  const [saleAmount, setSaleAmount] = useState('');
  const [negotiable, setNegotiable] = useState('');
  const [maintenance, setMaintenance] = useState('');
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [carpetArea, setCarpetArea] = useState('');
  const [buildingAge, setBuildingAge] = useState('');

  // Step 4
  const [videoCount, setVideoCount] = useState(0);
  const [imageCount, setImageCount] = useState(0);

  // Step 5
  const [plan, setPlan] = useState('3m');

  const validate = () => {
    if (step === 1) {
      if (!role) return 'Please select your role (Owner or Broker).';
      if (!listingType) return 'Please select listing type (Sell or Rent).';
      if (!propertyType) return 'Please select a property category.';
    }
    if (step === 2) {
      if (!ownerName) return 'Please enter your name.';
      if (!mobile) return 'Please enter your mobile number.';
    }
    if (step === 3) {
      if (!fullAddress) return 'Please enter the full address.';
      if (!locality) return 'Please enter the locality.';
    }
    return null;
  };

  const goNext = () => {
    const err = validate();
    if (err) { Alert.alert('Required', err); return; }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep(step - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      onClose?.();
    }
  };

  const handleSubmit = () => {
    Alert.alert(
      'Property Submitted!',
      'Your listing has been submitted. It will go live after a quick review.',
      [{ text: 'Great!', onPress: () => onClose?.() }],
    );
  };

  const isLastStep = step === TOTAL_STEPS;

  return (
    <View style={[root.screen, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={root.header}>
        <TouchableOpacity onPress={goBack} style={root.headerBtn} activeOpacity={0.7}>
          <Ionicons name={step === 1 ? 'close' : 'arrow-back'} size={22} color={TEXT.primary} />
        </TouchableOpacity>
        <View style={root.headerCenter}>
          <Text style={root.headerTitle}>
            {['Register Listing', 'Owner Details', 'Property Details', 'Photos & Videos', 'Choose Plan'][step - 1]}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={root.headerBtn} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* ── Progress ── */}
      <ProgressBar step={step} />

      {/* ── Body ── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={root.scroll}
          contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 && (
            <Step1
              role={role} setRole={setRole}
              listingType={listingType} setListingType={setListingType}
              propertyType={propertyType} setPropertyType={setPropertyType}
            />
          )}
          {step === 2 && (
            <Step2
              ownerName={ownerName} setOwnerName={setOwnerName}
              mobile={mobile} setMobile={setMobile}
              whatsapp={whatsapp} setWhatsapp={setWhatsapp}
              email={email} setEmail={setEmail}
              currentAddress={currentAddress} setCurrentAddress={setCurrentAddress}
            />
          )}
          {step === 3 && (
            <Step3
              fullAddress={fullAddress} setFullAddress={setFullAddress}
              locality={locality} setLocality={setLocality}
              bhk={bhk} setBhk={setBhk}
              facing={facing} setFacing={setFacing}
              propertyFloor={propertyFloor} setPropertyFloor={setPropertyFloor}
              totalFloors={totalFloors} setTotalFloors={setTotalFloors}
              furnishing={furnishing} setFurnishing={setFurnishing}
              bathrooms={bathrooms} setBathrooms={setBathrooms}
              balconies={balconies} setBalconies={setBalconies}
              listingType={listingType}
              monthlyRent={monthlyRent} setMonthlyRent={setMonthlyRent}
              deposit={deposit} setDeposit={setDeposit}
              advance={advance} setAdvance={setAdvance}
              saleAmount={saleAmount} setSaleAmount={setSaleAmount}
              negotiable={negotiable} setNegotiable={setNegotiable}
              maintenance={maintenance} setMaintenance={setMaintenance}
              description={description} setDescription={setDescription}
              amenities={amenities} setAmenities={setAmenities}
              carpetArea={carpetArea} setCarpetArea={setCarpetArea}
              buildingAge={buildingAge} setBuildingAge={setBuildingAge}
            />
          )}
          {step === 4 && (
            <Step4
              videoCount={videoCount} setVideoCount={setVideoCount}
              imageCount={imageCount} setImageCount={setImageCount}
            />
          )}
          {step === 5 && <Step5 plan={plan} setPlan={setPlan} />}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bottom Action Bar ── */}
      <View style={[root.bar, { paddingBottom: insets.bottom + 16 }]}>
        {step > 1 && (
          <TouchableOpacity style={root.backBtn} onPress={goBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={18} color={ACCENT} />
            <Text style={root.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={root.nextBtn}
          onPress={isLastStep ? handleSubmit : goNext}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={isLastStep ? [SUCCESS, '#15803D'] : [ACCENT_LIGHT, ACCENT, ACCENT_DARK]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={root.nextGrad}
          >
            <Text style={root.nextText}>
              {isLastStep ? 'Submit & Pay' : 'Continue'}
            </Text>
            <Ionicons
              name={isLastStep ? 'checkmark-circle' : 'arrow-forward'}
              size={18}
              color="#fff"
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const root = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT.primary, letterSpacing: -0.3 },
  scroll: { flex: 1, backgroundColor: '#fff' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 10 },
    }),
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ACCENT,
    backgroundColor: ACCENT_MUTED,
  },
  backText: { fontSize: 14, fontWeight: '700', color: ACCENT },
  nextBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  nextGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.1 },
});
