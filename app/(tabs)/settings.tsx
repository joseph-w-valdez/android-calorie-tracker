import { SwipeableTabWrapper } from '@/src/components/SwipeableTabWrapper';
import { SettingsScreen } from '@/src/screens/SettingsScreen';

export default function SettingsTab() {
  return (
    <SwipeableTabWrapper>
      <SettingsScreen />
    </SwipeableTabWrapper>
  );
}

