/**
 * Entity DTO (Data Transfer Object)
 * Represents a Node in the Lattice Knowledge Graph.
 *
 * Structure:
 * @typedef {Object} EntityDTO
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {('you'|'company'|'segment'|'person'|'policy'|'concept'|'event'|'product'|'place'|'organization')} type - Category of entity
 * @property {number} x - Absolute x coordinate in virtual canvas
 * @property {number} y - Absolute y coordinate in virtual canvas
 * @property {string} summary - Structured summary of context/market positioning
 * @property {string} [firstSeen] - ISO string date first recorded
 * @property {string} [lastTouched] - ISO string date last modified
 */

export function mapToEntityDTO(raw) {
  if (!raw.id || typeof raw.id !== 'string') {
    throw new Error('EntityDTO Validation Error: "id" must be a valid string.');
  }
  if (!raw.name || typeof raw.name !== 'string') {
    throw new Error('EntityDTO Validation Error: "name" must be a valid string.');
  }
  
  const validTypes = ['you', 'company', 'segment', 'person', 'policy', 'concept', 'event', 'product', 'place', 'organization'];
  const type = validTypes.includes(raw.type) ? raw.type : 'concept';

  return {
    id: raw.id,
    name: raw.name,
    type: type,
    x: typeof raw.x === 'number' ? raw.x : 0,
    y: typeof raw.y === 'number' ? raw.y : 0,
    summary: raw.summary || '',
    firstSeen: raw.firstSeen ? new Date(raw.firstSeen).toISOString() : new Date().toISOString(),
    lastTouched: raw.lastTouched ? new Date(raw.lastTouched).toISOString() : new Date().toISOString(),
  };
}
