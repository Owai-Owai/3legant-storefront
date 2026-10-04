import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  Mail,
} from 'lucide-react-native'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

interface AccountSecurityViewProps {
  onBack: () => void
}

export const AccountSecurityView: React.FC<AccountSecurityViewProps> = ({ onBack }) => {
  const { user } = useAuth()

  const fullName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    ''

  const nameParts = fullName.trim().split(' ')
  const defaultFirst = nameParts[0] || ''
  const defaultLast = nameParts.slice(1).join(' ') || ''

  const [firstName, setFirstName] = useState(defaultFirst)
  const [lastName, setLastName] = useState(defaultLast)
  const [displayName, setDisplayName] = useState(fullName)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successNotice, setSuccessNotice] = useState<string | null>(null)

  const isOAuthUser =
    user?.app_metadata?.provider === 'google' ||
    user?.identities?.some((i) => i.provider === 'google')

  const handleSaveChanges = async () => {
    if (!user) return

    if (newPassword && newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters long.')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The new passwords do not match. Please verify.')
      return
    }

    setSaving(true)
    setSuccessNotice(null)

    try {
      const full = `${firstName} ${lastName}`.trim() || displayName

      const updatePayload: {
        data?: Record<string, any>
        password?: string
      } = {
        data: {
          first_name: firstName,
          last_name: lastName,
          display_name: displayName,
          full_name: full,
        },
      }

      if (newPassword) {
        updatePayload.password = newPassword
      }

      const { error } = await supabase.auth.updateUser(updatePayload)

      if (error) {
        Alert.alert('Update Failed', error.message)
      } else {
        setSuccessNotice('Account details updated successfully!')
        setNewPassword('')
        setConfirmPassword('')

        setTimeout(() => {
          setSuccessNotice(null)
        }, 4000)
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to update account details.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeft size={20} color="#141718" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Security</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollList} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {successNotice && (
          <View style={styles.successBanner}>
            <Check size={16} color="#15803D" />
            <Text style={styles.successBannerText}>{successNotice}</Text>
          </View>
        )}

        {/* SECURITY STATUS CARD */}
        <View style={styles.securityBadgeCard}>
          <View style={styles.securityIconBox}>
            <ShieldCheck size={24} color="#15803D" />
          </View>
          <View style={styles.securityTextGroup}>
            <Text style={styles.securityTitle}>Account Protected</Text>
            <Text style={styles.securitySubtitle}>
              {isOAuthUser
                ? 'Secured with Google OAuth single sign-on.'
                : 'Protected with Supabase encrypted authentication.'}
            </Text>
          </View>
        </View>

        {/* SECTION: PROFILE DETAILS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <User size={18} color="#141718" />
            <Text style={styles.sectionTitle}>Profile Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Display Name</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display Name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.readOnlyInput}>
              <Mail size={16} color="#6C7275" style={styles.mailIcon} />
              <Text style={styles.readOnlyText}>{user?.email || 'user@example.com'}</Text>
            </View>
            <Text style={styles.helperText}>Email is linked to your authentication login.</Text>
          </View>
        </View>

        {/* SECTION: PASSWORD UPDATE */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Lock size={18} color="#141718" />
            <Text style={styles.sectionTitle}>Password & Credentials</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Leave blank to keep current"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#6C7275" />
                ) : (
                  <Eye size={18} color="#6C7275" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
              />
            </View>
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSaveChanges}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  securityBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 20,
    gap: 14,
  },
  securityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTextGroup: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
  },
  securitySubtitle: {
    fontSize: 13,
    color: '#166534',
    marginTop: 2,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#141718',
  },
  inputGroup: {
    marginBottom: 14,
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
  },
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  mailIcon: {
    marginRight: 8,
  },
  readOnlyText: {
    fontSize: 15,
    color: '#6B7280',
  },
  helperText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBCBCB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#141718',
  },
  eyeButton: {
    padding: 12,
  },
  submitButton: {
    backgroundColor: '#141718',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
