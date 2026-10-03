import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native'
import { useAuth } from '../context/AuthContext'
import { GoogleSignInButton } from '../components/GoogleSignInButton'

interface SignInScreenProps {
  onSuccess: () => void
  onNavigateToSignUp: () => void
  onBack: () => void
}

export const SignInScreen: React.FC<SignInScreenProps> = ({
  onSuccess,
  onNavigateToSignUp,
  onBack,
}) => {
  const { signIn, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please fill in both your email and password.')
      return
    }

    setLoading(true)
    setErrorMessage(null)

    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      setErrorMessage(error.message || 'Failed to sign in. Please verify your credentials.')
    } else {
      onSuccess()
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setErrorMessage(null)
    const { error } = await signInWithGoogle()
    setGoogleLoading(false)

    if (error) {
      setErrorMessage(error.message || 'Google sign-in was interrupted. Please try again.')
    } else {
      onSuccess()
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={22} color="#141718" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brandTitle}>3legant.</Text>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>
          Sign in with your 3legant account to synchronize your cart instantly across Web and Mobile.
        </Text>

        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* GOOGLE SIGN IN BUTTON (TOP / FAST OPTION) */}
        <GoogleSignInButton
          onPress={handleGoogleSignIn}
          loading={googleLoading}
          label="Sign in with Google"
        />

        {/* DIVIDER */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Your password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? (
                <EyeOff size={20} color="#6C7275" />
              ) : (
                <Eye size={20} color="#6C7275" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSignIn}
          disabled={loading || googleLoading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Don't have an account yet? </Text>
          <TouchableOpacity onPress={onNavigateToSignUp}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topNav: {
    height: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#141718',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#141718',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C7275',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8ECEF',
  },
  dividerText: {
    fontSize: 13,
    color: '#6C7275',
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#141718',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#141718',
    backgroundColor: '#FAFAFA',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEF',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    height: 48,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: '#141718',
  },
  eyeButton: {
    padding: 4,
  },
  submitButton: {
    height: 50,
    backgroundColor: '#141718',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6C7275',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141718',
  },
})
