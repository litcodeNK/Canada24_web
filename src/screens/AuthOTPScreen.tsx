import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'AuthOTP'>;

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function AuthOTPScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const { email } = route.params;
  const { colors } = useApp();
  const { verifyOTP, sendOTP } = useAuth();

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigitChange = (text: string, index: number) => {
    const char = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError('');
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every(d => d !== '') && char) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    const otp = code ?? digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Enter all 6 digits.');
      return;
    }
    setLoading(true);
    setError('');
    const ok = await verifyOTP(email, otp);
    setLoading(false);
    if (!ok) {
      setError('Invalid or expired code. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } else {
      // Navigate back to app — user can now access gated features
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError('');
    setDigits(Array(OTP_LENGTH).fill(''));
    await sendOTP(email);
    setCountdown(RESEND_COOLDOWN);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>VERIFY EMAIL</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.body}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '18' }]}>
            <MaterialIcons name="verified" size={56} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.primaryText }]}>Check your inbox</Text>
          <Text style={[styles.subtitle, { color: colors.hint }]}>
            We sent a 6-digit verification code to
          </Text>
          <Text style={[styles.emailText, { color: colors.primary }]}>{email}</Text>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                style={[
                  styles.otpBox,
                  {
                    borderColor: d ? colors.primary : (error ? '#D32F2F' : colors.divider + '60'),
                    backgroundColor: colors.surface,
                    color: colors.primaryText,
                  },
                ]}
                value={d}
                onChangeText={t => handleDigitChange(t, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={i === 0}
              />
            ))}
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }, loading && { opacity: 0.7 }]}
            onPress={() => handleVerify()}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="verified-user" size={20} color="#fff" />
                <Text style={styles.btnText}>VERIFY CODE</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={[styles.resendLabel, { color: colors.hint }]}>
              Didn't get the code?{' '}
            </Text>
            <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
              <Text style={[styles.resendLink, { color: countdown > 0 ? colors.hint : colors.primary }]}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 20,
    color: '#fff',
    letterSpacing: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 36,
    alignItems: 'center',
  },
  iconCircle: {
    width: 110, height: 110,
    borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 28,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 32,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  otpBox: {
    width: 46, height: 56,
    borderWidth: 2,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    marginTop: 12,
  },
  btnText: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  resendLabel: { fontSize: 13, fontWeight: '500' },
  resendLink: { fontSize: 13, fontWeight: '800' },
});
