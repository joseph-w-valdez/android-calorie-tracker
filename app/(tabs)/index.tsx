import { SwipeableTabWrapper } from '@/src/components/SwipeableTabWrapper';
import { HomeScreen } from '@/src/screens/HomeScreen';

export default function Home() {
  return (
    <SwipeableTabWrapper>
      <HomeScreen />
    </SwipeableTabWrapper>
  );
}
