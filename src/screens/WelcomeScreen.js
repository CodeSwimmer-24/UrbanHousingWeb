import { ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT, ACCENT_DARK } from '../theme/colors';

/** City skyline at dusk — matches premium full-bleed hero reference. */
const HERO_IMAGE_URI =
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=85';



export function WelcomeScreen({ onTakeTour }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ImageBackground source={{ uri: HERO_IMAGE_URI }} style={styles.bg} resizeMode="cover">
        <View style={styles.tintRight} pointerEvents="none" />
        <View style={styles.fadeBottom} pointerEvents="none" />

        <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
          <View style={styles.brandRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoMark}>xl</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Al-Bayt Properties</Text>
              <View style={styles.verifiedRow}>
                <Text style={styles.verifiedText}>Verified agents</Text>
                <View style={styles.checkDot}>
                  <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.glassBtn} activeOpacity={0.85}>
              <Ionicons name="videocam-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.glassBtn} activeOpacity={0.85}>
              <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.middle}>
          <Text style={styles.headline}>Find Your Dream Property</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FFFFFF" />
            <Text style={styles.ratingText}>5.0</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.reviewsLink}>120 reviews</Text>
          </View>
          <Text style={styles.location}>Yonkers, New York, United States</Text>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity style={styles.glassBtn} activeOpacity={0.85}>
            <Ionicons name="home-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.glassBtn} activeOpacity={0.85}>
            <Ionicons name="options-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.lightningBtn} activeOpacity={0.88}>
            <Ionicons name="flash" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.takeTourBtnOuter}
            activeOpacity={0.92}
            onPress={onTakeTour}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB', '#1E40AF', '#172554']}
              locations={[0, 0.35, 0.68, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.takeTourGradient}
            >
              <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
              <Text style={styles.takeTourText}>Take a look</Text>
              <View style={styles.takeTourBottomEdge} pointerEvents="none" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  tintRight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(180, 200, 230, 0.08)',
  },
  fadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: 'rgba(8, 15, 28, 0.55)',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 28,

  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  verifiedText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '500',
  },
  checkDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  glassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 41, 59, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 120,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dot: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  reviewsLink: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(255,255,255,0.85)',
  },
  location: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  lightningBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowColor: ACCENT_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  takeTourBtnOuter: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#2D1305',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.55,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  takeTourGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 999,
    overflow: 'hidden',
    gap: 10,
  },
  takeTourBottomEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // height: '100%',
    backgroundColor: 'rgba(45, 22, 10, 0.42)',
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
  },
  takeTourText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
