import { TodayScreen } from '@/src/screens/TodayScreen';
import { useLocalSearchParams } from 'expo-router';

export default function Edit() {
  const { date } = useLocalSearchParams<{ date?: string | string[] }>();
  // Handle case where date might be an array (expo-router quirk)
  const dateParam = Array.isArray(date) ? date[0] : date;
  return <TodayScreen date={dateParam} />;
}



