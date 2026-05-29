import axios from 'axios';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:54321/functions/v1/api';

class LatticeApiService {
  constructor() {
    this.entities = [...RAW_ENTITIES];
    this.edges = [...RAW_EDGES];
    this.materials = [...RAW_MATERIALS];
    this.simResults = { ...RAW_SIM_RESULTS };
  }

  validateProfile(profile) {
    const validated = {
      product: 'Clothing Apparel',
      hasPOS: true,
      sales: { monthly: 12000, daily: 400, weekly: 3000, yearly: 140000 },
      expenses: 8000,
      rivals: [],
      customers: [],
      products: [],
      suppliers: [],
      salesHistory: [],
      targetScenario: 'Competitor Price Cut',
      expectedResult: 'Less Profit',
      thresholds: { inventoryLow: 10 },
      ...profile
    };

    // Ensure nested objects are initialized
    validated.sales = {
      monthly: 12000,
      daily: 400,
      weekly: 3000,
      yearly: 140000,
      ...(profile?.sales || {})
    };

    // Ensure array fields are actually arrays
    if (!Array.isArray(validated.rivals)) validated.rivals = [];
    if (!Array.isArray(validated.customers)) validated.customers = [];
    if (!Array.isArray(validated.products)) validated.products = [];
    if (!Array.isArray(validated.suppliers)) validated.suppliers = [];
    if (!Array.isArray(validated.salesHistory)) validated.salesHistory = [];

    // Clean up numeric values
    validated.expenses = parseFloat(validated.expenses) || 0;
    for (const key in validated.sales) {
      validated.sales[key] = parseFloat(validated.sales[key]) || 0;
    }

    return validated;
  }

  async getWorkspaceData(businessProfile) {
    const cleanProfile = this.validateProfile(businessProfile);
    try {
      const response = await axios.post(`${API_URL}/workspace`, { businessProfile: cleanProfile });
      const data = response.data;
      return {
        entities: (data.entities || []).map(mapToEntityDTO),
        edges: (data.edges || []).map(mapToEdgeDTO),
        materials: data.materials || this.materials
      };
    } catch (e) {
      console.warn('Backend unavailable, falling back to mock workspace data', e);
    }
    // Fallback if backend is down
    return {
      entities: this.entities.map(mapToEntityDTO),
      edges: this.edges.map(mapToEdgeDTO),
      materials: this.materials
    };
  }

  async getDashboardData(businessProfile, language = 'mm') {
    const cleanProfile = this.validateProfile(businessProfile);
    try {
      const response = await axios.post(`${API_URL}/dashboard`, { businessProfile: cleanProfile, language });
      return response.data;
    } catch (e) {
      console.warn('Backend unavailable, falling back to mock dashboard data', e);
    }
    // Fallback if backend is down
    return mapToDashboardDTO(cleanProfile, language);
  }

  async getInsights(businessProfile, language = 'mm') {
    const cleanProfile = this.validateProfile(businessProfile);
    try {
      const response = await axios.post(`${API_URL}/insights`, { businessProfile: cleanProfile, language });
      return mapToInsightsDTO(response.data, language);
    } catch (e) {
      console.warn('Backend unavailable, falling back to mock insights data', e);
    }
    return mapToInsightsDTO(RAW_INSIGHTS, language);
  }

  async importDocument({ fileType, fileName, url }) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const docId = `doc-${Date.now()}`;
    const newMaterial = {
      id: docId,
      title: fileName || url || 'Restocking Ledger',
      type: fileType ? fileType.toUpperCase() : 'URL',
      source: url || fileName || 'drag_drop_upload',
      uploaded: new Date().toISOString(),
      summary: `Auto-extracted B2B analysis of ${fileName || url}.`,
      body: `Parsed content placeholder.`,
      extracted: []
    };
    this.materials.unshift(newMaterial);
    return { material: newMaterial, extractedEntities: [] };
  }

  async mergeApprovedEntities(entityIds) {
    return { success: true, mergedCount: entityIds.length };
  }

  async runSimulation(branchId, agentRatios, profile = null) {
    const cleanProfile = this.validateProfile(profile);
    try {
      const response = await axios.post(`${API_URL}/simulate`, { 
        activeParameters: agentRatios, 
        profile: cleanProfile
      });
      return response.data;
    } catch (e) {
      console.warn('Backend unavailable, falling back to mock simulation', e);
    }
    
    // Fallback Mock Logic
    const rawResult = JSON.parse(JSON.stringify(this.simResults['main']));
    
    // Inject a default projections array to prevent crashes on fallback
    const monthlySales = cleanProfile?.sales?.monthly || 12000;
    const monthlyExpenses = cleanProfile?.expenses ?? 8000;
    const initialCustomers = cleanProfile?.customers?.length * 12 || 180;
    
    rawResult.projections = [];
    for (let m = 1; m <= 6; m++) {
      const factor = 1 + (m * 0.02) * (agentRatios.customers / 100 - agentRatios.competitors / 200);
      const revenue = Math.round(monthlySales * factor);
      const expenses = Math.round(monthlyExpenses * (1 + (m * 0.01) * (1 - agentRatios.distributors / 100)));
      const profit = revenue - expenses;
      const marketShare = Math.round(Math.max(10, Math.min(95, 60 + m * (agentRatios.customers / 150 - agentRatios.competitors / 200))));
      const customers = Math.round(initialCustomers * factor);
      rawResult.projections.push({ month: m, revenue, expenses, profit, marketShare, customers });
    }
    
    return rawResult;
  }

  async sendChatMessage(agentId, messages) {
    return {
      sender: agentId.toUpperCase(),
      text: "Chat is currently disabled in backend architecture.",
      timestamp: new Date().toISOString()
    };
  }
}

export const api = new LatticeApiService();
export default api;
