import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT, ACCENT_DARK, ACCENT_LIGHT, TEXT } from '../theme/colors';

const STATIC_TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { key: 'search', label: 'Search', icon: 'search-outline', iconActive: 'search' },
  { key: 'bookmark', label: 'Bookmark', icon: 'bookmark-outline', iconActive: 'bookmark' },
  { key: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

function buildTabs(hasPublishedListing) {
  const middle = hasPublishedListing
    ? { key: 'dashboard', label: 'Dashboard', fab: true, fabIcon: 'grid' }
    : { key: 'add', label: 'Add', fab: true, fabIcon: 'add' };
  return [STATIC_TABS[0], STATIC_TABS[1], middle, STATIC_TABS[2], STATIC_TABS[3]];
}

function TabBarSheen() {
  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.2)', 'rgba(30,64,175,0.05)']}
      locations={[0, 0.45, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.barSheen}
      pointerEvents="none"
    />
  );
}

export function BottomTabBar({ activeKey, onTabChange, bottomInset = 0, hasPublishedListing = false }) {
  const TABS = buildTabs(hasPublishedListing);
  const tabsContent = (
    <>
      <View style={styles.barTint} pointerEvents="none" />
      <TabBarSheen />
      <View style={styles.barInner}>
        {TABS.map((tab) => {
          if (tab.fab) {
            const fabActive = activeKey === tab.key;
            const fabIcon = tab.fabIcon === 'grid' ? 'grid' : 'add';
            const fabSize = tab.fabIcon === 'grid' ? 26 : 32;
            return (
              <View key={tab.key} style={styles.fabSlot}>
                <TouchableOpacity
                  style={styles.fabTouchable}
                  activeOpacity={0.92}
                  onPress={() => onTabChange(tab.key)}
                  accessibilityRole="button"
                  accessibilityLabel={tab.key === 'dashboard' ? 'Listing dashboard' : 'Add property'}
                >
                  <View style={[styles.fabGlassRing, fabActive && styles.fabGlassRingActive]}>
                    <LinearGradient
                      colors={[ACCENT_LIGHT, ACCENT, ACCENT_DARK, '#172554']}
                      locations={[0, 0.25, 0.65, 1]}
                      start={{ x: 0.15, y: 0 }}
                      end={{ x: 0.85, y: 1 }}
                      style={styles.fabFill}
                    >
                      <LinearGradient
                        colors={['rgba(255,255,255,0.38)', 'rgba(255,255,255,0.06)', 'transparent']}
                        locations={[0, 0.35, 1]}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={styles.fabGloss}
                        pointerEvents="none"
                      />
                      <View style={styles.fabIconLayer} pointerEvents="none">
                        <Ionicons name={fabIcon} size={fabSize} color="#FFFFFF" />
                      </View>
                    </LinearGradient>
                  </View>
                </TouchableOpacity>
                <Text style={[styles.fabLabel, fabActive && styles.labelFabActive]}>{tab.label}</Text>
              </View>
            );
          }

          const active = activeKey === tab.key;
          const name = active ? tab.iconActive : tab.icon;
          const color = active ? ACCENT : TEXT.secondary;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.85}
            >
              <Ionicons name={name} size={24} color={color} />
              {active ? <View style={styles.activeDot} /> : <View style={styles.dotPlaceholder} />}
              <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(bottomInset, 8) }]}>
      {Platform.OS === 'web' ? (
        <View style={[styles.barGlass, styles.barGlassWeb]}>{tabsContent}</View>
      ) : (
        <BlurView intensity={78} tint="light" style={styles.barGlass}>
          {tabsContent}
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -15,
  },
  barGlass: {
    overflow: 'hidden',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  barGlassWeb: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
  },
  barTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.88)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    zIndex: 0,
  },
  barSheen: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    zIndex: 0,
  },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
    paddingHorizontal: 6,
    position: 'relative',
    zIndex: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 62,
    paddingTop: 5,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACCENT,
    marginTop: 4,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 4,
  },
  dotPlaceholder: {
    height: 8,
    marginTop: 4,
  },
  label: {
    fontSize: 11,
    color: TEXT.secondary,
    fontWeight: '600',
    marginTop: 3,
  },
  labelActive: {
    color: ACCENT,
  },
  labelFabActive: {
    color: ACCENT,
  },
  fabSlot: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 74,
    paddingBottom: 3,
    zIndex: 4,
  },
  fabTouchable: {
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 14,
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  fabGlassRing: {
    padding: 3,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  fabGlassRingActive: {
    borderColor: 'rgba(30, 64, 175, 0.45)',
    backgroundColor: 'rgba(241, 245, 249, 0.98)',
  },
  fabFill: {
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: ACCENT_DARK,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  fabGloss: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 29,
  },
  fabIconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLabel: {
    fontSize: 11,
    color: TEXT.secondary,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: -0.1,
  },
});
