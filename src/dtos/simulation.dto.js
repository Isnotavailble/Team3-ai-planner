/**
 * Simulation DTO (Data Transfer Object)
 * Represents the complete results of a simulation run.
 */

export function mapToSimulationDTO(raw) {
  const scenarios = (raw.scenarios || []).map(s => ({
    title: s.title || '',
    prob: typeof s.prob === 'number' ? s.prob : 0,
    desc: s.desc || '',
    strong: !!s.strong,
  }));

  const criticalAgents = (raw.criticalAgents || []).map(a => ({
    id: a.id || '',
    name: a.name || '',
    role: a.role || '',
    entityId: a.entityId || '',
    initials: a.initials || '',
  }));

  return {
    verdict: raw.verdict || '',
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0,
    scenarios: scenarios,
    dynamics: Array.isArray(raw.dynamics) ? raw.dynamics : [],
    criticalAgents: criticalAgents,
  };
}
