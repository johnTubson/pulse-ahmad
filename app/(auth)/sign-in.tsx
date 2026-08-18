import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';

import { LegalDisclaimer } from '@/components/ui/LegalDisclaimer';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { type SignInValues, signInSchema } from '@/schemas/auth';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';

export default function SignInScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const error = useAuthStore((s) => s.error);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values.email.trim(), values.password);
      useUiStore.getState().completeOnboarding();
    } catch {
      // error surfaced via store
    }
  });

  return (
    <Screen scroll className="justify-center bg-surface">
      <Text className="text-center text-3xl font-bold text-text">Welcome back</Text>
      <Text className="mb-8 mt-2 text-center text-base leading-6 text-text-muted">
        Sign in to keep logging your Pulse.
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
            placeholder="Your password"
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.password?.message}
            className="mb-4"
          />
        )}
      />

      {error ? <Text className="mb-3 text-sm text-error">{error}</Text> : null}

      <PrimaryButton label="Sign in" onPress={onSubmit} loading={isSubmitting} className="mt-2" />

      <View className="mt-6 flex-row justify-center">
        <Text className="text-sm text-text-muted">No account yet? </Text>
        <Link href="/(auth)/sign-up" className="text-sm font-semibold text-primary">
          Create one
        </Link>
      </View>

      <LegalDisclaimer className="mt-10" />
    </Screen>
  );
}
