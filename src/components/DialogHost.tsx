import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { DialogButton, useDialogStore } from '../store/useDialogStore';
import { Theme } from '../theme';
import { useThemedStyles } from '../theme/ThemeContext';
import { PrimaryButton } from './ui';

function variantFor(style?: DialogButton['style']): 'primary' | 'outline' | 'danger' {
  if (style === 'destructive') return 'danger';
  if (style === 'cancel') return 'outline';
  return 'primary';
}

// Renderuje własne okno dialogowe aplikacji. Montowane raz w App.tsx.
export default function DialogHost() {
  const s = useThemedStyles(makeStyles);
  const visible = useDialogStore((v) => v.visible);
  const title = useDialogStore((v) => v.title);
  const message = useDialogStore((v) => v.message);
  const buttons = useDialogStore((v) => v.buttons);
  const hide = useDialogStore((v) => v.hide);

  const press = (b: DialogButton) => {
    hide();
    b.onPress?.();
  };

  // przy potwierdzeniach (2 przyciski) chcemy anuluj po lewej, akcję po prawej
  const stacked = buttons.length > 2;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
      <View style={s.backdrop}>
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          {message ? <Text style={s.message}>{message}</Text> : null}
          <View style={[s.buttons, stacked && { flexDirection: 'column' }]}>
            {buttons.map((b, i) => (
              <PrimaryButton
                key={i}
                title={b.text}
                variant={variantFor(b.style)}
                onPress={() => press(b)}
                style={stacked ? { marginBottom: 8 } : { flex: 1, marginLeft: i === 0 ? 0 : 8 }}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.colors.card,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 8 },
    message: { fontSize: 15, lineHeight: 21, color: theme.colors.textMuted, marginBottom: 8 },
    buttons: { flexDirection: 'row', marginTop: 16 },
  });
