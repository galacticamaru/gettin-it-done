
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  id: string;
  daily_digest_enabled: boolean;
  onesignal_subscription_id?: string;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          id: data.id,
          daily_digest_enabled: data.daily_digest_enabled,
          onesignal_subscription_id: data.onesignal_subscription_id,
        });
      } else {
        // Create default preferences if none exist
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user.id,
            daily_digest_enabled: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setPreferences({
          id: newPrefs.id,
          daily_digest_enabled: newPrefs.daily_digest_enabled,
          onesignal_subscription_id: newPrefs.onesignal_subscription_id,
        });
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDailyDigestEnabled = async (enabled: boolean) => {
    if (!user || !preferences) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ daily_digest_enabled: enabled })
        .eq('id', preferences.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, daily_digest_enabled: enabled } : null);
    } catch (error) {
      console.error('Error updating daily digest preference:', error);
    }
  };

  const updateOneSignalSubscriptionId = async (subscriptionId: string | null) => {
    if (!user || !preferences) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({ onesignal_subscription_id: subscriptionId })
        .eq('id', preferences.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, onesignal_subscription_id: subscriptionId } : null);
      console.log('Updated OneSignal subscription ID:', subscriptionId);
    } catch (error) {
      console.error('Error updating OneSignal subscription ID:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPreferences();
    } else {
      setPreferences(null);
      setLoading(false);
    }
  }, [user]);

  return {
    preferences,
    loading,
    updateDailyDigestEnabled,
    updateOneSignalSubscriptionId,
    refetch: fetchPreferences,
  };
};
