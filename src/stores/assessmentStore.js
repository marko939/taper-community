'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { ensureSession } from '@/lib/ensureSession';
import { useAuthStore } from './authStore';

export const useAssessmentStore = create((set, get) => ({
  assessments: [],
  loading: true,
  // fetchError mirrors notificationStore — lets UI distinguish "no data" from "fetch failed"
  fetchError: false,

  fetchAssessments: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) { set({ loading: false }); return; }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      set({ assessments: data || [], loading: false, fetchError: false });
    } catch (err) {
      console.error('[assessmentStore] fetchAssessments error:', err);
      set({ loading: false, fetchError: true });
    }
  },

  // Throws on failure so the caller (AssessmentForm) can show the real error
  // message. ensureSession() matches every other insert path in the codebase.
  submitAssessment: async ({ type, score, responses, date }) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('Not signed in.');

    await ensureSession();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        type,
        score,
        responses,
        date: date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('[assessmentStore] submitAssessment error:', error.message);
      throw new Error(error.message || 'Failed to save assessment.');
    }

    set((state) => ({ assessments: [data, ...state.assessments] }));
    return data;
  },
}));
