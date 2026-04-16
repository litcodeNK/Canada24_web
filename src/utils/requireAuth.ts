import { Alert } from 'react-native';

/**
 * If user is logged in, run action immediately.
 * Otherwise show a prompt and navigate to sign-in.
 */
export function requireAuth(
  user: { email: string } | null,
  navigation: { navigate: (screen: 'AuthEmail') => void },
  action: () => void
) {
  if (user) {
    action();
    return;
  }
  Alert.alert(
    'Sign in required',
    'Create a free account to save articles, follow stories, and post news.',
    [
      { text: 'Not now', style: 'cancel' },
      { text: 'Sign In', onPress: () => navigation.navigate('AuthEmail') },
    ]
  );
}
