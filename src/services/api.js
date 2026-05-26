import { mapToEntityDTO } from '../dtos/entity.dto';
import { mapToEdgeDTO } from '../dtos/edge.dto';
import { mapToSimulationDTO } from '../dtos/simulation.dto';
import {
  RAW_ENTITIES,
  RAW_EDGES,
  RAW_MATERIALS,
  RAW_SIM_RESULTS
} from '../data/mockData';

class LatticeApiService {
  constructor() {
    this.entities = [...RAW_ENTITIES];
    this.edges = [...RAW_EDGES];
    this.materials = [...RAW_MATERIALS];
    this.simResults = { ...RAW_SIM_RESULTS };
  }

  async getWorkspaceData() {
    await new Promise(resolve => setTimeout(resolve, 200));
    return {
      entities: this.entities.map(mapToEntityDTO),
      edges: this.edges.map(mapToEdgeDTO),
      materials: this.materials
    };
  }

  async importDocument({ fileType, fileName, url }) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Parsing text...
    await new Promise(resolve => setTimeout(resolve, 1000)); // Extracting entities...

    const docId = `doc-${Date.now()}`;
    const newMaterial = {
      id: docId,
      title: fileName || url || 'Restocking Ledger',
      type: fileType ? fileType.toUpperCase() : 'URL',
      source: url || fileName || 'drag_drop_upload',
      uploaded: new Date().toISOString(),
      summary: `Auto-extracted B2B analysis of ${fileName || url}.`,
      body: `Parsed content: local retailer requirements indicate high demand for supplier-backed credit accounts in Latha and Hlaing market coordinates.`,
      extracted: []
    };

    const extractedIds = [];
    if (fileType === 'pdf') {
      extractedIds.push('yangon-shops', 'shop-1');
    } else if (fileType === 'csv') {
      extractedIds.push('mandalay-distrib', 'sz-ledger');
    } else {
      extractedIds.push('credit-reliance', 'competitor-a');
    }

    newMaterial.extracted = extractedIds;
    this.materials.unshift(newMaterial);

    return {
      material: newMaterial,
      extractedEntities: extractedIds
    };
  }

  async mergeApprovedEntities(entityIds) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, mergedCount: entityIds.length };
  }

  async runSimulation(branchId, agentRatios) {
    const totalRounds = 8;
    const progressLogs = [];
    
    for (let round = 1; round <= totalRounds; round++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      progressLogs.push(`Round ${round}/${totalRounds}: Swarm agents reacting to inputs...`);
    }

    // Clone the raw result so we don't mutate the global mock data
    const rawResult = JSON.parse(JSON.stringify(this.simResults['main']));
    
    // agentRatios.competitors ranges from 10 to 100.
    // We map 10->index 0 (Aggressive Capture) and 100->index 6 (Total Retreat)
    const compRatio = agentRatios && agentRatios.competitors ? agentRatios.competitors : 50;
    
    // Clamp to [0, 6] bounds
    const peakIndex = Math.max(0, Math.min(6, ((compRatio - 10) / 90) * 6));
    
    // Generate bell curve distribution (Normal Distribution)
    const spread = 1.2;
    let sum = 0;
    const weights = rawResult.scenarios.map((_, i) => {
      const w = Math.exp(-Math.pow(i - peakIndex, 2) / (2 * spread * spread));
      sum += w;
      return w;
    });

    // Normalize probabilities to ensure they sum exactly to 100%
    let totalProb = 0;
    rawResult.scenarios.forEach((sc, i) => {
      if (i === rawResult.scenarios.length - 1) {
        sc.prob = Math.max(0, 100 - totalProb); // Final element gets remainder
      } else {
        sc.prob = Math.round((weights[i] / sum) * 100);
        totalProb += sc.prob;
      }
    });

    return mapToSimulationDTO(rawResult);
  }

  async sendChatMessage(agentId, messages) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let responseText = '';

    if (agentId === 'ag-zc-policy') {
      responseText = `The Competitor Credit Policy is built to underwrite retail grocery accounts directly. If the primary platform matches credit terms, the system is designed to trigger automated extensions up to 30 days for high-volume shops to protect market share.`;
    } else if (agentId === 'ag-latha') {
      responseText = `Honestly, we prefer the platform's simple catalog, but running a store requires credit. If you roll out the supplier credit limits, we will shift all our grocery ordering back to your app.`;
    } else {
      responseText = `Local shop owners show high interest in catalog credit. Cash discounts help but do not solve daily cashflow gaps.`;
    }

    return {
      sender: agentId.toUpperCase().replace('AG-', '').replace('-', ' '),
      text: responseText,
      timestamp: new Date().toISOString()
    };
  }
}

export const api = new LatticeApiService();
export default api;

