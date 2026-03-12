import { DEPRESCRIBERS } from '@/lib/deprescribers';
import DeprescribersClient from './DeprescribersClient';

export const metadata = {
  title: 'Find a Deprescribing Provider — TaperCommunity',
  description:
    `Directory of ${DEPRESCRIBERS.length}+ clinicians worldwide who specialize in safe, guided psychiatric medication tapering. Find a deprescriber near you.`,
  alternates: { canonical: '/deprescribers' },
};

export default function DeprescribersPage() {
  return (
    <>
      <DeprescribersClient />
      {/* Server-rendered provider list for search engine crawlers */}
      <div className="sr-only" aria-hidden="false">
        <h2>Deprescribing Providers Directory</h2>
        <p>
          {DEPRESCRIBERS.length} clinicians who specialize in safe psychiatric
          medication tapering, including psychiatrists, nurse practitioners, and
          integrative medicine physicians.
        </p>
        <ul>
          {DEPRESCRIBERS.map((d) => (
            <li key={d.name}>
              <strong>{d.name}</strong> — {d.role}
              {d.clinic && <>, {d.clinic}</>}
              {d.location && <> ({d.location})</>}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
