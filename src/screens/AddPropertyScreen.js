import { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
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
  TEXT,
} from '../theme/colors';
import {
  ACCENT_MUTED,
  ProgressBar,
  Step1,
  Step2,
  Step3,
  Step4,
  Step5ChoosePlan,
  SUCCESS,
  TOTAL_STEPS,
} from './listingForm/formSteps';

/* ─── Main Screen ───────────────────────────────────────────────────────────── */
export function AddPropertyScreen({ onClose, onListingPublished }) {
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
      [
        {
          text: 'Great!',
          onPress: () => {
            onListingPublished?.();
          },
        },
      ],
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
          {step === 5 && <Step5ChoosePlan plan={plan} setPlan={setPlan} />}
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
