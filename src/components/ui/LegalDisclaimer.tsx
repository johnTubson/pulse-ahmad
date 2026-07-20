import { Linking, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

const TERMS_URL = 'https://pulse.app/terms';
const PRIVACY_URL = 'https://pulse.app/privacy';

type LegalDisclaimerProps = {
  className?: string;
};

export function LegalDisclaimer({ className }: LegalDisclaimerProps) {
  return (
    <View className={cn('items-center px-2', className)}>
      <Text className="text-center text-sm leading-5 text-text-muted">
        By continuing, you agree to Pulse{"'"}s{' '}
        <Text
          accessibilityRole="link"
          className="font-medium text-secondary"
          onPress={() => {
            void Linking.openURL(TERMS_URL);
          }}
        >
          Terms of Service
        </Text>
        {' & '}
        <Text
          accessibilityRole="link"
          className="font-medium text-secondary"
          onPress={() => {
            void Linking.openURL(PRIVACY_URL);
          }}
        >
          Privacy Policy
        </Text>
        .
      </Text>
    </View>
  );
}
