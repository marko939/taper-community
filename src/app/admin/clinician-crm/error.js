'use client';
import ErrorFallback from '@/components/shared/ErrorFallback';
export default function AdminClinicianCrmError({ error, reset }) {
  return <ErrorFallback error={error} reset={reset} routeLabel="admin-clinician-crm" />;
}
