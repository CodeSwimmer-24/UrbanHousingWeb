import { ACCENT } from '../../theme/colors';

export const TAB_KEYS = ['dashboard', 'recent_views', 'property_list'];

export const DASHBOARD_TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline' },
  { key: 'recent_views', label: 'Recent Views', icon: 'people-outline' },
  { key: 'property_list', label: 'Properties', icon: 'business-outline' },
];

export const MOCK_VIEWERS = [
  { id: '1', name: 'Arjun Mehta', initials: 'AM', phone: '+91 98••••3210', viewedAt: 'Today, 10:24 AM', source: 'Search', interest: 'High', color: '#3B82F6' },
  { id: '2', name: 'Priya Sharma', initials: 'PS', phone: '+91 87••••8844', viewedAt: 'Yesterday', source: 'Category', interest: 'Medium', color: '#8B5CF6' },
  { id: '3', name: 'Vikram Singh', initials: 'VS', phone: '+91 76••••1192', viewedAt: '2 days ago', source: 'Bookmark', interest: 'High', color: '#EC4899' },
  { id: '4', name: 'Neha Kapoor', initials: 'NK', phone: '+91 99••••5566', viewedAt: '3 days ago', source: 'Search', interest: 'Low', color: '#F59E0B' },
];

export const MOCK_PROPERTIES = [
  { id: 'p1', title: '2 BHK Flat', subtitle: 'Sector 15, Noida · Floor 4/10', type: 'Rent', price: 'AED 1,200/mo', status: 'Live', icon: 'home-outline', iconBg: '#EFF6FF', iconColor: ACCENT },
  { id: 'p2', title: '1 BHK Apartment', subtitle: 'Downtown · Floor 8/20', type: 'Sale', price: 'AED 480,000', status: 'Live', icon: 'business-outline', iconBg: '#F0FDF4', iconColor: '#16A34A' },
  { id: 'p3', title: 'Studio Apartment', subtitle: 'Marina View · Floor 12/30', type: 'Rent', price: 'AED 2,100/mo', status: 'Sold', icon: 'bed-outline', iconBg: '#FAF5FF', iconColor: '#7C3AED' },
];
