
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNotifications } from '@/hooks/useNotifications';

export const DailyDigestToggle = () => {
  const { preferences, loading, updateDailyDigestEnabled } = useUserPreferences();
  const { permissionGranted, requestPermission } = useNotifications();

  const handleToggle = async (enabled: boolean) => {
    if (enabled && !permissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }
    
    await updateDailyDigestEnabled(enabled);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 opacity-50">
        <Switch disabled />
        <Label>Daily Digest (Loading...)</Label>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="daily-digest"
        checked={preferences?.daily_digest_enabled || false}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="daily-digest" className="text-sm">
        Daily Digest Notifications
      </Label>
    </div>
  );
};
