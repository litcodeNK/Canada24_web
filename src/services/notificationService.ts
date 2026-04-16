import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export async function createAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('breaking-news', {
    name: 'Breaking News',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1976D2',
    sound: 'default',
  });
  await Notifications.setNotificationChannelAsync('general', {
    name: 'General Alerts',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

const ALERT_MESSAGES: Record<string, { title: string; body: string }> = {
  'Breaking News':         { title: 'BREAKING NEWS', body: 'A major story is developing. Tap to read the latest.' },
  'Top Stories':           { title: 'TOP STORIES UPDATE', body: "Today's most important Canadian news is ready." },
  'COVID-19 Updates':      { title: 'COVID-19 UPDATE', body: 'New developments on COVID-19 across Canada.' },
  'Morning Brief':         { title: 'GOOD MORNING CANADA', body: "Here's your morning news briefing." },
  'Recommended For You':   { title: 'STORIES FOR YOU', body: 'New personalized stories based on your interests.' },
  'Business':              { title: 'BUSINESS & ECONOMY', body: 'Latest market news and economic developments.' },
  'Climate Change':        { title: 'CLIMATE UPDATE', body: 'New report on climate developments in Canada.' },
  'Entertainment':         { title: 'ENTERTAINMENT', body: 'New stories in arts & entertainment.' },
  'Health':                { title: 'HEALTH NEWS', body: 'Latest health and wellness updates.' },
  'Technology':            { title: 'TECH NEWS', body: 'New developments in Canadian tech.' },
};

export async function scheduleAlertNotification(alertKey: string): Promise<void> {
  const granted = await requestPermissions();
  if (!granted) return;

  const msg = ALERT_MESSAGES[alertKey] ?? {
    title: 'CANADA 24/7',
    body: `You enabled notifications for ${alertKey}.`,
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: true,
      data: { type: 'alert', key: alertKey },
      ...(Platform.OS === 'android' ? { channelId: alertKey === 'Breaking News' ? 'breaking-news' : 'general' } : {}),
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 3 },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
