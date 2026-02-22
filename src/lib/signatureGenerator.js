/**
 * Auto-generate a drug history signature from onboarding data.
 *
 * @param {{ drug?: string, duration?: string, taperStage?: string, hasClinician?: boolean|null }} params
 * @returns {string}
 */
export function generateSignature({ drug, duration, taperStage, hasClinician }) {
  const parts = [];

  if (drug) parts.push(drug);
  if (duration) parts.push(duration);

  const stageLabels = {
    researching: 'researching taper',
    planning: 'planning taper',
    active: 'actively tapering',
    holding: 'holding current dose',
    completed: 'completed taper',
    reinstated: 'reinstated',
    supporting: 'supporting others',
  };

  if (taperStage && stageLabels[taperStage]) {
    parts.push(stageLabels[taperStage]);
  }

  if (hasClinician === true) {
    parts.push('with clinician');
  } else if (hasClinician === false) {
    parts.push('without clinician');
  }

  return parts.join(' \u2014 ');
}
