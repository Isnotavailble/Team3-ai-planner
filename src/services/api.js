import { mapToEntityDTO } from '../dtos/entity.dto';
import { mapToEdgeDTO } from '../dtos/edge.dto';
import { mapToSimulationDTO } from '../dtos/simulation.dto';
import { mapToDashboardDTO } from '../dtos/dashboard.dto';
import { mapToInsightsDTO } from '../dtos/insights.dto';
import {
  RAW_ENTITIES,
  RAW_EDGES,
  RAW_MATERIALS,
  RAW_SIM_RESULTS,
  RAW_INSIGHTS
} from '../data/mockData';

class LatticeApiService {
  constructor() {
    this.entities = [...RAW_ENTITIES];
    this.edges = [...RAW_EDGES];
    this.materials = [...RAW_MATERIALS];
    this.simResults = { ...RAW_SIM_RESULTS };
  }

  async getWorkspaceData(businessProfile) {
    await new Promise(resolve => setTimeout(resolve, 200));

    let dynamicEntities = [...this.entities];
    let dynamicEdges = [...this.edges];

    if (businessProfile) {
      // 1. Update the 'our-app' entity name to the business product category if available
      const ourAppIdx = dynamicEntities.findIndex(e => e.id === 'our-app');
      if (ourAppIdx !== -1 && businessProfile.product) {
        dynamicEntities[ourAppIdx] = {
          ...dynamicEntities[ourAppIdx],
          name: businessProfile.product,
          summary: `Our business. Custom category: ${businessProfile.product}.`
        };
      }

      // 2. Add dynamic competitors from businessProfile.rivals
      if (Array.isArray(businessProfile.rivals)) {
        businessProfile.rivals.forEach((rival, idx) => {
          const id = `competitor-dynamic-${idx}`;
          // Position them around the competitor cluster (competitor-a is at 480, 348)
          const angle = (idx * 2 * Math.PI) / Math.max(1, businessProfile.rivals.length);
          const radius = 80;
          const x = Math.round(480 + radius * Math.cos(angle));
          const y = Math.round(348 + radius * Math.sin(angle));

          dynamicEntities.push({
            id: id,
            name: rival.name,
            type: 'company',
            x: x,
            y: y,
            summary: `Competitor. Pricing Strategy: ${rival.pricing || 'Market Matcher'}. Target Audience: ${rival.audience || 'SMB Retailers'}.`
          });

          // Add tension edge
          dynamicEdges.push({
            a: id,
            b: 'our-app',
            kind: 'tension',
            label: 'competing_for_shops'
          });
        });
      }

      // 3. Add dynamic customers
      if (Array.isArray(businessProfile.customers)) {
        businessProfile.customers.forEach((cust, idx) => {
          const id = `customer-dynamic-${cust.id || idx}`;
          // Position around yangon-shops segment at (668, 218)
          const angle = (idx * 2 * Math.PI) / Math.max(1, businessProfile.customers.length);
          const radius = 60;
          const x = Math.round(668 + radius * Math.cos(angle));
          const y = Math.round(218 + radius * Math.sin(angle));

          dynamicEntities.push({
            id: id,
            name: cust.name,
            type: 'person',
            x: x,
            y: y,
            summary: `Active customer. Contact: ${cust.contact || 'No contact info'}.`
          });

          // Link customer to the target segment 'yangon-shops'
          dynamicEdges.push({
            a: id,
            b: 'yangon-shops',
            kind: 'quiet',
            label: 'retailer'
          });

          // Link customer to 'our-app' as buying from us
          dynamicEdges.push({
            a: id,
            b: 'our-app',
            kind: 'active',
            label: 'orders_on'
          });
        });
      }

      // 4. Add dynamic products
      if (Array.isArray(businessProfile.products)) {
        businessProfile.products.forEach((prod, idx) => {
          const id = `product-dynamic-${prod.id || idx}`;
          // Position around sz-ledger at (832, 530)
          const angle = (idx * 2 * Math.PI) / Math.max(1, businessProfile.products.length);
          const radius = 50;
          const x = Math.round(832 + radius * Math.cos(angle));
          const y = Math.round(530 + radius * Math.sin(angle));

          dynamicEntities.push({
            id: id,
            name: prod.name,
            type: 'product',
            x: x,
            y: y,
            summary: `Product item. Base Price: ${prod.price || 0} MMK.`
          });

          // Link product to our ordering catalog (sz-ledger)
          dynamicEdges.push({
            a: 'sz-ledger',
            b: id,
            kind: 'strong',
            label: 'catalog_item'
          });
        });
      }

      // 5. Add dynamic suppliers
      if (Array.isArray(businessProfile.suppliers)) {
        businessProfile.suppliers.forEach((supp, idx) => {
          const id = `supplier-dynamic-${supp.id || idx}`;
          // Position around mandalay-distrib segment at (824, 168)
          const angle = (idx * 2 * Math.PI) / Math.max(1, businessProfile.suppliers.length);
          const radius = 60;
          const x = Math.round(824 + radius * Math.cos(angle));
          const y = Math.round(168 + radius * Math.sin(angle));

          dynamicEntities.push({
            id: id,
            name: supp.name,
            type: 'company',
            x: x,
            y: y,
            summary: `Supplier partner. Supplied products: ${supp.products ? (Array.isArray(supp.products) ? supp.products.join(', ') : supp.products) : 'Various'}. Contact: ${supp.contactMasked || '***'}.`
          });

          // Link supplier to 'our-app' as partner
          dynamicEdges.push({
            a: 'our-app',
            b: id,
            kind: 'active',
            label: 'partners_with'
          });
        });
      }
    }

    return {
      entities: dynamicEntities.map(mapToEntityDTO),
      edges: dynamicEdges.map(mapToEdgeDTO),
      materials: this.materials
    };
  }

  async getDashboardData(businessProfile, language = 'mm') {
    await new Promise(resolve => setTimeout(resolve, 100)); // simulate network delay
    return mapToDashboardDTO(businessProfile, language);
  }

  async getInsights(businessProfile, language = 'mm') {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mapToInsightsDTO(RAW_INSIGHTS, language);
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
    
    let lastMessageText = '';
    if (messages && messages.length > 0) {
      lastMessageText = messages[messages.length - 1].text.toLowerCase();
    }

    let responseText = '';

    if (lastMessageText.includes('policy') || lastMessageText.includes('competitor') || lastMessageText.includes('term')) {
      responseText = `The Competitor Credit Policy is built to underwrite retail grocery accounts directly. If the primary platform matches credit terms, the system is designed to trigger automated extensions up to 30 days for high-volume shops to protect market share.`;
    } else if (lastMessageText.includes('latha') || lastMessageText.includes('owner') || lastMessageText.includes('shop') || lastMessageText.includes('retailer')) {
      responseText = `Honestly, shop owners like Latha prefer the platform's simple catalog, but running a store requires credit. If you roll out the supplier credit limits, they will shift all their grocery ordering back to your app.`;
    } else {
      responseText = `Local shop owners show high interest in catalog credit. Cash discounts help but do not solve daily cashflow gaps. Partnering with Mandalay Wholesalers for credit limits is highly recommended.`;
    }

    return {
      sender: agentId.toUpperCase().replace('AG-', '').replace(/-/g, ' '),
      text: responseText,
      timestamp: new Date().toISOString()
    };
  }
}

export const api = new LatticeApiService();
export default api;

