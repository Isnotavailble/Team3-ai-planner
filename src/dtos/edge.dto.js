/**
 * Edge DTO (Data Transfer Object)
 * Represents a connection (relationship) between two nodes in the graph.
 *
 * Structure:
 * @typedef {Object} EdgeDTO
 * @property {string} a - Source entity ID
 * @property {string} b - Target entity ID
 * @property {('active'|'tension'|'strong'|'quiet')} kind - Type of relationship styling
 * @property {string} label - Text label
 * @property {string} [firstSeen] - ISO string date connection was established
 * @property {string} [lastTouched] - ISO string date relationship was last validated
 */

export function mapToEdgeDTO(raw) {
  if (!raw.a || typeof raw.a !== 'string') {
    throw new Error('EdgeDTO Validation Error: "a" (source ID) is required.');
  }
  if (!raw.b || typeof raw.b !== 'string') {
    throw new Error('EdgeDTO Validation Error: "b" (target ID) is required.');
  }

  const validKinds = ['active', 'tension', 'strong', 'quiet'];
  const kind = validKinds.includes(raw.kind) ? raw.kind : 'quiet';

  return {
    a: raw.a,
    b: raw.b,
    kind: kind,
    label: raw.label || '',
    firstSeen: raw.firstSeen ? new Date(raw.firstSeen).toISOString() : new Date().toISOString(),
    lastTouched: raw.lastTouched ? new Date(raw.lastTouched).toISOString() : new Date().toISOString(),
  };
}
