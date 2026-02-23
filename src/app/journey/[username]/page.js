import { getJourneyData } from '@/lib/journey';
import JourneyClient from './JourneyClient';

export async function generateMetadata({ params }) {
  const { username } = await params;
  const data = await getJourneyData(username);

  if (!data) {
    return { title: 'Journey Not Found — TaperCommunity' };
  }

  const { profile, entries } = data;
  const displayName = profile.display_name || username;
  const drug = profile.drug || 'Medication';
  const latestEntry = entries[0];
  const dose = latestEntry?.current_dose || 'unknown dose';

  return {
    title: `${displayName}'s ${drug} Taper Journey — TaperCommunity`,
    description: `${entries.length} logged entries. Current dose: ${dose}.`,
    openGraph: {
      title: `${displayName}'s ${drug} Taper Journey`,
      description: `Follow ${displayName}'s taper journey on TaperCommunity. ${entries.length} entries logged.`,
    },
  };
}

export default async function JourneyPage({ params }) {
  const { username } = await params;
  const data = await getJourneyData(username);

  if (!data) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Journey not found</h1>
        <p className="mt-2 text-text-muted">
          This user doesn't exist or hasn't set up their public journey.
        </p>
      </div>
    );
  }

  return <JourneyClient data={data} username={username} />;
}
