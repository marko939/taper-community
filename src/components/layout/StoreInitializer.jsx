'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export default function StoreInitializer() {
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  return null;
}
