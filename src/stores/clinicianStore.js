'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { ensureSession } from '@/lib/ensureSession';
import { useAuthStore } from './authStore';

export const useClinicianStore = create((set, get) => ({
  clinicians: [],
  cliniciansLoaded: false,
  loading: false,

  fetchClinicians: async () => {
    if (get().cliniciansLoaded) return;
    set({ loading: true });

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('clinicians')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      set({ clinicians: data || [], cliniciansLoaded: true, loading: false });
    } catch (err) {
      console.error('[clinicianStore] fetchClinicians error:', err);
      set({ loading: false });
    }
  },

  submitMatchRequest: async (requestData) => {
    const supabase = createClient();
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return { error: { message: 'Not authenticated' } };

    await ensureSession();

    const { _clinician_name, ...dbFields } = requestData;
    const { data, error } = await supabase
      .from('match_requests')
      .insert({ ...dbFields, user_id: userId })
      .select()
      .single();

    if (error) {
      console.error('[clinicianStore] submitMatchRequest error:', error);
      return { error };
    }

    // Send emails via API route (fire-and-forget)
    fetch('/api/match-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchRequestId: data.id,
        patientName: requestData.patient_name,
        patientEmail: requestData.patient_email,
        clinicianName: _clinician_name,
      }),
    }).catch((err) => console.warn('[clinicianStore] Email notification failed:', err));

    return { data };
  },
}));
