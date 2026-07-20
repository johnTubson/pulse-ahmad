import { SymbolView } from 'expo-symbols';
import { TextInput, View } from 'react-native';

import { palette } from '@/constants/theme';
import { cn } from '@/utils/cn';

type NoteFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
};

export function NoteField({ value, onChangeText, className }: NoteFieldProps) {
  return (
    <View
      className={cn(
        'min-h-[48px] flex-row items-center gap-2.5 rounded-xl bg-grey-100 px-3.5',
        className,
      )}
    >
      <SymbolView
        name={{ ios: 'note.text', android: 'sticky_note_2', web: 'sticky_note_2' }}
        tintColor={palette.textMuted}
        size={18}
      />
      <TextInput
        accessibilityLabel="Note"
        className="flex-1 py-3 text-base text-text"
        value={value}
        onChangeText={onChangeText}
        placeholder="Add note (Optional)"
        placeholderTextColor={palette.textMuted}
        returnKeyType="done"
      />
    </View>
  );
}
