'use client';

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from './authStore';

export const useAssessmentStore = create((set, get) => ({
  assessments: [],
  loading: true,

  fetchAssessments: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) { set({ loading: false }); return; }

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      set({ assessments: data || [], loading: false });
    } catch (err) {
      console.error('[assessmentStore] fetchAssessments error:', err);
      set({ loading: false });
    }
  },

  submitAssessment: async ({ type, score, responses, date }) => {
    const supabase = createClient();
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return null;

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
      console.error('[assessments] Insert failed:', error.message);
      return null;
    }

    if (data) {
      set((state) => ({ assessments: [data, ...state.assessments] }));
    }
    return data;
  },
}));
