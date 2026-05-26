/**
 * Branch DTO (Data Transfer Object)
 * Represents a decision branch / possible future.
 */

export function mapToBranchDTO(raw) {
  if (!raw.id || typeof raw.id !== 'string') {
    throw new Error('BranchDTO Validation Error: "id" is required.');
  }
  if (!raw.name || typeof raw.name !== 'string') {
    throw new Error('BranchDTO Validation Error: "name" is required.');
  }

  const validValences = ['main', 'favorable', 'neutral', 'contested', 'adverse'];
  const valence = validValences.includes(raw.valence) ? raw.valence : 'neutral';

  const commits = (raw.commits || []).map(c => ({
    t: typeof c.t === 'number' ? c.t : 0,
    kind: ['present', 'event', 'decision', 'terminus'].includes(c.kind) ? c.kind : 'event',
    desc: c.desc || '',
    date: c.date || '',
    affects: Array.isArray(c.affects) ? c.affects : [],
  }));

  return {
    id: raw.id,
    name: raw.name,
    valence: valence,
    prob: typeof raw.prob === 'number' ? raw.prob : 50,
    parent: raw.parent || null,
    divergeAt: typeof raw.divergeAt === 'number' ? raw.divergeAt : 0,
    divergeY: typeof raw.divergeY === 'number' ? raw.divergeY : 0,
    description: raw.description || '',
    decision: raw.decision || '',
    commits: commits,
  };
}
