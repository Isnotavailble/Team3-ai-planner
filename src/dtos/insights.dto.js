import { Lightbulb, TrendingUp, Sparkles, Activity, ShoppingBag, Users } from 'lucide-react';

const iconMap = {
  Lightbulb,
  TrendingUp,
  Sparkles,
  Activity,
  ShoppingBag,
  Users
};

export const mapToInsightsDTO = (rawInsights, language = 'mm') => {
  if (!rawInsights) return null;

  const isMm = language === 'mm';

  return {
    headline: isMm ? rawInsights.headlineMm : rawInsights.headlineEn,
    growthScore: rawInsights.growthScore || 0,
    marketScore: rawInsights.marketScore || 0,
    riskCard: {
      level: rawInsights.riskCard?.level || 'low',
      reason: isMm ? rawInsights.riskCard?.reasonMm : rawInsights.riskCard?.reasonEn
    },
    swot: (rawInsights.swot || []).map(item => ({
      type: item.type,
      title: isMm ? item.titleMm : item.titleEn,
      desc: isMm ? item.descMm : item.descEn
    })),
    customerWeekly: (rawInsights.customerWeekly || []).map(d => ({
      day: isMm ? d.dayMm : d.dayEn,
      count: d.count
    })),
    financialWeekly: (rawInsights.financialWeekly || []).map(d => ({
      day: isMm ? d.dayMm : d.dayEn,
      income: d.income,
      profit: d.profit,
      average: d.average
    })),
    recommendations: (rawInsights.recommendations || []).map((rec, idx) => {
      const IconComponent = iconMap[rec.iconName] || Sparkles;
      return {
        id: rec.id || `rec-${idx}`,
        title: isMm ? rec.titleMm : rec.titleEn,
        desc: isMm ? rec.descMm : rec.descEn,
        icon: IconComponent
      };
    })
  };
};
