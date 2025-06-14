
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cog, Bell, BellOff } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export const SettingsDrawer = () => {
  const [open, setOpen] = useState(false);
  const { 
    isSubscribed, 
    oneSignalReady, 
    requestPermission, 
    unsubscribeFromNotifications 
  } = useNotifications();

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      await requestPermission();
    } else {
      await unsubscribeFromNotifications();
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Cog className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Settings</DrawerTitle>
            <DrawerDescription>
              Manage your notification preferences and app settings.
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 pb-0">
            <div className="space-y-6">
              {/* Push Notifications Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Push Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isSubscribed ? (
                      <Bell className="h-5 w-5 text-green-600" />
                    ) : (
                      <BellOff className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <Label htmlFor="push-notifications" className="text-sm font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Receive task reminders and daily digest notifications
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={isSubscribed}
                    onCheckedChange={handleNotificationToggle}
                    disabled={!oneSignalReady}
                  />
                </div>
                
                {!oneSignalReady && (
                  <p className="text-xs text-yellow-600">
                    OneSignal is initializing...
                  </p>
                )}
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Get reminders before tasks are due</p>
                  <p>• Receive daily summaries of your tasks</p>
                  <p>• Notifications work even when the app is closed</p>
                </div>
              </div>
            </div>
          </div>
          
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
