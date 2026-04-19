import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT, ACCENT_DEEP, ACCENT_LIGHT, TEXT } from '../theme/colors';

/** Shorten carpet string for compact row e.g. "1,450 sq ft" → "1,450 sf" */
function compactCarpet(s) {
  return s.replace(/\s*sq\s*ft\s*$/i, ' sf').replace(/\s+/g, ' ');
}

/**
 * @typedef {object} PropertyListing
 * @property {string} id
 * @property {string} title
 * @property {string} image
 * @property {string} carpetArea
 * @property {string} bhk
 * @property {string} bathrooms
 * @property {string} area
 * @property {string} price — amount only (e.g. "4,200"); ₹ badge is rendered in the card
 * @property {string} [period]
 * @property {string} [postedDate] — shown on image (e.g. "8 Apr 2026")
 */

function IconStat({ icon, value, iconSize = 13, numberOfLines = 1, compact }) {
  return (
    <View style={styles.iconStat}>
      <Ionicons name={icon} size={iconSize} color={ACCENT} />
      <Text style={[styles.iconStatText, compact && styles.iconStatTextCompact]} numberOfLines={numberOfLines}>
        {value}
      </Text>
    </View>
  );
}

/**
 * @param {{ property: PropertyListing; onPress?: () => void; style?: object; variant?: 'default' | 'featured' | 'listing' }} props
 */
export function PropertyCard({ property, onPress, style, variant = 'default' }) {
  const { title, image, carpetArea, bhk, bathrooms, area, price, period = '/mo', postedDate } = property;
  const featured = variant === 'featured';
  const listing = variant === 'listing';

  const bhkN = bhk.match(/\d+/)?.[0];
  const bhkShort = listing
    ? bhkN === '0'
      ? 'Studio / open plan'
      : bhkN
        ? `${bhkN} Bedroom${bhkN === '1' ? '' : 's'}`
        : bhk
    : bhkN
      ? `${bhkN} BR`
      : bhk;
  const bathNum = bathrooms.match(/\d+/)?.[0];
  const bathShort = listing
    ? bathNum === '0'
      ? 'No on-unit WC'
      : bathNum
        ? `${bathNum} toilet${bathNum === '1' ? '' : 's'}`
        : bathrooms
    : bathNum
      ? `${bathNum} bt`
      : bathrooms;

  const glassBody = (
    <View style={styles.glassContentWrap}>
      <LinearGradient
        colors={['rgba(255,255,255,0.95)', 'rgba(248,250,252,0.9)', 'rgba(30,64,175,0.06)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.glassSheen}
        pointerEvents="none"
      />
      <View style={[styles.glassInner, featured && styles.glassInnerFeatured, listing && styles.glassInnerListing]}>
        <Text style={[styles.title, featured && styles.titleFeatured, listing && styles.titleListing]} numberOfLines={featured || listing ? 2 : 1}>
          {title}
        </Text>

        <View style={[styles.statsRow, listing && styles.statsRowListing]}>
          <IconStat icon="bed-outline" value={bhkShort} iconSize={13} compact={listing} />
          <Text style={styles.statDot}>·</Text>
          <IconStat icon="water-outline" value={bathShort} iconSize={13} compact={listing} />
          <Text style={styles.statDot}>·</Text>
          <IconStat
            icon="square-outline"
            value={listing ? carpetArea : compactCarpet(carpetArea)}
            iconSize={13}
            numberOfLines={listing ? 2 : 1}
            compact={listing}
          />
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={listing ? 12 : 14} color={ACCENT} style={styles.locationIcon} />
          <Text style={[styles.locationText, listing && styles.locationTextListing]} numberOfLines={2}>
            {area}
          </Text>
        </View>

        <View style={[styles.bottomRow, featured && styles.bottomRowFeatured, listing && styles.bottomRowListing]}>
          <View style={styles.priceWrap}>
            <LinearGradient
              colors={[ACCENT_DEEP, ACCENT, ACCENT_LIGHT]}
              locations={[0, 0.45, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.rupeeBadge,
                featured && styles.rupeeBadgeFeatured,
                listing && styles.rupeeBadgeListing,
              ]}
            >
              <Text style={[styles.rupeeSymbol, featured && styles.rupeeSymbolFeatured, listing && styles.rupeeSymbolListing]}>
                ₹
              </Text>
            </LinearGradient>
            <View style={styles.priceTextCluster}>
              <View style={styles.priceMainRow}>
                <Text style={[styles.price, featured && styles.priceFeatured, listing && styles.priceListing]}>{price}</Text>
                <Text style={[styles.period, listing && styles.periodListing]}>{listing ? '/ month' : period}</Text>
              </View>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={featured ? 20 : listing ? 16 : 18} color="#64748B" />
        </View>
      </View>
    </View>
  );

  const radius = featured ? styles.radiusFeatured : listing ? styles.radiusListing : styles.radiusDefault;
  const imageHeightStyle = featured ? styles.imageBgFeatured : listing ? styles.imageBgListing : null;

  return (
    <TouchableOpacity
      style={[styles.card, featured && styles.cardFeatured, listing && styles.cardListing, style]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrap}>
        <ImageBackground
          source={{ uri: image }}
          style={[styles.imageBg, imageHeightStyle]}
          imageStyle={radius}
        >
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.38)']} style={[styles.imageFade, radius, listing && styles.imageFadeListing]} />
          {postedDate ? (
            <View style={styles.postedPill}>
              <Ionicons name="calendar-outline" size={12} color="#C7D2FE" />
              <View style={styles.postedPillTextCol}>
                <Text style={styles.postedPillLabel}>Posted</Text>
                <Text style={styles.postedPillDate}>{postedDate}</Text>
              </View>
            </View>
          ) : null}
        </ImageBackground>
      </View>

      {Platform.OS === 'web' ? (
        <View style={[styles.glassBlur, styles.glassWeb, featured && styles.glassBlurFeatured, listing && styles.glassBlurListing]}>
          {glassBody}
        </View>
      ) : (
        <BlurView
          intensity={featured ? 52 : listing ? 50 : 48}
          tint="light"
          style={[styles.glassBlur, featured && styles.glassBlurFeatured, listing && styles.glassBlurListing]}
        >
          {glassBody}
        </BlurView>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#fff',
    borderColor: 'rgba(15, 23, 42, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  cardFeatured: {
    borderRadius: 18,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 5 },
      default: {},
    }),
  },
  cardListing: {
    borderRadius: 20,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  radiusDefault: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  radiusFeatured: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  radiusListing: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageWrap: {
    width: '100%',
  },
  imageBg: {
    height: 108,
    width: '100%',
  },
  imageBgFeatured: {
    height: 156,
  },
  imageBgListing: {
    height: 148,
  },
  imageFade: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  imageFadeListing: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  postedPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxWidth: '72%',
    gap: 8,
  },
  postedPillTextCol: {
    flexShrink: 1,
  },
  postedPillLabel: {
    color: 'rgba(226, 232, 240, 0.85)',
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  postedPillDate: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: -0.15,
    marginTop: 1,
  },
  glassBlur: {
    overflow: 'hidden',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  glassBlurFeatured: {
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  glassBlurListing: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  glassWeb: {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
  },
  glassContentWrap: {
    position: 'relative',
  },
  glassSheen: {
    ...StyleSheet.absoluteFillObject,
  },
  glassInner: {
    paddingHorizontal: 11,
    paddingVertical: 9,
    paddingBottom: 10,
    zIndex: 1,
  },
  glassInnerFeatured: {
    paddingHorizontal: 13,
    paddingVertical: 11,
    paddingBottom: 11,
  },
  glassInnerListing: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT.primary,
    letterSpacing: -0.25,
    lineHeight: 19,
    marginBottom: 7,
  },
  titleFeatured: {
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.35,
    marginBottom: 8,
  },
  titleListing: {
    fontSize: 13,
    lineHeight: 17,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  statsRowListing: {
    marginBottom: 6,
  },
  iconStat: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT.secondary,
    marginLeft: 4,
    flexShrink: 1,
  },
  iconStatTextCompact: {
    fontSize: 10,
    lineHeight: 13,
  },
  statDot: {
    color: '#94A3B8',
    fontSize: 11,
    marginHorizontal: 5,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingTop: 2,
  },
  locationIcon: {
    marginTop: 1,
    marginRight: 6,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: TEXT.secondary,
    lineHeight: 17,
  },
  locationTextListing: {
    fontSize: 11,
    lineHeight: 15,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
    paddingTop: 7,
    marginHorizontal: -11,
    paddingHorizontal: 11,
  },
  bottomRowFeatured: {
    marginHorizontal: -13,
    paddingHorizontal: 13,
    paddingTop: 8,
  },
  bottomRowListing: {
    marginHorizontal: -14,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 11,
  },
  rupeeBadge: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    ...Platform.select({
      ios: {
        shadowColor: '#1E3A8A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  rupeeBadgeFeatured: {
    width: 38,
    height: 38,
    borderRadius: 12,
  },
  rupeeBadgeListing: {
    width: 30,
    height: 30,
    borderRadius: 9,
  },
  rupeeSymbol: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.5,
    ...Platform.select({
      ios: { marginTop: 1 },
      default: {},
    }),
  },
  rupeeSymbolFeatured: {
    fontSize: 19,
  },
  rupeeSymbolListing: {
    fontSize: 15,
  },
  priceTextCluster: {
    flexShrink: 1,
    minWidth: 0,
  },
  priceMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: -0.45,
  },
  priceFeatured: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  priceListing: {
    fontSize: 16,
  },
  period: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT.tertiary,
  },
  periodListing: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT.secondary,
  },
});
