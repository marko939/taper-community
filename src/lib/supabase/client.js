'use client';

import { createMockClient } from '@/lib/mock/client';

let _client = null;

export function createClient() {
  if (!_client) _client = createMockClient();
  return _client;
}
