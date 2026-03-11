import { TotalWageSection } from '@/ui/sections/totalWageSection';
import { AccountLinkSection } from '@/ui/sections/accountLinkSection';
import { LoadSheetSection } from '@/ui/sections/loadSheetSection';
import { SettingSection } from '@/ui/sections/settingSection';
import './App.css';

export default function App() {
  return (
    <div className="h-full overflow-y-auto p-2">
      <AccountLinkSection />
      <LoadSheetSection />
      <SettingSection />
      <TotalWageSection />
    </div>
  );
}
