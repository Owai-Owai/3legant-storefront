import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import {
  ArrowLeft,
  MapPin,
  Edit2,
  Check,
  Plus,
  Home,
  Building,
  Phone,
  User,
  X,
} from 'lucide-react-native'
import { safeStorage } from '../../lib/storage'
import { useAuth } from '../../context/AuthContext'

interface ShippingAddressesViewProps {
  onBack: () => void
}

export interface AddressEntry {
  fullName: string
  phone: string
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}

interface AddressBook {
  billing: AddressEntry
  shipping: AddressEntry
}

const STORAGE_KEY = '@3legant_saved_addresses'

const DEFAULT_ADDRESSES: AddressBook = {
  billing: {
    fullName: 'Sofia Havertz',
    phone: '(+1) 234 567 890',
    street: '345 Long Island Avenue',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    zipCode: '10001',
  },
  shipping: {
    fullName: 'Sofia Havertz',
    phone: '(+1) 234 567 890',
    street: '345 Long Island Avenue',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    zipCode: '10001',
  },
}

export const ShippingAddressesView: React.FC<ShippingAddressesViewProps> = ({ onBack }) => {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<AddressBook>(DEFAULT_ADDRESSES)
  const [editingKind, setEditingKind] = useState<'billing' | 'shipping' | null>(null)
  const [form, setForm] = useState<AddressEntry>(DEFAULT_ADDRESSES.shipping)
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null)

  // Load persisted addresses from storage
  useEffect(() => {
    safeStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setAddresses(parsed)
        } catch {
          // fallback to default
        }
      } else if (user) {
        // Pre-fill user name if available
        const defaultName =
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          '3legant Member'
        setAddresses({
          billing: { ...DEFAULT_ADDRESSES.billing, fullName: defaultName },
          shipping: { ...DEFAULT_ADDRESSES.shipping, fullName: defaultName },
        })
      }
    })
  }, [user])

  const handleOpenEdit = (kind: 'billing' | 'shipping') => {
    setEditingKind(kind)
    setForm(addresses[kind])
    setSavedSuccess(null)
  }

  const handleSaveAddress = async () => {
    if (!editingKind) return
    if (!form.fullName.trim() || !form.street.trim() || !form.city.trim()) {
      Alert.alert('Incomplete Address', 'Please fill in full name, street address, and city.')
      return
    }

    const updated = {
      ...addresses,
      [editingKind]: form,
    }

    setAddresses(updated)
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setSavedSuccess(`${editingKind === 'billing' ? 'Billing' : 'Shipping'} address saved!`)
    setEditingKind(null)

    setTimeout(() => {
      setSavedSuccess(null)
    }, 3500)
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#141718" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shipping Addresses</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {savedSuccess && (
          <View style={styles.successBanner}>
            <Check size={16} color="#15803D" />
            <Text style={styles.successBannerText}>{savedSuccess}</Text>
          </View>
        )}

        <Text style={styles.sectionSubtitle}>
          Manage your default billing and delivery locations for speedy checkout.
        </Text>

        {/* SHIPPING ADDRESS CARD */}
        <View style={styles.addressCard}>
          <View style={styles.cardHeader}>
            <View style={styles.kindBadgeRow}>
              <View style={styles.iconCircle}>
                <Home size={18} color="#141718" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Shipping Address</Text>
                <Text style={styles.cardBadge}>Default Delivery</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleOpenEdit('shipping')}
              activeOpacity={0.7}
            >
              <Edit2 size={15} color="#141718" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <User size={14} color="#6C7275" />
              <Text style={styles.infoName}>{addresses.shipping.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={14} color="#6C7275" />
              <Text style={styles.infoText}>{addresses.shipping.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={14} color="#6C7275" />
              <Text style={styles.infoText}>
                {addresses.shipping.street}, {addresses.shipping.city}, {addresses.shipping.state}{' '}
                {addresses.shipping.zipCode}, {addresses.shipping.country}
              </Text>
            </View>
          </View>
        </View>

        {/* BILLING ADDRESS CARD */}
        <View style={styles.addressCard}>
          <View style={styles.cardHeader}>
            <View style={styles.kindBadgeRow}>
              <View style={styles.iconCircle}>
                <Building size={18} color="#141718" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Billing Address</Text>
                <Text style={styles.cardBadge}>Payment & Invoicing</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleOpenEdit('billing')}
              activeOpacity={0.7}
            >
              <Edit2 size={15} color="#141718" />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <User size={14} color="#6C7275" />
              <Text style={styles.infoName}>{addresses.billing.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Phone size={14} color="#6C7275" />
              <Text style={styles.infoText}>{addresses.billing.phone}</Text>
            </View>
            <View style={styles.infoRow}>
              <MapPin size={14} color="#6C7275" />
              <Text style={styles.infoText}>
                {addresses.billing.street}, {addresses.billing.city}, {addresses.billing.state}{' '}
                {addresses.billing.zipCode}, {addresses.billing.country}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal
        visible={editingKind !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingKind(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {editingKind === 'billing' ? 'Billing' : 'Shipping'} Address
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setEditingKind(null)}
                activeOpacity={0.7}
              >
                <X size={20} color="#141718" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={form.fullName}
                onChangeText={(t) => setForm({ ...form, fullName: t })}
                placeholder="Sofia Havertz"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                placeholder="(+1) 234 567 890"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.inputLabel}>Street Address</Text>
              <TextInput
                style={styles.input}
                value={form.street}
                onChangeText={(t) => setForm({ ...form, street: t })}
                placeholder="345 Long Island Avenue, Apt 4B"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.twoColumn}>
                <View style={styles.columnItem}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={form.city}
                    onChangeText={(t) => setForm({ ...form, city: t })}
                    placeholder="New York"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.columnItem}>
                  <Text style={styles.inputLabel}>State / Prov</Text>
                  <TextInput
                    style={styles.input}
                    value={form.state}
                    onChangeText={(t) => setForm({ ...form, state: t })}
                    placeholder="NY"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.twoColumn}>
                <View style={styles.columnItem}>
                  <Text style={styles.inputLabel}>ZIP / Postal Code</Text>
                  <TextInput
                    style={styles.input}
                    value={form.zipCode}
                    onChangeText={(t) => setForm({ ...form, zipCode: t })}
                    placeholder="10001"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.columnItem}>
                  <Text style={styles.inputLabel}>Country</Text>
                  <TextInput
                    style={styles.input}
                    value={form.country}
                    onChangeText={(t) => setForm({ ...form, country: t })}
                    placeholder="United States"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveAddress}
                activeOpacity={0.85}
              >
                <Text style={styles.saveButtonText}>Save Address</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#141718',
  },
  headerPlaceholder: {
    width: 32,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successBannerText: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6C7275',
    marginBottom: 20,
    lineHeight: 20,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  kindBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141718',
  },
  cardBadge: {
    fontSize: 12,
    color: '#6C7275',
    marginTop: 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141718',
  },
  cardBody: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#141718',
  },
  infoText: {
    fontSize: 14,
    color: '#343839',
    lineHeight: 20,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#141718',
  },
  closeButton: {
    padding: 4,
  },
  modalForm: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6C7275',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBCBCB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#141718',
    marginBottom: 16,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 12,
  },
  columnItem: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#141718',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
