import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT, TEXT } from '../theme/colors';

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
 * @property {string} price
 * @property {string} [period]
 * @property {string} [rating]
 */

function IconStat({ icon, value }) {
  return (
    <View style={styles.iconStat}>
      <Ionicons name={icon} size={13} color={ACCENT} />
      <Text style={styles.iconStatText} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

/**
 * @param {{ property: PropertyListing; onPress?: () => void; style?: object; variant?: 'default' | 'featured' }} props
 */
export function PropertyCard({ property, onPress, style, variant = 'default' }) {
  const { title, image, carpetArea, bhk, bathrooms, area, price, period = '/mo', rating } = property;
  const featured = variant === 'featured';

  const bhkN = bhk.match(/\d+/)?.[0];
  const bhkShort = bhkN ? `${bhkN} BR` : bhk;
  const bathNum = bathrooms.match(/\d+/)?.[0];
  const bathShort = bathNum ? `${bathNum} bt` : bathrooms;

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
      <View style={[styles.glassInner, featured && styles.glassInnerFeatured]}>
        <Text style={[styles.title, featured && styles.titleFeatured]} numberOfLines={featured ? 2 : 1}>
          {title}
        </Text>

        <View style={styles.statsRow}>
          <IconStat icon="square-outline" value={compactCarpet(carpetArea)} />
          <Text style={styles.statDot}>·</Text>
          <IconStat icon="bed-outline" value={bhkShort} />
          <Text style={styles.statDot}>·</Text>
          <IconStat icon="water-outline" value={bathShort} />
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={ACCENT} style={styles.locationIcon} />
          <Text style={styles.locationText} numberOfLines={2}>
            {area}
          </Text>
        </View>

        <View style={[styles.bottomRow, featured && styles.bottomRowFeatured]}>
          <View style={styles.priceWrap}>
            <Text style={[styles.price, featured && styles.priceFeatured]}>{price}</Text>
            <Text style={styles.period}>{period}</Text>
          </View>
          <Ionicons name="chevron-forward" size={featured ? 20 : 18} color="#64748B" />
        </View>
      </View>
    </View>
  );

  const radius = featured ? styles.radiusFeatured : styles.radiusDefault;

  return (
    <TouchableOpacity style={[styles.card, featured && styles.cardFeatured, style]} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageWrap}>
        <ImageBackground
          source={{ uri: image }}
          style={[styles.imageBg, featured && styles.imageBgFeatured]}
          imageStyle={radius}
        >
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.38)']} style={[styles.imageFade, radius]} />
          {rating ? (
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={11} color="#FBBF24" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          ) : null}
        </ImageBackground>
      </View>

      {Platform.OS === 'web' ? (
        <View style={[styles.glassBlur, styles.glassWeb, featured && styles.glassBlurFeatured]}>{glassBody}</View>
      ) : (
        <BlurView intensity={featured ? 52 : 48} tint="light" style={[styles.glassBlur, featured && styles.glassBlurFeatured]}>
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
  radiusDefault: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  radiusFeatured: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
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
  imageFade: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  ratingPill: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
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
  title: {
    fontSize: 14,
    fontWeight: '700',
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
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
  statDot: {
    color: '#94A3B8',
    fontSize: 11,
    marginHorizontal: 5,
    fontWeight: '700',
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
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: ACCENT,
    letterSpacing: -0.45,
  },
  priceFeatured: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  period: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT.tertiary,
    marginLeft: 5,
  },
});
