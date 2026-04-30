import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
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
  TEXT,
} from '../../theme/colors';
import {
  ACCENT_MUTED,
  AMENITIES,
  PROPERTY_TYPES,
  ProgressBar,
  Step1,
  Step2,
  Step3,
  Step4,
  STEP_META_EDIT,
  SUCCESS,
  TOTAL_STEPS,
  Section,
} from '../listingForm/formSteps';

/** Default category from bottom-nav icon (legacy cards) */
function categoryIdFromLegacyIcon(icon) {
  const m = {
    'home-outline': 'flat',
    'business-outline': 'office',
    'bed-outline': 'pg',
    'storefront-outline': 'shop',
    'car-outline': 'parking',
    'cube-outline': 'warehouse',
    'people-outline': 'sharing',
    'map-outline': 'plot',
    'briefcase-outline': 'office',
  };
  return m[icon] || 'flat';
}

/** Many “apartment” rows use business-outline; prefer flat when title looks residential */
function resolvePropertyType(property) {
  if (property.listingDraft?.propertyType) return property.listingDraft.propertyType;
  const t = `${property.title || ''} ${property.subtitle || ''}`.toLowerCase();
  if (/\b(bhk|apartment|flat|studio|room)\b/.test(t)) return 'flat';
  return categoryIdFromLegacyIcon(property.icon);
}

function inferBhkFromTitle(title) {
  if (!title) return '';
  if (/studio/i.test(title)) return 'Studio';
  const m = title.match(/(\d+)\s*BHK/i);
  return m ? `${m[1]} BHK` : '';
}

function parseFloorsFromSubtitle(sub) {
  if (!sub || typeof sub !== 'string') return { propertyFloor: '', totalFloors: '' };
  const m2 = sub.match(/Floor\s*(\d+)\s*\/\s*(\d+)/i);
  if (m2) return { propertyFloor: m2[1], totalFloors: m2[2] };
  const m1 = sub.match(/Floor\s*(\d+)/i);
  if (m1) return { propertyFloor: m1[1], totalFloors: '' };
  return { propertyFloor: '', totalFloors: '' };
}

function numericFromPriceStr(str) {
  if (!str) return '';
  return String(str)
    .replace(/AED\s*/gi, '')
    .replace(/₹\s*/g, '')
    .replace(/,/g, '')
    .replace(/\/mo.*/i, '')
    .replace(/[^\d.]/g, '')
    .trim();
}

function withCommas(n) {
  const s = String(n || '').replace(/[^\d]/g, '');
  if (!s) return '';
  const num = s.replace(/^0+/, '') || '0';
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function amenityLabels(ids) {
  if (!ids?.length) return '—';
  return ids.map((id) => AMENITIES.find((a) => a.id === id)?.label || id).join(', ');
}

function buildListingDraftFromProperty(property) {
  if (property.listingDraft && typeof property.listingDraft === 'object') {
    const d = { ...property.listingDraft };
    if (!d.propertyType) d.propertyType = resolvePropertyType(property);
    return d;
  }

  const isSale = property.type === 'Sale';
  const lt = isSale ? 'Sell' : 'Rent';
  const raw = numericFromPriceStr(property.price);
  const floors = parseFloorsFromSubtitle(property.subtitle);
  const bhkGuess = inferBhkFromTitle(property.title);

  return {
    role: property.role || 'Owner',
    listingType: lt,
    propertyType: resolvePropertyType(property),
    ownerName: property.contactName || '',
    mobile: property.contactPhone || '',
    whatsapp: property.contactWhatsapp || '',
    email: property.email || '',
    currentAddress: property.currentAddress || '',
    fullAddress: property.fullAddress
      ? property.fullAddress
      : [property.title, property.subtitle].filter(Boolean).join(', '),
    locality: property.locality || property.subtitle || '',
    bhk: property.bhk || bhkGuess,
    facing: property.facing || '',
    propertyFloor: property.propertyFloor ?? floors.propertyFloor ?? '',
    totalFloors: property.totalFloors ?? floors.totalFloors ?? '',
    furnishing: property.furnishing || '',
    bathrooms: property.bathrooms || '',
    balconies: property.balconies || '',
    monthlyRent: lt === 'Rent' ? raw : property.monthlyRent || '',
    deposit: property.deposit || '',
    advance: property.advance || '',
    saleAmount: lt === 'Sell' ? raw : property.saleAmount || '',
    negotiable: property.negotiable || '',
    maintenance: property.maintenance || '',
    description: property.description || '',
    amenities: Array.isArray(property.amenities) ? [...property.amenities] : [],
    carpetArea: property.carpetArea || '',
    buildingAge: property.buildingAge || '',
    videoCount: property.videoCount ?? 0,
    imageCount: property.imageCount ?? 0,
  };
}

/** Spread every wizard field onto the listing so merges + next edit hydrate correctly */
function flattenPersistFields(draft) {
  return {
    role: draft.role,
    listingType: draft.listingType,
    propertyType: draft.propertyType,
    contactName: draft.ownerName.trim(),
    contactPhone: draft.mobile.trim(),
    contactWhatsapp: draft.whatsapp.trim(),
    email: draft.email.trim(),
    currentAddress: draft.currentAddress,
    fullAddress: draft.fullAddress,
    locality: draft.locality.trim(),
    bhk: draft.bhk,
    facing: draft.facing,
    propertyFloor: draft.propertyFloor,
    totalFloors: draft.totalFloors,
    furnishing: draft.furnishing,
    bathrooms: draft.bathrooms,
    balconies: draft.balconies,
    monthlyRent: draft.monthlyRent,
    deposit: draft.deposit,
    advance: draft.advance,
    saleAmount: draft.saleAmount,
    negotiable: draft.negotiable,
    maintenance: draft.maintenance,
    description: draft.description.trim(),
    amenities: draft.amenities,
    carpetArea: draft.carpetArea,
    buildingAge: draft.buildingAge,
    videoCount: draft.videoCount,
    imageCount: draft.imageCount,
  };
}

export function EditPropertyBottomSheet({ visible, property, onClose, onSave }) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [step, setStep] = useState(1);

  const [role, setRole] = useState('');
  const [listingType, setListingType] = useState('');
  const [propertyType, setPropertyType] = useState('');

  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');

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

  const [videoCount, setVideoCount] = useState(0);
  const [imageCount, setImageCount] = useState(0);

  const hydrate = (prop) => {
    const d = buildListingDraftFromProperty(prop);
    setStep(1);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setRole(d.role);
    setListingType(d.listingType);
    setPropertyType(d.propertyType);
    setOwnerName(d.ownerName);
    setMobile(d.mobile);
    setWhatsapp(d.whatsapp);
    setEmail(d.email);
    setCurrentAddress(d.currentAddress || '');
    setFullAddress(d.fullAddress || '');
    setLocality(d.locality || '');
    setBhk(d.bhk || '');
    setFacing(d.facing || '');
    setPropertyFloor(String(d.propertyFloor ?? ''));
    setTotalFloors(String(d.totalFloors ?? ''));
    setFurnishing(d.furnishing || '');
    setBathrooms(d.bathrooms || '');
    setBalconies(d.balconies || '');
    setMonthlyRent(String(d.monthlyRent ?? ''));
    setDeposit(String(d.deposit ?? ''));
    setAdvance(String(d.advance ?? ''));
    setSaleAmount(String(d.saleAmount ?? ''));
    setNegotiable(d.negotiable || '');
    setMaintenance(String(d.maintenance ?? ''));
    setDescription(d.description || '');
    setAmenities(Array.isArray(d.amenities) ? [...d.amenities] : []);
    setCarpetArea(d.carpetArea || '');
    setBuildingAge(d.buildingAge || '');
    setVideoCount(d.videoCount ?? 0);
    setImageCount(d.imageCount ?? 0);
  };

  useEffect(() => {
    if (!visible || !property) return;
    hydrate(property);
    // Depend on whole property so reopened edits load latest listingDraft / saved fields
  }, [visible, property]);

  const HEADER_TITLES = [
    'Register Listing',
    'Owner Details',
    'Property Details',
    'Photos & Videos',
    'Review Listing',
  ];

  const listingDraftPack = () => ({
    role,
    listingType,
    propertyType,
    ownerName,
    mobile,
    whatsapp,
    email,
    currentAddress,
    fullAddress,
    locality,
    bhk,
    facing,
    propertyFloor,
    totalFloors,
    furnishing,
    bathrooms,
    balconies,
    monthlyRent,
    deposit,
    advance,
    saleAmount,
    negotiable,
    maintenance,
    description,
    amenities,
    carpetArea,
    buildingAge,
    videoCount,
    imageCount,
  });

  const deriveCardUpdates = () => {
    const draft = listingDraftPack();
    const pt = PROPERTY_TYPES.find((p) => p.id === propertyType);
    const displayType = listingType === 'Sell' ? 'Sale' : 'Rent';
    const priceStr = listingType === 'Rent'
      ? `AED ${withCommas(monthlyRent)}/mo`
      : `AED ${withCommas(saleAmount)}`;

    const headline = fullAddress.trim().split(/\n|,/).map((x) => x.trim()).filter(Boolean)[0];
    const shortCat = pt?.label?.split('/')?.[0]?.trim();
    const titleParts = [bhk?.trim(), shortCat].filter(Boolean);
    const titleComputed = headline?.length && headline.length < 96
      ? headline
      : (titleParts.length ? titleParts.join(' · ') : locality.trim().split('·')[0]?.trim()) || property.title;

    const floorBit = [];
    if (propertyFloor) {
      floorBit.push(totalFloors ? `Floor ${propertyFloor}/${totalFloors}` : `Floor ${propertyFloor}`);
    }
    const subtitleComputed = [locality.trim(), ...floorBit].filter(Boolean).join(' · ') || property.subtitle;

    return {
      title: titleComputed,
      subtitle: subtitleComputed || locality || property.subtitle,
      type: displayType,
      price: priceStr,
      icon: pt?.icon || property.icon,
      iconBg: pt ? `${pt.color}18` : property.iconBg,
      iconColor: pt?.color || property.iconColor,
      listingDraft: draft,
      ...flattenPersistFields(draft),
    };
  };

  const validate = () => {
    if (step === 1) {
      if (!role) return 'Please select your role (Owner or Broker).';
      if (!listingType) return 'Please select listing type (Sell or Rent).';
      if (!propertyType) return 'Please select a property category.';
    }
    if (step === 2) {
      if (!ownerName.trim()) return 'Please enter your name.';
      if (!mobile.trim()) return 'Please enter your mobile number.';
    }
    if (step === 3) {
      if (!fullAddress.trim()) return 'Please enter the full address.';
      if (!locality.trim()) return 'Please enter the locality.';
      if (listingType === 'Rent' && !monthlyRent.trim()) return 'Please enter monthly rent.';
      if (listingType === 'Sell' && !saleAmount.trim()) return 'Please enter sale amount.';
    }
    return null;
  };

  const goNext = () => {
    const err = validate();
    if (err) {
      Alert.alert('Required', err);
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const applySave = () => {
    if (!property || !onSave) return;
    onSave(property.id, deriveCardUpdates());
    onClose();
  };

  if (!property) return null;

  const isLastStep = step === TOTAL_STEPS;

  const bottomInset = Math.max(insets.bottom, 10);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={sheetStyles.keyboard}>
        <TouchableOpacity style={sheetStyles.dim} activeOpacity={1} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={sheetStyles.sheetAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <View style={[sheetStyles.sheetWrap, { paddingBottom: bottomInset }]}>
            <View style={sheetStyles.sheet}>
              <View style={sheetStyles.sheetHeader}>
                <TouchableOpacity onPress={step === 1 ? onClose : goBack} style={sheetStyles.headerBtn} activeOpacity={0.7}>
                  <Ionicons name={step === 1 ? 'close' : 'arrow-back'} size={22} color={TEXT.primary} />
                </TouchableOpacity>
                <View style={sheetStyles.sheetHeaderCenter}>
                  <Text style={sheetStyles.sheetHeaderTitle}>{HEADER_TITLES[step - 1]}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={sheetStyles.headerBtn} activeOpacity={0.7}>
                  <Ionicons name="close" size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <ProgressBar step={step} stepMeta={STEP_META_EDIT} />

              <ScrollView
                ref={scrollRef}
                style={sheetStyles.stepScroll}
                contentContainerStyle={sheetStyles.stepScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
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
                {step === 5 && (
                  <EditReviewSummary draft={listingDraftPack()} updates={deriveCardUpdates()} />
                )}
              </ScrollView>

              <View style={[sheetStyles.bar, { paddingBottom: Math.max(bottomInset - 8, 10) }]}>
                {step > 1 ? (
                  <TouchableOpacity style={sheetStyles.backBtn} onPress={goBack} activeOpacity={0.8}>
                    <Ionicons name="arrow-back" size={18} color={ACCENT} />
                    <Text style={sheetStyles.backText}>Back</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={sheetStyles.backPlaceholder} />
                )}
                <TouchableOpacity
                  style={sheetStyles.nextBtnWrap}
                  onPress={isLastStep ? applySave : goNext}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={isLastStep ? [SUCCESS, '#15803D'] : [ACCENT_LIGHT, ACCENT, ACCENT_DARK]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={sheetStyles.nextGrad}
                  >
                    <Text style={sheetStyles.nextText}>
                      {isLastStep ? 'Save changes' : 'Continue'}
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function ReviewRow({ k, v, multiline }) {
  return (
    <View style={[rev.row, multiline && { alignItems: 'flex-start' }]}>
      <Text style={rev.k}>{k}</Text>
      <Text style={[rev.v, multiline && rev.vMulti]}>{v}</Text>
    </View>
  );
}

function EditReviewSummary({ draft, updates }) {
  const fmt = (n) => (n ? `${withCommas(n)}` : '');
  const rentLine = draft.listingType === 'Rent'
    ? `AED ${fmt(draft.monthlyRent)}/mo${draft.deposit ? ` · Deposit AED ${fmt(draft.deposit)}` : ''}${draft.advance ? ` · Advance AED ${fmt(draft.advance)}` : ''}`
    : `AED ${fmt(draft.saleAmount)}${draft.negotiable ? ` · Negotiable: ${draft.negotiable}` : ''}`;
  const descTrim = (draft.description || '').trim();
  const cfg = PROPERTY_TYPES.find((p) => p.id === draft.propertyType);
  const amenText = amenityLabels(draft.amenities);

  return (
    <View style={rev.pad}>
      <Section title="Listing summary" subtitle="What appears on your property card and what we saved" last>
        <View style={rev.summaryBox}>
          <Text style={rev.sectionLbl}>Card preview</Text>
          <ReviewRow k="Title" v={updates.title} />
          <ReviewRow k="Subtitle" v={updates.subtitle} />
          <ReviewRow k="Type" v={draft.listingType === 'Rent' ? 'Rent' : 'Sale'} />
          <ReviewRow k="Price (AED)" v={updates.price} multiline />

          <View style={rev.divider} />
          <Text style={rev.sectionLbl}>Role & category</Text>
          <ReviewRow k="Role" v={draft.role || '—'} />
          <ReviewRow k="Category" v={cfg?.label ?? '—'} />

          <View style={rev.divider} />
          <Text style={rev.sectionLbl}>Location & layout</Text>
          <ReviewRow k="Full address" v={draft.fullAddress.trim() || '—'} multiline />
          <ReviewRow k="Locality" v={draft.locality.trim() || '—'} />
          <ReviewRow k="BHK / type" v={draft.bhk || '—'} />
          <ReviewRow k="Facing" v={draft.facing || '—'} />
          <ReviewRow k="Floors" v={[draft.propertyFloor && `Unit ${draft.propertyFloor}`, draft.totalFloors && `Tower ${draft.totalFloors}`].filter(Boolean).join(' · ') || '—'} />
          <ReviewRow k="Furnishing" v={draft.furnishing || '—'} />
          <ReviewRow k="Baths / balconies" v={`${draft.bathrooms || '—'} · ${draft.balconies || '—'}`} />
          <ReviewRow k="Carpet area" v={draft.carpetArea || '—'} />
          <ReviewRow k="Building age" v={draft.buildingAge || '—'} />

          <View style={rev.divider} />
          <Text style={rev.sectionLbl}>Financials (form)</Text>
          <ReviewRow k="Rent / Sale" v={rentLine} multiline />
          <ReviewRow k="Maintenance (AED/mo)" v={draft.maintenance ? `AED ${withCommas(draft.maintenance)}` : '—'} />

          <View style={rev.divider} />
          <Text style={rev.sectionLbl}>Contact</Text>
          <ReviewRow k="Name" v={draft.ownerName || '—'} />
          <ReviewRow k="Mobile" v={draft.mobile || '—'} />
          <ReviewRow k="WhatsApp" v={draft.whatsapp || '—'} />
          <ReviewRow k="Email" v={draft.email || '—'} />
          <ReviewRow k="Current address" v={draft.currentAddress.trim() || '—'} multiline />

          <View style={rev.divider} />
          <Text style={rev.sectionLbl}>Extras</Text>
          <ReviewRow k="Description" v={descTrim ? `${descTrim.slice(0, 200)}${descTrim.length > 200 ? '…' : ''}` : '—'} multiline />
          <ReviewRow k={`Amenities (${draft.amenities?.length || 0})`} v={amenText} multiline />
          <ReviewRow k="Media" v={`${draft.videoCount} video(s) · ${draft.imageCount} photo(s)`} />
        </View>

        <View style={rev.hint}>
          <Ionicons name="information-circle-outline" size={18} color={ACCENT} />
          <Text style={rev.hintText}>
            All fields are saved on your listing record. Opening Edit again restores every step—including amenities, specs, and contact details.
          </Text>
        </View>
      </Section>
    </View>
  );
}

const sheetStyles = StyleSheet.create({
  keyboard: { flex: 1, justifyContent: 'flex-end' },
  sheetAvoid: { flex: 1, justifyContent: 'flex-end', maxHeight: '100%' },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  sheetWrap: {
    flexGrow: 0,
    maxHeight: Platform.OS === 'ios' ? '94%' : '96%',
    width: '100%',
    paddingHorizontal: 0,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
  },
  sheet: {
    flex: 1,
    minHeight: 420,
    maxHeight: '100%',
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
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
  sheetHeaderCenter: { flex: 1, alignItems: 'center' },
  sheetHeaderTitle: { fontSize: 16, fontWeight: '700', color: TEXT.primary, letterSpacing: -0.3 },
  stepScroll: { flexGrow: 1, flexShrink: 1 },
  stepScrollContent: { paddingBottom: 8, flexGrow: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 12 },
    }),
  },
  backPlaceholder: { width: 100 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ACCENT,
    backgroundColor: ACCENT_MUTED,
  },
  backText: { fontSize: 14, fontWeight: '700', color: ACCENT },
  nextBtnWrap: { flex: 1, borderRadius: 14, overflow: 'hidden', minHeight: 52 },
  nextGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
  },
  nextText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.1 },
});

const rev = StyleSheet.create({
  pad: { paddingBottom: 12 },
  sectionLbl: { fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginTop: 4 },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 },
  k: { fontSize: 12, color: '#64748B', fontWeight: '600', width: 108, flexShrink: 0 },
  v: { flex: 1, fontSize: 13, fontWeight: '700', color: TEXT.primary, textAlign: 'right' },
  vMulti: { textAlign: 'right', fontWeight: '600', lineHeight: 18 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  hint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  hintText: { flex: 1, fontSize: 12.5, color: '#1E40AF', lineHeight: 18 },
});
