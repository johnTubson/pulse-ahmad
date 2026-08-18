import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { LegalDisclaimer } from '@/components/ui/LegalDisclaimer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { type SignUpValues, signUpSchema } from '@/schemas/auth';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export default function SignUpScreen() {
  const signUp = useAuthStore((s) => s.signUp);
  const error = useAuthStore((s) => s.error);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setNotice(null);
    try {
      const { needsEmailConfirmation } = await signUp(values.email.trim(), values.password);
      useUiStore.getState().completeOnboarding();
      if (needsEmailConfirmation) {
        setNotice('Account created. Check your email to confirm, then sign in.');
      }
    } catch {
      // error surfaced via store
    }
  });

  return (
    <Screen scroll className="justify-center bg-surface">
      <Text className="text-center text-3xl font-bold text-text">Welcome to Pulse</Text>
      <Text className="mb-8 mt-2 text-center text-base leading-6 text-text-muted">
        Track your spending, understand your patterns, and discover the habits behind your money.
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email address"
            placeholder="name@gmail.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.email?.message}
            className="mb-4"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Password"
            placeholder="At least 6 characters"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.password?.message}
            className="mb-4"
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Confirm password"
            placeholder="Repeat your password"
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
            className="mb-4"
          />
        )}
      />

      {error ? <Text className="mb-3 text-sm text-error">{error}</Text> : null}
      {notice ? <Text className="mb-3 text-sm text-success">{notice}</Text> : null}

      <PrimaryButton
        label="Create account"
        onPress={onSubmit}
        loading={isSubmitting}
        className="mt-2"
      />

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-text-muted">Already have an account? </Text>
        <Link href="/(auth)/sign-in" className="text-sm font-semibold text-primary">
          Sign in
        </Link>
      </View>

      <LegalDisclaimer className="mt-10" />
    </Screen>
  );
}
