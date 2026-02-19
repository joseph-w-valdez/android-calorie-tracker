import { TodayScreen } from '@/src/screens/TodayScreen';
import { useLocalSearchParams } from 'expo-router';

export default function EditTab() {
  const { date } = useLocalSearchParams<{ date?: string }>();
  return <TodayScreen date={date} />;
}

