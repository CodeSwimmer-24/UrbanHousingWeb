import { useRef, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ACCENT, TEXT } from '../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DASHBOARD_TABS, MOCK_PROPERTIES, TAB_KEYS } from './constants';
import { EditPropertyBottomSheet } from './EditPropertyBottomSheet';
import { dashboardScreenStyles as styles } from './dashboardScreen.styles';
import { StatGrid } from './StatGrid';
import { SubscriptionCard } from './SubscriptionCard';
import { ViewerList } from './ViewerList';

export function PropertyOwnerDashboardScreen({
  listingTag = 'Rent · Furnished',
  planName = '3 Months — Featured',
  planExpiresAt = '18 Jul 2026',
  onViewPropertyDetails,
  onEditListing,
  onDeleteListing,
  onMarkSold,
  onAddMoreListing,
}) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [properties, setProperties] = useState(() => [...MOCK_PROPERTIES]);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const pagerRef = useRef(null);

  const goToTab = (key) => {
    const idx = TAB_KEYS.indexOf(key);
    if (idx === -1) return;
    setActiveTab(key);
    pagerRef.current?.scrollTo({ x: idx * windowWidth, animated: true });
  };

  const handlePageChange = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    if (TAB_KEYS[idx]) setActiveTab(TAB_KEYS[idx]);
  };

  const editingProperty = properties.find((p) => p.id === editingPropertyId) ?? null;

  const handleAction = (key, propIdOrTitle) => {
    switch (key) {
      case 'view':
        if (onViewPropertyDetails) { onViewPropertyDetails(); return; }
        Alert.alert('Property Details', `Previewing:\n\n${propIdOrTitle || 'Listing'}`);
        break;
      case 'edit':
        if (propIdOrTitle && properties.some((p) => p.id === propIdOrTitle)) {
          setEditingPropertyId(propIdOrTitle);
          return;
        }
        if (onEditListing) onEditListing();
        break;
      case 'delete':
        Alert.alert(
          'Delete listing?',
          'This permanently removes your property from Al-Bayt.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => { if (onDeleteListing) onDeleteListing(); } },
          ],
        );
        break;
      case 'sold':
        Alert.alert(
          'Mark as Sold?',
          'Your listing will be closed and hidden from search results.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Mark Sold', onPress: () => { if (onMarkSold) onMarkSold(); } },
          ],
        );
        break;
      case 'add':
        if (onAddMoreListing) { onAddMoreListing(); return; }
        Alert.alert('Add Listing', 'Add another property to your profile.');
        break;
      default: break;
    }
  };

  const renderDashboardTab = () => (
    <>
      <View style={styles.listingCard}>
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#1E3A8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.listingCardGrad}
        >
          <View style={styles.ring1} />
          <View style={styles.ring2} />
          <View style={styles.ring3} />

          <View style={styles.listingCardTop}>
            <View style={styles.liveDot}>
              <View style={styles.livePulse} />
              <Text style={styles.liveText}>● LIVE</Text>
            </View>
            <View style={styles.listingTypePill}>
              <Ionicons name="pricetag-outline" size={10} color="rgba(255,255,255,0.85)" />
              <Text style={styles.listingTypeText}>{listingTag}</Text>
            </View>
          </View>

          <Text style={styles.listingCardTitle}>Hello, Fahad Mahmood</Text>
          <View style={styles.listingCardMeta}>
            <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.55)" />
            <Text style={styles.listingCardMetaText}>You can find all the properties information here</Text>
          </View>

          <View style={styles.listingStatsRow}>
            {[
              { icon: 'eye-outline', val: '847', label: 'Views' },
              { icon: 'chatbubbles-outline', val: '23', label: 'Enquiries' },
              { icon: 'bookmark-outline', val: '3', label: 'Total Properties' },
            ].map((s) => (
              <View key={s.label} style={styles.listingStatCell}>
                <Ionicons name={s.icon} size={13} color="rgba(255,255,255,0.6)" />
                <Text style={styles.listingStatVal}>{s.val}</Text>
                <Text style={styles.listingStatLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      <StatGrid />
      <SubscriptionCard planName={planName} planExpiresAt={planExpiresAt} />

      <View style={styles.quickSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {[
            { label: 'Share listing', icon: 'share-social-outline', bg: '#EFF6FF', color: ACCENT, border: '#BFDBFE' },
            { label: 'Pause listing', icon: 'pause-circle-outline', bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA' },
            { label: 'Download report', icon: 'download-outline', bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
          ].map((q) => (
            <TouchableOpacity key={q.label} style={[styles.quickCard, { backgroundColor: q.bg, borderColor: q.border }]} activeOpacity={0.8}>
              <View style={[styles.quickIconWrap, { backgroundColor: q.color + '18' }]}>
                <Ionicons name={q.icon} size={20} color={q.color} />
              </View>
              <Text style={[styles.quickCardLabel, { color: q.color }]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  const renderRecentViewsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabContentHead}>
        <View style={[styles.tabContentIcon, { backgroundColor: '#EFF6FF' }]}>
          <Ionicons name="people-outline" size={18} color={ACCENT} />
        </View>
        <View>
          <Text style={styles.tabContentTitle}>Recent Views</Text>
          <Text style={styles.tabContentSub}>People who viewed your listings</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        {[
          { label: 'Total', value: '4', color: ACCENT, bg: '#EFF6FF' },
          { label: 'High Interest', value: '2', color: '#15803D', bg: '#DCFCE7' },
          { label: 'This Week', value: '3', color: '#7C3AED', bg: '#F5F3FF' },
        ].map((s) => (
          <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, { color: s.color + 'BB' }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <ViewerList />
    </View>
  );

  const renderPropertyListTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabContentHead}>
        <View style={[styles.tabContentIcon, { backgroundColor: '#F0FDF4' }]}>
          <Ionicons name="business-outline" size={18} color="#16A34A" />
        </View>
        <View>
          <Text style={styles.tabContentTitle}>My Properties</Text>
          <Text style={styles.tabContentSub}>{properties.length} listings added</Text>
        </View>
        <TouchableOpacity style={styles.addPropertyBtn} activeOpacity={0.85} onPress={() => handleAction('add')}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addPropertyText}>Add</Text>
        </TouchableOpacity>
      </View>

      {properties.map((property) => (
        <View key={property.id} style={styles.propertyCard}>
          <View style={styles.propertyCardInner}>
            <View style={[styles.propertyIconBlock, { backgroundColor: property.iconBg }]}>
              <Ionicons name={property.icon} size={22} color={property.iconColor} />
            </View>

            <View style={styles.propertyBody}>
              <View style={styles.propertyTitleRow}>
                <Text style={styles.propertyTitle} numberOfLines={1}>{property.title}</Text>
                <View style={[
                  styles.statusPill,
                  property.status === 'Sold' ? styles.statusSold : styles.statusLive,
                ]}>
                  <View style={[styles.statusDot, { backgroundColor: property.status === 'Sold' ? '#7C3AED' : '#22C55E' }]} />
                  <Text style={[styles.statusText, { color: property.status === 'Sold' ? '#7C3AED' : '#15803D' }]}>
                    {property.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.propertySubtitle} numberOfLines={1}>{property.subtitle}</Text>
              <View style={styles.propertyPriceRow}>
                <View style={styles.typePill}>
                  <Text style={styles.typeText}>{property.type}</Text>
                </View>
                <Text style={styles.propertyPrice}>{property.price}</Text>
              </View>
            </View>
          </View>

          <View style={styles.propertyDivider} />
          <View style={styles.propertyActionsRow}>
            <TouchableOpacity
              style={[styles.propertyActionBtn, styles.editAction]}
              activeOpacity={0.85}
              onPress={() => handleAction('edit', property.id)}
            >
              <Ionicons name="create-outline" size={14} color="#16A34A" />
              <Text style={[styles.propertyActionText, { color: '#16A34A' }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.propertyActionBtn, styles.soldAction]}
              activeOpacity={0.85}
              onPress={() => handleAction('sold', property.title)}
            >
              <Ionicons name="ribbon-outline" size={14} color="#7C3AED" />
              <Text style={[styles.propertyActionText, { color: '#7C3AED' }]}>Mark Sold</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.propertyActionBtn, styles.deleteAction]}
              activeOpacity={0.85}
              onPress={() => handleAction('delete', property.title)}
            >
              <Ionicons name="trash-outline" size={14} color="#DC2626" />
              <Text style={[styles.propertyActionText, { color: '#DC2626' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.pageHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={ACCENT} />
          </View>
          <View>
            <Text style={styles.greetLabel}>My Dashboard</Text>
            <Text style={styles.greetSub}>Track your listing performance</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={20} color={TEXT.primary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsWrap}>
        {DASHBOARD_TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabBtn}
              activeOpacity={0.75}
              onPress={() => goToTab(tab.key)}
            >
              <View style={[styles.tabIconWrap, isActive && styles.tabIconWrapActive]}>
                <Ionicons
                  name={isActive ? tab.icon.replace('-outline', '') : tab.icon}
                  size={20}
                  color={isActive ? ACCENT : TEXT.tertiary}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        ref={pagerRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handlePageChange}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ width: windowWidth }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderDashboardTab()}
        </ScrollView>

        <ScrollView
          style={{ width: windowWidth }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderRecentViewsTab()}
        </ScrollView>

        <ScrollView
          style={{ width: windowWidth }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          {renderPropertyListTab()}
        </ScrollView>
      </ScrollView>

      <EditPropertyBottomSheet
        visible={Boolean(editingPropertyId && editingProperty)}
        property={editingProperty}
        onClose={() => setEditingPropertyId(null)}
        onSave={(id, updates) => {
          setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
          onEditListing?.({ id, updates });
        }}
      />
    </View>
  );
}
