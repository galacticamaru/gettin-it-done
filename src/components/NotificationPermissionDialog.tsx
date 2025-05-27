
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Clock, Calendar } from 'lucide-react';

interface NotificationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionResult: (granted: boolean) => void;
}

export const NotificationPermissionDialog = ({ 
  open, 
  onOpenChange, 
  onPermissionResult 
}: NotificationPermissionDialogProps) => {
  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      onPermissionResult(granted);
      onOpenChange(false);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      onPermissionResult(false);
      onOpenChange(false);
    }
  };

  const handleDeny = () => {
    onPermissionResult(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            Enable Task Reminders
          </DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <p>
              To help you stay on track with your tasks, we'd like to send you timely reminders.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>Get notified 15 minutes, 1 hour, or 1 day before your tasks are due</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>Set reminders for tasks without due dates</span>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              You can change this permission anytime in your browser settings.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 mt-6">
          <Button 
            onClick={handleDeny}
            variant="outline" 
            className="flex-1"
          >
            Not Now
          </Button>
          <Button 
            onClick={handleAllow}
            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900"
          >
            Allow Notifications
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
