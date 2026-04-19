import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { getPropertyDetail } from '../data/mockProperties';
import { ACCENT, ACCENT_DEEP, ACCENT_LIGHT, SURFACE, TEXT } from '../theme/colors';

const H_PAD = 20;
const CAROUSEL_HEIGHT = 300;
const ICON_BUBBLE = '#E8F0FE';
const WHATSAPP_GREEN = '#25D366';
const INSTAGRAM_ROSE = '#E4405F';
const FACEBOOK_BLUE = '#1877F2';

/** Contact-view packs shown when the user is not subscribed (booking modal). */
const CONTACT_VIEW_PLANS = [
  {
    id: 'starter',
    tier: 'Starter',
    views: 10,
    price: 50,
    perView: '₹5 / view',
    features: ['10 owner contact unlocks', 'Phone & WhatsApp access', 'Valid for 30 days'],
    recommended: false,
  },
  {
    id: 'popular',
    tier: 'Popular',
    views: 25,
    price: 80,
    perView: '₹3.2 / view',
    features: ['25 owner contact unlocks', 'Phone & WhatsApp access', 'Valid for 60 days'],
    recommended: true,
  },
  {
    id: 'pro',
    tier: 'Pro',
    views: 50,
    price: 130,
    perView: '₹2.6 / view',
    features: ['50 owner contact unlocks', 'Phone & WhatsApp access', 'Valid for 90 days'],
    recommended: false,
  },
];

function dialDigits(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function facilityIcon(name) {
  const n = name.toLowerCase();
  if (n.includes('park') || n.includes('parking') || n.includes('car')) return 'car-outline';
  if (n.includes('swim') || n.includes('pool')) return 'water-outline';
  if (n.includes('gym') || n.includes('fit') || n.includes('sauna')) return 'barbell-outline';
  if (n.includes('restaurant') || n.includes('café') || n.includes('cafe')) return 'restaurant-outline';
  if (n.includes('wifi') || n.includes('wi-fi') || n.includes('fiber')) return 'wifi-outline';
  if (n.includes('pet')) return 'paw-outline';
  if (n.includes('sport') || n.includes('court')) return 'basketball-outline';
  if (n.includes('laundry')) return 'shirt-outline';
  if (n.includes('cctv')) return 'videocam-outline';
  if (n.includes('deposit')) return 'wallet-outline';
  if (n.includes('security') || n.includes('guard')) return 'shield-checkmark-outline';
  if (n.includes('fire')) return 'flame-outline';
  if (n.includes('elevator') || n.includes('lift')) return 'swap-vertical-outline';
  if (n.includes('power') || n.includes('backup') || n.includes('ups') || n.includes('generator')) return 'flash-outline';
  if (n.includes('meeting') || n.includes('conference')) return 'people-circle-outline';
  if (n.includes('terrace') || n.includes('roof')) return 'sunny-outline';
  if (n.includes('bike')) return 'bicycle-outline';
  if (n.includes('ev ') || n.includes('charging')) return 'battery-charging-outline';
  if (n.includes('bms') || n.includes('access control') || n.includes('access')) return 'key-outline';
  if (n.includes('hvac') || n.includes('vrf') || n.includes('climate')) return 'snow-outline';
  if (n.includes('intercom')) return 'mic-outline';
  if (n.includes('storage') || n.includes('warehouse')) return 'cube-outline';
  if (n.includes('water')) return 'water-outline';
  if (n.includes('kids') || n.includes('play')) return 'happy-outline';
  if (n.includes('visitor')) return 'people-outline';
  if (n.includes('maintenance')) return 'build-outline';
  if (n.includes('prayer')) return 'moon-outline';
  if (n.includes('acoustic') || n.includes('sound')) return 'volume-high-outline';
  if (n.includes('raised') || n.includes('floor')) return 'grid-outline';
  return 'star-outline';
}

function shortenLabel(s, max = 12) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/** One- or two-line friendly snippet for facility grid cells */
function shortFacilityDetail(s, maxLen = 44) {
  if (s == null || s === '') return '—';
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

/** e.g. `350 gaz carpet area` → `350 gaz` */
function areaInGazShort(carpetArea) {
  if (carpetArea == null || carpetArea === '') return '—';
  const s = String(carpetArea).replace(/\s+/g, ' ').trim();
  const m = s.match(/([\d,]+)\s*gaz/i);
  if (m) return `${m[1]} gaz`;
  const stripped = s.replace(/\s*carpet\s*area\s*/gi, '').trim();
  return shortFacilityDetail(stripped || s, 28);
}

/** Area · locality, state — from full address + listing area (no building name). */
function formatLocationSubtitle(property, d) {
  const trimSeg = (s) =>
    String(s || '')
      .replace(/\s+\d{4,}\b.*$/i, '')
      .trim();

  const fa = d.fullAddress?.trim();
  if (fa) {
    const segments = fa.split(',').map((x) => trimSeg(x.trim())).filter(Boolean);
    if (segments.length >= 3) {
      const state = segments[segments.length - 1];
      const locality = segments[segments.length - 2];
      const area = segments.slice(0, -2).join(', ');
      return `${area} · ${locality}, ${state}`;
    }
    if (segments.length === 2) {
      return `${segments[0]} · ${segments[1]}`;
    }
    if (segments.length === 1) {
      return segments[0];
    }
  }

  const la = property.area?.trim();
  if (la) {
    const segs = la.split(',').map((x) => x.trim()).filter(Boolean);
    if (segs.length >= 2) return `${segs[0]} · ${segs[1]}`;
    return segs[0];
  }

  return '—';
}

function QuickStat({ icon, value, sublabel }) {
  return (
    <View style={styles.quickStat}>
      <View style={styles.quickStatIcon}>
        <Ionicons name={icon} size={20} color={ACCENT} />
      </View>
      <View style={styles.quickStatText}>
        <Text style={styles.quickStatValue}>{value}</Text>
        <Text style={styles.quickStatLabel}>{sublabel}</Text>
      </View>
    </View>
  );
}

/** @param {{ icon: string; value: string }} props */
function SpecFacilityItem({ icon, value }) {
  const detail = shortFacilityDetail(value, 28);
  return (
    <View style={styles.specFacilityCell}>
      <View style={[styles.facilityIconCircle, styles.specFacilityIconCircle]}>
        <Ionicons name={icon} size={22} color={ACCENT} />
      </View>
      <Text style={styles.specFacilityDetail} numberOfLines={2}>
        {detail}
      </Text>
    </View>
  );
}

/** Amenity chip: same layout as {@link SpecFacilityItem} (icon bubble + 2-line label). */
function AmenityFeatureItem({ name }) {
  const detail = shortFacilityDetail(name, 36);
  return (
    <View style={styles.specFacilityCell}>
      <View style={[styles.facilityIconCircle, styles.specFacilityIconCircle]}>
        <Ionicons name={facilityIcon(name)} size={22} color={ACCENT} />
      </View>
      <Text style={styles.specFacilityDetail} numberOfLines={2}>
        {detail}
      </Text>
    </View>
  );
}

/**
 * @param {{ property: object; category?: { id: string; label: string }; onBack: () => void; onContactPress?: () => void }} props
 */
export function PropertyDetailScreen({ property, category, onBack, onContactPress = () => { } }) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isOffice = category?.id === 'office';
  const d = useMemo(() => getPropertyDetail(property, category?.id ?? ''), [property, category?.id]);
  const locationSubtitle = useMemo(() => formatLocationSubtitle(property, d), [property, d]);
  const gallery = d.galleryImages?.length ? d.galleryImages : [d.image];
  const [slideIndex, setSlideIndex] = useState(0);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  /** When true, booking modal shows owner contact details; when false, subscription plans. */
  const [subscribed, setSubscribed] = useState(true);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [heroBookmarked, setHeroBookmarked] = useState(false);
  const [galleryLightboxVisible, setGalleryLightboxVisible] = useState(false);
  const [galleryLightboxIndex, setGalleryLightboxIndex] = useState(0);
  const [galleryLightboxSlideIndex, setGalleryLightboxSlideIndex] = useState(0);
  const galleryRowRef = useRef(null);
  const galleryLightboxListRef = useRef(null);

  const openGalleryLightbox = (index) => {
    const i = Math.max(0, Math.min(index, gallery.length - 1));
    setGalleryLightboxIndex(i);
    setGalleryLightboxSlideIndex(i);
    setGalleryLightboxVisible(true);
  };

  const closeGalleryLightbox = () => setGalleryLightboxVisible(false);

  useEffect(() => {
    if (!galleryLightboxVisible || gallery.length === 0) return;
    const id = requestAnimationFrame(() => {
      galleryLightboxListRef.current?.scrollToIndex({
        index: galleryLightboxIndex,
        animated: false,
      });
    });
    return () => cancelAnimationFrame(id);
  }, [galleryLightboxVisible, galleryLightboxIndex, gallery.length]);

  const shareListingUrl = useMemo(
    () => `https://al-baty.app/listing/${property.id ?? 'property'}`,
    [property.id],
  );
  const shareListingMessage = useMemo(
    () =>
      `${d.title}\n${locationSubtitle}\n₹${d.price} / month\n${shareListingUrl}`,
    [d.title, d.price, locationSubtitle, shareListingUrl],
  );

  const ownerDigits = dialDigits(d.ownerPhone);
  const openWhatsApp = () => {
    if (!ownerDigits) return;
    const url = `https://wa.me/${ownerDigits}`;
    Linking.openURL(url).catch(() => { });
  };
  const openPhoneDialer = () => {
    if (!ownerDigits) return;
    Linking.openURL(`tel:${ownerDigits}`).catch(() => { });
  };

  const badgeLabel =
    category?.label === 'Flat' ? 'Apartment' : category?.label === 'PG/Hostel' ? 'PG / Hostel' : category?.label ?? 'Property';

  const bhkN = property.bhk?.match(/\d+/)?.[0] ?? '0';
  const bathN = property.bathrooms?.match(/\d+/)?.[0] ?? '0';

  const onCarouselSnap = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    setSlideIndex(Math.max(0, Math.min(i, gallery.length - 1)));
  };

  const footerPad = 108 + insets.bottom;

  const closeShareModal = () => setShareModalVisible(false);

  const shareViaWhatsAppApp = async () => {
    const text = encodeURIComponent(shareListingMessage);
    const scheme = `whatsapp://send?text=${text}`;
    try {
      if (await Linking.canOpenURL(scheme)) {
        await Linking.openURL(scheme);
      } else {
        await Linking.openURL(`https://wa.me/?text=${text}`);
      }
    } catch {
      /* ignore */
    }
    closeShareModal();
  };

  const shareViaInstagram = async () => {
    try {
      await Clipboard.setStringAsync(shareListingMessage);
      const ig = 'instagram://app';
      if (await Linking.canOpenURL(ig)) {
        await Linking.openURL(ig);
      } else {
        Alert.alert('Copied', 'Listing details were copied. Open Instagram and paste into a story or DM.');
      }
    } catch {
      Alert.alert('Copied', 'Listing details were copied to the clipboard.');
    }
    closeShareModal();
  };

  const shareViaFacebook = async () => {
    const u = encodeURIComponent(shareListingUrl);
    const quote = encodeURIComponent(
      `${d.title} — ${locationSubtitle} — ₹${d.price} / month`,
    );
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${quote}`;
    try {
      await Linking.openURL(fbUrl);
    } catch {
      /* ignore */
    }
    closeShareModal();
  };

  const shareViaSms = async () => {
    const body = encodeURIComponent(shareListingMessage);
    const url = Platform.select({
      ios: `sms:&body=${body}`,
      android: `sms:?body=${body}`,
      default: `sms:?body=${body}`,
    });
    try {
      await Linking.openURL(url);
    } catch {
      /* ignore */
    }
    closeShareModal();
  };

  return (
    <View style={styles.shell}>
      <StatusBar style="light" />

      <View style={[styles.carouselSection, styles.carouselSectionFixed, { height: CAROUSEL_HEIGHT }]}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onCarouselSnap}
          decelerationRate="fast"
          snapToInterval={windowWidth}
          snapToAlignment="center"
        >
          {gallery.map((uri) => (
            <ImageBackground
              key={uri}
              source={{ uri }}
              style={[styles.carouselSlide, { width: windowWidth, height: CAROUSEL_HEIGHT }]}
            >
              <LinearGradient
                colors={['rgba(15,23,42,0.15)', 'rgba(15,23,42,0.55)']}
                style={StyleSheet.absoluteFill}
              />
            </ImageBackground>
          ))}
        </ScrollView>

        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.backFab, { top: insets.top + 10 }, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>

        <View style={[styles.heroTopActions, { top: insets.top + 10 }]}>
          <Pressable
            onPress={() => setShareModalVisible(true)}
            style={({ pressed }) => [styles.heroCircleBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Share property"
          >
            <Ionicons name="share-outline" size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable
            onPress={() => setHeroBookmarked(!heroBookmarked)}
            style={({ pressed }) => [
              styles.heroCircleBtn,
              heroBookmarked && styles.heroCircleBtnBookmarked,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: heroBookmarked }}
            accessibilityLabel={heroBookmarked ? 'Remove bookmark' : 'Bookmark property'}
          >
            <Ionicons
              name={heroBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={heroBookmarked ? '#FBBF24' : '#FFFFFF'}
            />
          </Pressable>
        </View>

        <View style={[styles.dotsRow, { bottom: 16 }]}>
          {gallery.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === slideIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: footerPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>{d.title}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{badgeLabel}</Text>
            </View>
          </View>
          <View
            style={styles.locationRow}
            accessible
            accessibilityRole="text"
            accessibilityLabel={locationSubtitle}
          >
            <View style={styles.locationIconBubble}>
              <Ionicons name="location" size={18} color={ACCENT} />
            </View>
            <View style={styles.locationTextBlock}>
              <Text style={styles.locationEyebrow}>Location</Text>
              <Text style={styles.locationLine} numberOfLines={2}>
                {locationSubtitle}
              </Text>
            </View>
          </View>

          <View style={styles.quickStatsRow}>
            {isOffice ? (
              <>
                <QuickStat icon="resize-outline" value={shortenLabel(d.carpetArea.replace(/carpet area/i, ''), 14)} sublabel="Area" />
                <QuickStat icon="people-outline" value={shortenLabel(d.cabinsSeats.split('·')[0]?.trim() || '—', 14)} sublabel="Layout" />
                <QuickStat icon="restaurant-outline" value={shortenLabel(d.pantryToilet.split('·')[0]?.trim() || '—', 14)} sublabel="Pantry" />
              </>
            ) : (
              <>
                <QuickStat
                  icon="bed-outline"
                  value={bhkN === '0' ? 'Studio' : `${bhkN} Beds`}
                  sublabel="Bedrooms"
                />
                <QuickStat icon="water-outline" value={`${bathN} bath`} sublabel="Bathrooms" />
                <QuickStat
                  icon="expand-outline"
                  value={shortenLabel(d.carpetArea.replace(/\s*carpet area\s*/i, ' ').trim(), 12)}
                  sublabel="Area"
                />
              </>
            )}
          </View>

          <View style={styles.ownerCard}>
            <Image source={{ uri: d.ownerAvatar }} style={styles.ownerAvatar} />
            <View style={styles.ownerText}>
              <Text style={styles.ownerName}>{d.ownerName}</Text>
              <Text style={styles.ownerRole}>Owner</Text>
            </View>
            <View style={styles.ownerActions}>
              <Pressable
                onPress={onContactPress}
                style={({ pressed }) => [styles.ownerIconBtn, pressed && styles.pressed]}
                accessibilityLabel="Chat"
              >
                <Ionicons name="chatbubble-outline" size={20} color={ACCENT} />
              </Pressable>
              <Pressable
                onPress={onContactPress}
                style={({ pressed }) => [styles.ownerIconBtn, pressed && styles.pressed]}
                accessibilityLabel="Call"
              >
                <Ionicons name="call-outline" size={20} color={ACCENT} />
              </Pressable>
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionHeading}>Overview</Text>
            <Text style={styles.overviewBody} numberOfLines={overviewExpanded ? undefined : 4}>
              {d.description}
            </Text>
            <Pressable onPress={() => setOverviewExpanded(!overviewExpanded)} hitSlop={8}>
              <Text style={styles.readMore}>{overviewExpanded ? 'Show less' : 'Read more...'}</Text>
            </Pressable>
          </View>

          {!isOffice ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Facilities</Text>
              <View style={styles.facilityGrid}>
                <SpecFacilityItem icon="bed-outline" value={d.bhkConfiguration} />
                <SpecFacilityItem icon="compass-outline" value={d.facing} />
                <SpecFacilityItem icon="layers-outline" value={d.floorDetails} />
                <SpecFacilityItem icon="color-wand-outline" value={d.furnishing} />
                <SpecFacilityItem icon="water-outline" value={d.bathroomsDisplay} />
                <SpecFacilityItem icon="home-outline" value={d.balconies} />
                <SpecFacilityItem icon="swap-vertical-outline" value={d.liftDetails} />
                <SpecFacilityItem icon="resize-outline" value={areaInGazShort(d.carpetArea)} />
              </View>
            </View>
          ) : null}

          <View style={styles.sectionBlock}>
            <View style={styles.galleryHeader}>
              <Text style={styles.galleryTitle}>Gallery</Text>
              <Pressable onPress={() => galleryRowRef.current?.scrollToEnd({ animated: true })}>
                <Text style={styles.seeAll}>See All</Text>
              </Pressable>
            </View>
            <ScrollView
              ref={galleryRowRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryScroll}
            >
              {gallery.map((uri, gi) => (
                <Pressable
                  key={`${uri}-${gi}`}
                  onPress={() => openGalleryLightbox(gi)}
                  style={({ pressed }) => [pressed && styles.galleryThumbPressed]}
                  accessibilityRole="imagebutton"
                  accessibilityLabel={`Open gallery image ${gi + 1} of ${gallery.length}`}
                >
                  <Image source={{ uri }} style={styles.galleryThumb} />
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {d.amenities?.length ? (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeading}>Amenities</Text>
              <View style={styles.facilityGrid}>
                {d.amenities.map((item, i) => (
                  <AmenityFeatureItem key={`${item}-${i}`} name={item} />
                ))}
              </View>
            </View>
          ) : null}

          <View style={{ height: 8 }} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.footerInner}>
          <View style={styles.footerPrice}>
            <Text style={styles.footerPriceLabel}>Price</Text>
            <View style={styles.footerPriceRow}>
              <Text style={styles.footerAmount}>₹{d.price}</Text>
              <Text style={styles.footerPeriod}> / month</Text>
            </View>
          </View>
          <Pressable
            onPress={() => setBookingModalVisible(true)}
            style={({ pressed }) => [styles.bookingBtnWrap, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Booking now"
          >
            <View style={styles.bookingBtn}>
              <Text style={styles.bookingBtnText}>Contact Now</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.bookingModalRoot}>
          <Pressable
            style={styles.bookingModalBackdrop}
            onPress={() => setBookingModalVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Close"
          />
          <View
            style={[
              styles.bookingModalSheet,
              {
                paddingBottom: 16 + insets.bottom,
                maxHeight: windowHeight * 0.92,
              },
            ]}
          >
            <View style={styles.bookingModalHandle} />

            <View style={styles.bookingModalHeader}>
              <View style={styles.bookingModalHeaderText}>
                <Text style={styles.bookingModalEyebrow}>
                  {subscribed ? 'Get in touch' : 'Subscription'}
                </Text>
                <Text style={styles.bookingModalTitle}>
                  {subscribed ? 'Contact the owner' : 'Unlock contact details'}
                </Text>
              </View>
              <Pressable
                onPress={() => setBookingModalVisible(false)}
                hitSlop={12}
                style={({ pressed }) => [styles.bookingModalCloseBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color={TEXT.secondary} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.bookingModalScrollContent}
            >
              {subscribed ? (
                <>
                  <View style={styles.bookingOwnerCard}>
                    <Image source={{ uri: d.ownerAvatar }} style={styles.bookingOwnerAvatar} />
                    <View style={styles.bookingOwnerText}>
                      <Text style={styles.bookingOwnerName} numberOfLines={2}>
                        {d.ownerName}
                      </Text>
                      <View style={styles.bookingOwnerMeta}>
                        <View style={styles.bookingVerifiedPill}>
                          <Ionicons name="shield-checkmark" size={13} color={ACCENT} />
                          <Text style={styles.bookingVerifiedText}>Verified</Text>
                        </View>
                        <Text style={styles.bookingOwnerRole}>Property owner</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.bookingSectionLabel}>Property address</Text>
                  <View style={styles.bookingAddressCard}>
                    <View style={styles.bookingAddressIconWrap}>
                      <Ionicons name="map-outline" size={22} color={ACCENT} />
                    </View>
                    <View style={styles.bookingAddressTextWrap}>
                      <Text style={styles.bookingAddressLine}>{d.addressLine}</Text>
                      <Text style={styles.bookingAddressFull}>{d.fullAddress}</Text>
                    </View>
                  </View>

                  <Text style={styles.bookingSectionLabel}>Phone number</Text>
                  <Pressable
                    onPress={openPhoneDialer}
                    disabled={!ownerDigits}
                    style={({ pressed }) => [
                      styles.bookingPhoneCard,
                      pressed && ownerDigits && styles.bookingPhoneCardPressed,
                      !ownerDigits && styles.bookingPhoneRowDisabled,
                    ]}
                  >
                    <View style={styles.bookingPhoneIconWrap}>
                      <Ionicons name="call-outline" size={22} color={ACCENT} />
                    </View>
                    <View style={styles.bookingPhoneTextCol}>
                      <Text style={styles.bookingPhoneLabel}>Tap to call</Text>
                      <Text style={styles.bookingPhoneText}>{d.ownerPhone || '—'}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={TEXT.tertiary} />
                  </Pressable>

                  <Text style={styles.bookingActionsHint}>Choose how you would like to connect</Text>
                  <Pressable
                    onPress={openWhatsApp}
                    disabled={!ownerDigits}
                    style={({ pressed }) => [
                      styles.shareChannelRow,
                      pressed && ownerDigits && styles.shareChannelRowPressed,
                      !ownerDigits && styles.bookingActionDisabled,
                    ]}
                  >
                    <View style={[styles.shareChannelIcon, styles.shareChannelIconWa]}>
                      <Ionicons name="logo-whatsapp" size={26} color={WHATSAPP_GREEN} />
                    </View>
                    <View style={styles.shareChannelTextCol}>
                      <Text style={styles.shareChannelTitle}>WhatsApp</Text>
                      <Text style={styles.shareChannelSub}>Message the owner in WhatsApp</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={TEXT.tertiary} />
                  </Pressable>

                  <Pressable
                    onPress={openPhoneDialer}
                    disabled={!ownerDigits}
                    style={({ pressed }) => [
                      styles.shareChannelRow,
                      styles.shareChannelRowPressedLast,
                      pressed && ownerDigits && styles.shareChannelRowPressed,
                      !ownerDigits && styles.bookingActionDisabled,
                    ]}
                  >
                    <View style={[styles.shareChannelIcon, styles.shareChannelIconPhone]}>
                      <Ionicons name="call-outline" size={26} color={ACCENT} />
                    </View>
                    <View style={styles.shareChannelTextCol}>
                      <Text style={styles.shareChannelTitle}>Call now</Text>
                      <Text style={styles.shareChannelSub}>Place a voice call to the owner</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={TEXT.tertiary} />
                  </Pressable>
                </>
              ) : (
                <>


                  <View style={styles.subscribePlansHeader}>
                    <Text style={styles.subscribePlansHeading}>Choose your plan</Text>
                    <View style={styles.secureChip}>
                      <Ionicons name="lock-closed" size={11} color={ACCENT} />
                      <Text style={styles.secureChipText}>Secure payment</Text>
                    </View>
                  </View>

                  {CONTACT_VIEW_PLANS.map((plan, pi) => (
                    <Pressable
                      key={plan.id}
                      onPress={() => setSubscribed(false)}
                      style={({ pressed }) => [
                        styles.planCard,
                        plan.recommended && styles.planCardRecommended,
                        pi === CONTACT_VIEW_PLANS.length - 1 && styles.planCardLast,
                        pressed && styles.planCardPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`${plan.tier} plan — ${plan.views} contact views for ₹${plan.price}`}
                    >
                      {plan.recommended ? (
                        <LinearGradient
                          colors={['#1D4ED8', '#3B82F6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.planCardBadgeBar}
                        >
                          <Ionicons name="star" size={11} color="#FCD34D" />
                          <Text style={styles.planCardBadgeText}>MOST POPULAR</Text>
                          <Ionicons name="star" size={11} color="#FCD34D" />
                        </LinearGradient>
                      ) : null}

                      <View style={styles.planCardBody}>
                        <View style={styles.planCardLeft}>
                          <Text style={styles.planTierName}>{plan.tier}</Text>
                          <View style={styles.planPriceRow}>
                            <Text style={styles.planCurrencySymbol}>₹</Text>
                            <Text style={[styles.planPriceAmount, plan.recommended && styles.planPriceAmountHighlighted]}>
                              {plan.price}
                            </Text>
                          </View>
                          <Text style={styles.planPerView}>{plan.perView}</Text>
                        </View>

                        <View style={styles.planCardDivider} />

                        <View style={styles.planCardRight}>
                          {plan.features.map((feat, fi) => (
                            <View key={fi} style={styles.planFeatureRow}>
                              <View style={[styles.planFeatureCheck, plan.recommended && styles.planFeatureCheckHighlighted]}>
                                <Ionicons name="checkmark" size={11} color={plan.recommended ? '#FFFFFF' : ACCENT} />
                              </View>
                              <Text style={styles.planFeatureText} numberOfLines={2}>{feat}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {plan.recommended ? (
                        <LinearGradient
                          colors={['#1D4ED8', '#3B82F6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.planCardCtaBtn}
                        >
                          <Text style={styles.planCardCtaBtnText}>Get Started</Text>
                          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                        </LinearGradient>
                      ) : (
                        <View style={styles.planCardCtaBtnOutline}>
                          <Text style={styles.planCardCtaBtnOutlineText}>Select Plan</Text>
                          <Ionicons name="arrow-forward" size={16} color={ACCENT} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={shareModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeShareModal}
      >
        <View style={styles.bookingModalRoot}>
          <Pressable
            style={styles.bookingModalBackdrop}
            onPress={closeShareModal}
            accessibilityRole="button"
            accessibilityLabel="Close share"
          />
          <View style={[styles.shareModalSheet, { paddingBottom: 20 + insets.bottom }]}>
            <View style={styles.bookingModalHandle} />
            <View style={styles.shareModalHeader}>
              <Text style={styles.shareModalTitle}>Share listing</Text>
              <Pressable
                onPress={closeShareModal}
                hitSlop={12}
                style={({ pressed }) => [styles.bookingModalCloseBtn, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color={TEXT.secondary} />
              </Pressable>
            </View>
            <Text style={styles.shareModalSubtitle}>Send this property to friends or family</Text>

            <Pressable
              onPress={shareViaWhatsAppApp}
              style={({ pressed }) => [styles.shareChannelRow, pressed && styles.shareChannelRowPressed]}
            >
              <View style={[styles.shareChannelIcon, styles.shareChannelIconWa]}>
                <Ionicons name="logo-whatsapp" size={26} color={WHATSAPP_GREEN} />
              </View>
              <View style={styles.shareChannelTextCol}>
                <Text style={styles.shareChannelTitle}>WhatsApp</Text>
                <Text style={styles.shareChannelSub}>Share in a chat or group</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEXT.tertiary} />
            </Pressable>

            <Pressable
              onPress={shareViaInstagram}
              style={({ pressed }) => [styles.shareChannelRow, pressed && styles.shareChannelRowPressed]}
            >
              <View style={[styles.shareChannelIcon, styles.shareChannelIconIg]}>
                <Ionicons name="logo-instagram" size={26} color={INSTAGRAM_ROSE} />
              </View>
              <View style={styles.shareChannelTextCol}>
                <Text style={styles.shareChannelTitle}>Instagram</Text>
                <Text style={styles.shareChannelSub}>Copy text, then open Instagram to paste</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEXT.tertiary} />
            </Pressable>

            <Pressable
              onPress={shareViaFacebook}
              style={({ pressed }) => [styles.shareChannelRow, pressed && styles.shareChannelRowPressed]}
            >
              <View style={[styles.shareChannelIcon, styles.shareChannelIconFb]}>
                <Ionicons name="logo-facebook" size={26} color={FACEBOOK_BLUE} />
              </View>
              <View style={styles.shareChannelTextCol}>
                <Text style={styles.shareChannelTitle}>Facebook</Text>
                <Text style={styles.shareChannelSub}>Open Facebook share dialog</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEXT.tertiary} />
            </Pressable>

            <Pressable
              onPress={shareViaSms}
              style={({ pressed }) => [styles.shareChannelRow, pressed && styles.shareChannelRowPressed]}
            >
              <View style={[styles.shareChannelIcon, styles.shareChannelIconSms]}>
                <Ionicons name="chatbox-ellipses-outline" size={24} color={ACCENT} />
              </View>
              <View style={styles.shareChannelTextCol}>
                <Text style={styles.shareChannelTitle}>SMS</Text>
                <Text style={styles.shareChannelSub}>Send as a text message</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={TEXT.tertiary} />
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={galleryLightboxVisible}
        animationType="fade"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={closeGalleryLightbox}
      >
        <View style={styles.galleryLightboxRoot}>
          <StatusBar style="light" />
          <FlatList
            ref={galleryLightboxListRef}
            data={gallery}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(uri, i) => `${uri}-${i}`}
            initialScrollIndex={galleryLightboxIndex}
            getItemLayout={(_, index) => ({
              length: windowWidth,
              offset: windowWidth * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              requestAnimationFrame(() => {
                galleryLightboxListRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                });
              });
            }}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
              setGalleryLightboxSlideIndex(Math.max(0, Math.min(i, gallery.length - 1)));
            }}
            renderItem={({ item: uri }) => (
              <View style={[styles.galleryLightboxPage, { width: windowWidth, height: windowHeight }]}>
                {Platform.OS === 'ios' ? (
                  <ScrollView
                    style={styles.galleryLightboxZoomScroll}
                    contentContainerStyle={[
                      styles.galleryLightboxZoomContent,
                      { width: windowWidth, height: windowHeight },
                    ]}
                    maximumZoomScale={4}
                    minimumZoomScale={1}
                    centerContent
                    bouncesZoom
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  >
                    <Image
                      source={{ uri }}
                      style={[styles.galleryLightboxImage, { width: windowWidth, height: windowHeight }]}
                      resizeMode="contain"
                    />
                  </ScrollView>
                ) : (
                  <Image
                    source={{ uri }}
                    style={[styles.galleryLightboxImage, { width: windowWidth, height: windowHeight }]}
                    resizeMode="contain"
                  />
                )}
              </View>
            )}
          />

          <View
            style={[styles.galleryLightboxChrome, { paddingTop: insets.top + 8 }]}
            pointerEvents="box-none"
          >
            <Pressable
              onPress={closeGalleryLightbox}
              hitSlop={12}
              style={({ pressed }) => [styles.galleryLightboxCloseBtn, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel="Close gallery"
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.galleryLightboxCounter}>
              {galleryLightboxSlideIndex + 1} / {gallery.length}
            </Text>
            <View style={styles.galleryLightboxChromeSpacer} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  carouselSection: {
    position: 'relative',
  },
  /** Pinned hero: not inside vertical ScrollView so it stays visible while content scrolls */
  carouselSectionFixed: {
    width: '100%',
    flexShrink: 0,
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  carouselSlide: {
    justifyContent: 'flex-end',
  },
  backFab: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroTopActions: {
    position: 'absolute',
    right: 16,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  heroCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroCircleBtnBookmarked: {
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderColor: 'rgba(251, 191, 36, 0.55)',
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 22,
    backgroundColor: ACCENT,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  sheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: H_PAD,
    paddingTop: 22,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.6,
    lineHeight: 30,
    marginTop: 22,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  typeBadge: {
    backgroundColor: ICON_BUBBLE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: ACCENT,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
    borderRadius: 16,
    backgroundColor: ICON_BUBBLE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(37, 99, 235, 0.14)',
  },
  locationIconBubble: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_DEEP,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  locationTextBlock: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  locationEyebrow: {
    fontSize: 8,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  locationLine: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT.primary,
    lineHeight: 20,
    letterSpacing: -0.3,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.primary,
  },
  ratingMuted: {
    fontWeight: '500',
    color: TEXT.secondary,
    fontSize: 13,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 8,
    gap: 8,
  },
  quickStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  quickStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ICON_BUBBLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatText: {
    flex: 1,
    minWidth: 0,
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.2,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT.secondary,
    marginTop: 2,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  ownerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: ICON_BUBBLE,
  },
  ownerText: {
    flex: 1,
    marginLeft: 14,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.3,
  },
  ownerRole: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT.secondary,
    marginTop: 2,
  },
  ownerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  ownerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SURFACE,
  },
  sectionBlock: {
    marginTop: 22,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  overviewBody: {
    fontSize: 14,
    fontWeight: '400',
    color: TEXT.secondary,
    lineHeight: 22,
  },
  readMore: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
  },
  facilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  facilityCell: {
    width: '25%',
    paddingHorizontal: 6,
    marginBottom: 16,
    alignItems: 'center',
  },
  specFacilityCell: {
    width: '25%',
    paddingHorizontal: 4,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  specFacilityIconCircle: {
    marginBottom: 10,
  },
  specFacilityDetail: {
    fontSize: 11,
    fontWeight: '500',
    color: TEXT.secondary,
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: -0.2,
    width: '100%',
    paddingHorizontal: 2,
  },
  facilityIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ICON_BUBBLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  facilityLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT.primary,
    textAlign: 'center',
    lineHeight: 14,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.4,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCENT,
  },
  galleryScroll: {
    gap: 10,
    paddingTop: 8,
  },
  galleryThumb: {
    width: 100,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
  },
  galleryThumbPressed: {
    opacity: 0.88,
  },
  galleryLightboxRoot: {
    flex: 1,
    backgroundColor: '#000000',
  },
  galleryLightboxPage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  galleryLightboxZoomScroll: {
    width: '100%',
    height: '100%',
  },
  galleryLightboxZoomContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryLightboxImage: {
    backgroundColor: '#000000',
  },
  galleryLightboxChrome: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  galleryLightboxCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  galleryLightboxCounter: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
    letterSpacing: 0.2,
  },
  galleryLightboxChromeSpacer: {
    width: 44,
    height: 44,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: SURFACE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: H_PAD,
    paddingTop: 18,
    paddingBottom: 4,
    gap: 16,
  },
  footerPrice: {
    flex: 1,
    minWidth: 0,
  },
  footerPriceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: TEXT.tertiary,
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  footerAmount: {
    fontSize: 28,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: -0.8,
  },
  footerPeriod: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT.secondary,
    letterSpacing: -0.2,
  },
  bookingBtnWrap: {
    flexShrink: 0,

  },
  bookingBtn: {
    backgroundColor: ACCENT,
    paddingVertical: 16,
    paddingHorizontal: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  bookingBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  bookingModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bookingModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  bookingModalSheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: H_PAD,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: { elevation: 24 },
      default: {},
    }),
  },
  bookingModalHandle: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    marginBottom: 10,
  },
  bookingModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 4,
  },
  bookingModalHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  bookingModalEyebrow: {
    fontSize: 11,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bookingModalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.6,
    lineHeight: 28,
  },
  bookingModalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  shareModalSheet: {
    backgroundColor: SURFACE,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: H_PAD,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
      },
      android: { elevation: 24 },
      default: {},
    }),
  },
  shareModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingTop: 4,
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.5,
  },
  shareModalSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT.secondary,
    marginBottom: 18,
    lineHeight: 20,
  },
  shareChannelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  shareChannelRowPressed: {
    backgroundColor: '#F1F5F9',
  },
  shareChannelRowPressedLast: {
    marginBottom: 0,
  },
  shareChannelIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareChannelIconWa: {
    backgroundColor: 'rgba(37, 211, 102, 0.12)',
  },
  shareChannelIconIg: {
    backgroundColor: 'rgba(228, 64, 95, 0.12)',
  },
  shareChannelIconFb: {
    backgroundColor: 'rgba(24, 119, 242, 0.12)',
  },
  shareChannelIconSms: {
    backgroundColor: ICON_BUBBLE,
  },
  shareChannelIconPhone: {
    width: 52,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  shareChannelTextCol: {
    flex: 1,
    minWidth: 0,
  },
  shareChannelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.3,
  },
  shareChannelSub: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: '500',
    color: TEXT.tertiary,
    lineHeight: 18,
  },
  bookingModalScrollContent: {
    paddingBottom: 8,
  },
  subscribeHeroCard: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#1D4ED8',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  subscribeGateIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  subscribeGateTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 25,
    marginBottom: 8,
  },
  subscribeGateSub: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },
  subscribePlansHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscribePlansHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT.primary,
    letterSpacing: -0.4,
  },
  secureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(37, 99, 235, 0.18)',
  },
  secureChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: -0.1,
  },
  planCard: {
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.07)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  planCardRecommended: {
    borderColor: '#2563EB',
    borderWidth: 1.5,
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  planCardLast: {
    marginBottom: 0,
  },
  planCardPressed: {
    opacity: 0.92,
  },
  planCardBadgeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
  },
  planCardBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  planCardBody: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 16,
    gap: 0,
  },
  planCardLeft: {
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 12,
  },
  planTierName: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT.secondary,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 1,
  },
  planCurrencySymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT.primary,
    marginTop: 5,
  },
  planPriceAmount: {
    fontSize: 38,
    fontWeight: '800',
    color: TEXT.primary,
    letterSpacing: -2,
    lineHeight: 44,
  },
  planPriceAmountHighlighted: {
    color: '#1D4ED8',
  },
  planPerView: {
    fontSize: 11,
    fontWeight: '500',
    color: TEXT.tertiary,
    marginTop: 3,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  planCardDivider: {
    width: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.07)',
    marginHorizontal: 4,
    borderRadius: 1,
  },
  planCardRight: {
    flex: 1,
    paddingLeft: 14,
    gap: 8,
    justifyContent: 'center',
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  planFeatureCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  planFeatureCheckHighlighted: {
    backgroundColor: ACCENT,
  },
  planFeatureText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: TEXT.secondary,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  planCardCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 13,
    borderRadius: 14,
  },
  planCardCtaBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  planCardCtaBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.35)',
    backgroundColor: 'rgba(37, 99, 235, 0.04)',
  },
  planCardCtaBtnOutlineText: {
    fontSize: 15,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: -0.2,
  },
  bookingOwnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 22,
    padding: 16,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  bookingOwnerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: ICON_BUBBLE,
    borderWidth: 3,
    borderColor: SURFACE,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  bookingOwnerText: {
    flex: 1,
    minWidth: 0,
  },
  bookingOwnerName: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.35,
    lineHeight: 22,
  },
  bookingOwnerMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  bookingVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  bookingVerifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: -0.1,
  },
  bookingOwnerRole: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT.tertiary,
  },
  bookingSectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT.tertiary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bookingAddressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: SURFACE,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  bookingAddressIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: ICON_BUBBLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingAddressTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingTop: 2,
  },
  bookingAddressLine: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT.primary,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  bookingAddressFull: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT.secondary,
    lineHeight: 20,
  },
  bookingPhoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(37, 99, 235, 0.2)',
  },
  bookingPhoneCardPressed: {
    backgroundColor: 'rgba(37, 99, 235, 0.06)',
  },
  bookingPhoneRowDisabled: {
    opacity: 0.45,
  },
  bookingPhoneIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(37, 99, 235, 0.15)',
  },
  bookingPhoneTextCol: {
    flex: 1,
    minWidth: 0,
  },
  bookingPhoneLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT.tertiary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bookingPhoneText: {
    fontSize: 17,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.3,
  },
  bookingActionsHint: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT.secondary,
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  bookingActionDisabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.88,
  },
});
