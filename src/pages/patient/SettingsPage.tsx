import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Shield, Loader2 } from 'lucide-react';
import type { PatientUser } from '@/types/patient';

export default function SettingsPage() {
  const { patientUser } = useOutletContext<{ patientUser: PatientUser }>();
  const [prefs, setPrefs] = useState(patientUser.notification_preferences);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  async function saveNotificationPrefs() {
    setIsSaving(true);
    const { error } = await supabase
      .from('patient_users')
      .update({ notification_preferences: prefs })
      .eq('id', patientUser.id);

    setIsSaving(false);
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível guardar.', variant: 'destructive' });
    } else {
      toast({ title: 'Preferências guardadas' });
    }
  }

  function togglePref(key: keyof typeof prefs) {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerir notificações e segurança.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Notificações</h2>
        </div>

        <div className="space-y-4 max-w-md">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notif" className="cursor-pointer">Notificações por email</Label>
            <Switch id="email-notif" checked={prefs.email} onCheckedChange={() => togglePref('email')} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notif" className="cursor-pointer">Notificações por SMS</Label>
            <Switch id="sms-notif" checked={prefs.sms} onCheckedChange={() => togglePref('sms')} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notif" className="cursor-pointer">Notificações push</Label>
            <Switch id="push-notif" checked={prefs.push} onCheckedChange={() => togglePref('push')} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="reminder-notif" className="cursor-pointer">Lembretes de consulta</Label>
            <Switch id="reminder-notif" checked={prefs.appointment_reminders} onCheckedChange={() => togglePref('appointment_reminders')} />
          </div>

          <Button onClick={saveNotificationPrefs} disabled={isSaving} size="sm">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar preferências
          </Button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Segurança</h2>
        </div>

        <div className="space-y-3 max-w-md">
          <Button variant="outline" size="sm" asChild>
            <a href="/area-cliente/recuperar-password">Alterar password</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
