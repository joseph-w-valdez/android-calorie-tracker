import { SwipeableTabWrapper } from '@/src/components/SwipeableTabWrapper';
import { CaloriesScreen } from '@/src/screens/CaloriesScreen';

export default function Calories() {
  return (
    <SwipeableTabWrapper>
      <CaloriesScreen />
    </SwipeableTabWrapper>
  );
}

