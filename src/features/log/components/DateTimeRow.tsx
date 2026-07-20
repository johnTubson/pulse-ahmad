import DateTimePicker from '@react-native-community/datetimepicker';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';

import { palette } from '@/constants/theme';
import { formatTransactionDate } from '@/lib/date/format';
import { cn } from '@/utils/cn';

type DateTimeRowProps = {
  value: Date;
  onChange: (date: Date) => void;
  className?: string;
};

type AndroidStep = 'date' | 'time' | null;

function mergeDatePart(base: Date, next: Date): Date {
  const merged = new Date(base);
  merged.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
  return merged;
}

function mergeTimePart(base: Date, next: Date): Date {
  const merged = new Date(base);
  merged.setHours(next.getHours(), next.getMinutes(), 0, 0);
  return merged;
}

export function DateTimeRow({ value, onChange, className }: DateTimeRowProps) {
  const [iosOpen, setIosOpen] = useState(false);
  const [androidStep, setAndroidStep] = useState<AndroidStep>(null);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      setAndroidStep('date');
      return;
    }
    setIosOpen((prev) => !prev);
  };

  return (
    <View className={cn(className)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change date and time"
        className="min-h-[48px] flex-row items-center gap-2.5 rounded-xl bg-grey-100 px-3.5 active:opacity-70"
        onPress={openPicker}
      >
        <SymbolView
          name={{ ios: 'calendar', android: 'calendar_today', web: 'calendar_today' }}
          tintColor={palette.textMuted}
          size={18}
        />
        <Text className="flex-1 text-base text-text-muted">
          {formatTransactionDate(value.toISOString())}
        </Text>
        <SymbolView
          name={{ ios: 'chevron.down', android: 'expand_more', web: 'expand_more' }}
          tintColor={palette.textMuted}
          size={16}
        />
      </Pressable>

      {Platform.OS === 'ios' && iosOpen ? (
        <DateTimePicker
          value={value}
          mode="datetime"
          display="spinner"
          onValueChange={(_event, date) => onChange(date)}
          onDismiss={() => setIosOpen(false)}
        />
      ) : null}

      {Platform.OS === 'android' && androidStep === 'date' ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onValueChange={(_event, date) => {
            onChange(mergeDatePart(value, date));
            setAndroidStep('time');
          }}
          onDismiss={() => setAndroidStep(null)}
        />
      ) : null}

      {Platform.OS === 'android' && androidStep === 'time' ? (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onValueChange={(_event, date) => {
            onChange(mergeTimePart(value, date));
            setAndroidStep(null);
          }}
          onDismiss={() => setAndroidStep(null)}
        />
      ) : null}
    </View>
  );
}
