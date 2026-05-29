import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, Activity, Users } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function CategorizedMetrics({ profile }) {

  // Parse inputs defensively
  const parseNum = (str, fallback) => {
    if (!str) return fallback;
    const num = parseInt(str.replace(/[^0-9]/g, ''));
    if (isNaN(num)) return fallback;
    if (str.toLowerCase().includes('k')) return num * 1000;
    if (str.toLowerCase().includes('m')) return num * 1000000;
    return num;
  };

  const monthlyRevenue = profile?.sales?.monthly || 
                         (profile?.sales?.daily ? profile.sales.daily * 30 : 0) || 
                         (profile?.sales?.weekly ? (profile.sales.weekly / 7) * 30 : 0) || 
                         (profile?.sales?.yearly ? profile.sales.yearly / 12 : 0) || 
                         12000;

  const dailySales = profile?.sales?.daily || 
                       (profile?.sales?.weekly ? profile.sales.weekly / 7 : 0) || 
                       (profile?.sales?.monthly ? profile.sales.monthly / 30 : 0) || 
                       (profile?.sales?.yearly ? profile.sales.yearly / 365 : 0) || 
                       400;

  const budget = profile?.expenses || 8000;

  // 1: Financial Health (Bar Chart)
  const financialData = useMemo(() => {
    return [
      { name: 'Month 1', Revenue: Math.round(monthlyRevenue), Target: Math.round(monthlyRevenue * 1.05) },
      { name: 'Month 2', Revenue: Math.round(monthlyRevenue * 1.02), Target: Math.round(monthlyRevenue * 1.1) },
      { name: 'Month 3', Revenue: Math.round(monthlyRevenue * 1.08), Target: Math.round(monthlyRevenue * 1.15) },
      { name: 'Month 4', Revenue: Math.round(monthlyRevenue * 1.12), Target: Math.round(monthlyRevenue * 1.2) },
      { name: 'Month 5', Revenue: Math.round(monthlyRevenue * 1.20), Target: Math.round(monthlyRevenue * 1.25) },
      { name: 'Month 6', Revenue: Math.round(monthlyRevenue * 1.25), Target: Math.round(monthlyRevenue * 1.3) },
    ];
  }, [monthlyRevenue]);

  // 2: Budget Allocation (Unified to Bar Chart instead of Pie)
  const budgetData = useMemo(() => {
    let marketing = 30;
    let ops = 40;
    let software = 30;
    
    if (profile?.businessChallenges?.toLowerCase().includes('market')) {
      marketing = 50;
      ops = 30;
      software = 20;
    }

    return [
      { name: 'Marketing', Value: Math.round(budget * (marketing / 100)) },
      { name: 'Operations', Value: Math.round(budget * (ops / 100)) },
      { name: 'Software', Value: Math.round(budget * (software / 100)) },
    ];
  }, [budget, profile?.businessChallenges]);

  // 3: Sales Velocity (Line Chart)
  const salesVelocityData = useMemo(() => {
    return [
      { day: 'Day 1', Sales: dailySales, Target: dailySales },
      { day: 'Day 7', Sales: dailySales + 10, Target: dailySales + 15 },
      { day: 'Day 14', Sales: dailySales + 25, Target: dailySales + 30 },
      { day: 'Day 21', Sales: dailySales + 35, Target: dailySales + 45 },
      { day: 'Day 30', Sales: dailySales + 50, Target: dailySales + 60 },
    ];
  }, [dailySales]);

  // 4: Marketing Channels (Unified to Bar Chart instead of Radar)
  const marketingData = [
    { name: 'Organic', Score: 85 },
    { name: 'Paid Ads', Score: profile?.marketingActivities?.includes('Ads') ? 95 : 45 },
    { name: 'B2B Sales', Score: profile?.businessType?.includes('B2B') ? 90 : 60 },
    { name: 'Retention', Score: 70 },
  ];

  // 5: Customer Segment (Unified to Vertical Bar Chart instead of Horizontal)
  const customerMatchData = [
    { name: 'SMBs', Match: profile?.customerInfo?.includes('SMB') ? 95 : 60 },
    { name: 'Enterprise', Match: profile?.customerInfo?.includes('Enterprise') ? 85 : 40 },
    { name: 'Retail', Match: profile?.businessType?.includes('Retail') ? 90 : 30 },
  ];

  // Unified Colors
  const COLOR_PRIMARY = "#3b82f6"; // Blue
  const COLOR_SECONDARY = "#94a3b8"; // Slate

  return (
    <div className="space-y-6 mb-8">
      
      {/* CATEGORY A: Financial Health */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <DollarSign size={18} className="text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">Financials & Budgeting</h3>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">Revenue vs. Target</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Revenue" fill={COLOR_PRIMARY} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Target" fill={COLOR_SECONDARY} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">Budget Allocation</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetData} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="Value" stroke="none">
                    {budgetData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `$${value.toLocaleString()}`} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY B: Sales & Market Penetration */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Activity size={18} className="text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">Sales & Market Penetration</h3>
        </div>
        <div className="p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Projected Daily Sales Velocity (30 Days)</h4>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesVelocityData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Sales" stroke={COLOR_PRIMARY} strokeWidth={2} dot={{r:4}} />
                <Line type="monotone" dataKey="Target" stroke={COLOR_SECONDARY} strokeWidth={2} strokeDasharray="5 5" dot={{r:4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CATEGORY C: Customer Acquisition */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users size={18} className="text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">Customer Acquisition & Channels</h3>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">Marketing Channel Effectiveness</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketingData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="Score" fill={COLOR_PRIMARY} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4 text-center">Customer Segment Alignment</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerMatchData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="Match" fill={COLOR_PRIMARY} radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
