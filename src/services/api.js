import axios from 'axios';
import { mapToEntityDTO } from '../dtos/entity.dto';
import { mapToEdgeDTO } from '../dtos/edge.dto';
import { mapToSimulationDTO } from '../dtos/simulation.dto';
import { mapToDashboardDTO } from '../dtos/dashboard.dto';
import { mapToInsightsDTO } from '../dtos/insights.dto';
import { supabase } from '../utils/supabaseClient';
import {
  RAW_ENTITIES,
  RAW_EDGES,
  RAW_MATERIALS,
  RAW_SIM_RESULTS,
  RAW_INSIGHTS
} from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:54321/functions/v1/api';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

axios.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export function calculateMissingSales(sales) {
  const cleanSales = { daily: null, weekly: null, monthly: null, yearly: null };
  if (!sales) return cleanSales;

  const daily = parseFloat(sales.daily) || null;
  const weekly = parseFloat(sales.weekly) || null;
  const monthly = parseFloat(sales.monthly) || null;
  const yearly = parseFloat(sales.yearly) || null;

  if (daily > 0 && !weekly && !monthly && !yearly) {
    cleanSales.daily = daily;
    cleanSales.weekly = daily * 7;
    cleanSales.monthly = daily * 30;
    cleanSales.yearly = daily * 365;
  } else if (weekly > 0 && !daily && !monthly && !yearly) {
    cleanSales.weekly = weekly;
    cleanSales.daily = Math.round(weekly / 7);
    cleanSales.monthly = Math.round(weekly * 4.33);
    cleanSales.yearly = Math.round(weekly * 52);
  } else if (monthly > 0 && !daily && !weekly && !yearly) {
    cleanSales.monthly = monthly;
    cleanSales.daily = Math.round(monthly / 30);
    cleanSales.weekly = Math.round(monthly / 4.33);
    cleanSales.yearly = Math.round(monthly * 12);
  } else if (yearly > 0 && !daily && !weekly && !monthly) {
    cleanSales.yearly = yearly;
    cleanSales.daily = Math.round(yearly / 365);
    cleanSales.weekly = Math.round(yearly / 52);
    cleanSales.monthly = Math.round(yearly / 12);
  } else {
    cleanSales.daily = daily;
    cleanSales.weekly = weekly;
    cleanSales.monthly = monthly;
    cleanSales.yearly = yearly;

    if (monthly > 0) {
      if (!cleanSales.daily) cleanSales.daily = Math.round(monthly / 30);
      if (!cleanSales.weekly) cleanSales.weekly = Math.round(monthly / 4.33);
      if (!cleanSales.yearly) cleanSales.yearly = Math.round(monthly * 12);
    } else if (weekly > 0) {
      if (!cleanSales.daily) cleanSales.daily = Math.round(weekly / 7);
      if (!cleanSales.monthly) cleanSales.monthly = Math.round(weekly * 4.33);
      if (!cleanSales.yearly) cleanSales.yearly = Math.round(weekly * 52);
    } else if (yearly > 0) {
      if (!cleanSales.daily) cleanSales.daily = Math.round(yearly / 365);
      if (!cleanSales.weekly) cleanSales.weekly = Math.round(yearly / 52);
      if (!cleanSales.monthly) cleanSales.monthly = Math.round(yearly / 12);
    }
  }
  return cleanSales;
}

class LatticeApiService {
  constructor() {
    this.entities = [...RAW_ENTITIES];
    this.edges = [...RAW_EDGES];
    this.materials = [...RAW_MATERIALS];
    this.simResults = { ...RAW_SIM_RESULTS };
  }

  async uploadSalesFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${API_URL}/upload-sales`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (e) {
      console.error('Failed to upload sales file:', e);
      throw e;
    }
  }

  validateProfile(profile) {
    const calculatedSales = calculateMissingSales(profile?.sales);

    const validated = {
      product: null,
      hasPOS: null,
      sales: { monthly: null, daily: null, weekly: null, yearly: null },
      expenses: null,
      rivals: [],
      customers: [],
      products: [],
      suppliers: [],
      salesHistory: [],
      targetScenario: null,
      expectedResult: null,
      thresholds: { inventoryLow: null },
      ...profile
    };

    // Ensure nested objects are initialized
    validated.sales = {
      monthly: null,
      daily: null,
      weekly: null,
      yearly: null,
      ...calculatedSales
    };

    // Ensure array fields are actually arrays
    if (!Array.isArray(validated.rivals)) validated.rivals = [];
    if (!Array.isArray(validated.customers)) validated.customers = [];
    if (!Array.isArray(validated.products)) validated.products = [];
    if (!Array.isArray(validated.suppliers)) validated.suppliers = [];
    if (!Array.isArray(validated.salesHistory)) validated.salesHistory = [];

    // Clean up numeric values
    validated.expenses = profile?.expenses !== undefined && profile.expenses !== null ? parseFloat(validated.expenses) || 0 : null;
    for (const key in validated.sales) {
      if (validated.sales[key] !== null) {
        validated.sales[key] = parseFloat(validated.sales[key]) || 0;
      }
    }

    return validated;
  }

  async getWorkspaceData(businessProfile, isUpdate = false) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { entities: [], edges: [], materials: [], profile: null };
    }
    const cleanProfile = this.validateProfile(businessProfile);
    try {
      const response = await axios.post(`${API_URL}/workspace`, { businessProfile: cleanProfile, isUpdate });
      const data = response.data;
      return {
        entities: (data.entities || []).map(mapToEntityDTO),
        edges: (data.edges || []).map(mapToEdgeDTO),
        materials: data.materials || [],
        profile: data.profile
      };
    } catch (e) {
      console.warn('Backend unavailable or error', e);
      return { entities: [], edges: [], materials: [], profile: null };
    }
  }

  async getDashboardData(businessProfile, language = 'mm') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const cleanProfile = this.validateProfile(businessProfile);
    try {
      const response = await axios.post(`${API_URL}/dashboard`, { businessProfile: cleanProfile, language });
      return response.data;
    } catch (e) {
      console.warn('Backend unavailable or error', e);
      return null;
    }
  }

  async getInsights(businessProfile, language = 'mm') {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const cleanProfile = this.validateProfile(businessProfile);
    try {
      const response = await axios.post(`${API_URL}/insights`, { businessProfile: cleanProfile, language });
      return mapToInsightsDTO(response.data, language);
    } catch (e) {
      console.warn('Backend unavailable or error', e);
      return null;
    }
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const cleanProfile = this.validateProfile(profile);
    try {
      const response = await axios.post(`${API_URL}/simulate`, { 
        activeParameters: agentRatios, 
        profile: cleanProfile
      });
      return response.data;
    } catch (e) {
      console.warn('Backend unavailable or error', e);
      return null;
    }
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
