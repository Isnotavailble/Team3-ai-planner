import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Play, Cpu, Sparkles, TrendingUp, Users, ShieldAlert, FileText, Activity, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { translations } from '../../data/translations';
import api from '../../services/api';
import SimulationSkeleton from '../AIReportPage/SimulationSkeleton';

export default function AnalyticsView({ workspace = {}, businessProfile = {}, onStartInterrogation, language = 'mm' }) {
  const t = translations[language];
  const [stage, setStage] = useState('setup'); // 'setup' | 'running' | 'results'
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [expandedBlockIdx, setExpandedBlockIdx] = useState(null);
  
  const [ratios, setRatios] = useState({
    competitors: 70,
    customers: 80,
    distributors: 60
  });

  // Dynamic simulation inputs (moved from onboarding)
  const [targetScenario, setTargetScenario] = useState('Competitor Price Cut');
  const [expectedResult, setExpectedResult] = useState('Less Profit');

  const [simulationData, setSimulationData] = useState([]);
  const [verdictData, setVerdictData] = useState(null);

  // Toggles for the 5 projection lines
  const [visibleLines, setVisibleLines] = useState({
    profit: true,
    marketShare: true,
    revenue: false,
    expenses: false,
    customers: false
  });

  const hasRivals = businessProfile?.rivals && businessProfile.rivals.length > 0;

  // Mock static charts data
  const acquisitionData = [
    { name: 'Viber', value: 45 },
    { name: 'Telegram', value: 30 },
    { name: 'Walk-in', value: 20 },
    { name: 'Referral', value: 5 }
  ];

  const segmentData = [
    { name: 'Regulars', value: 60 },
    { name: 'Occasional', value: 25 },
    { name: 'One-timers', value: 15 }
  ];

  const runSimulation = async () => {
    setStage('running');
    setLogs([]);
    setProgress(0);
    setError(null);

    const totalRounds = 8;
    const mockLogs = [
      language === 'mm' ? 'အဆင့် ၁ - လက်လီဖောက်သည် ကိုယ်စားလှယ်များ ဆန်းစစ်နေသည် (အချက် ၄၀)...' : 'Round 1: Initializing merchant swarm agents (40 agents)...',
      language === 'mm' ? 'အဆင့် ၂ - ပြိုင်ဘက်များ၏ အရောင်းပမာဏကို တွက်ချက်နေသည်...' : 'Round 2: Competitors assessing retail order volumes...',
      language === 'mm' ? 'အဆင့် ၃ - ဖောက်သည်များ၏ ကြွေးမြီတောင်းဆိုမှုများအား တွက်ချက်နေသည်...' : 'Round 3: Shopkeepers requesting credit terms...',
      language === 'mm' ? 'အဆင့် ၄ - ပြိုင်ဘက်ဆိုင်များ၏ ဈေးနှုန်းအားပြိုင်မှုကို ဆန်းစစ်နေသည်...' : 'Round 4: Competitor launching matching pricing campaigns...',
      language === 'mm' ? 'အဆင့် ၅ - ကုန်ပစ္စည်းလက်ကျန် အခြေအနေများအား တိုက်ဆိုင်စစ်ဆေးနေသည်...' : 'Round 5: Coalition forming: 3 competitor partners matching inventory...',
      language === 'mm' ? 'အဆင့် ၆ - ဖောက်သည်ပြောင်းလဲမှု အလားအလာများအား ဆန်းစစ်နေသည်...' : 'Round 6: Retailer agents showing high migration to credit programs...',
      language === 'mm' ? 'အဆင့် ၇ - ကုန်ပစ္စည်းရရှိနိုင်မှု လမ်းကြောင်းများကို ဆန်းစစ်နေသည်...' : 'Round 7: Wholesale suppliers adjusting operational costs...',
      language === 'mm' ? 'အဆင့် ၈ - ခန့်မှန်းချက်ရလဒ်များကို စုစည်းတွက်ချက်ပြီးစီးပါပြီ...' : 'Round 8: Completing scenario analysis and compiling profit verdict report...'
    ];

    for (let i = 0; i < totalRounds; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setLogs(prev => [...prev, mockLogs[i]]);
      setProgress(((i + 1) / totalRounds) * 100);
    }

    try {
      const result = await api.runSimulation('main', ratios);

      // Generate projection curves based on profile and sales history
      let derivedMonthlySales = 0;
      let derivedMonthlyExpenses = 0;
      if (businessProfile?.salesHistory && businessProfile.salesHistory.length > 0) {
        derivedMonthlySales = businessProfile.salesHistory.slice(-30).reduce((sum, h) => sum + (h.sales || 0), 0);
        derivedMonthlyExpenses = businessProfile.salesHistory.slice(-30).reduce((sum, h) => sum + (h.expenses || 0), 0);
      }
      
      const monthlySales = derivedMonthlySales || businessProfile?.sales?.monthly || 12000;
      const monthlyExpenses = derivedMonthlyExpenses || businessProfile?.expenses || 8000;
      const compRatio = hasRivals ? (ratios.competitors / 100) : 0.7;
      const custRatio = ratios.customers / 100;
      const distRatio = ratios.distributors / 100;

      const initialCustomers = businessProfile?.customers && businessProfile.customers.length > 0 ? businessProfile.customers.length * 12 : 180;

      const points = [];
      for (let step = 1; step <= 6; step++) {
        let revenue = monthlySales;
        let expenses = monthlyExpenses;
        let marketShare = 65;
        let customers = initialCustomers;

        if (targetScenario.includes('Price') || targetScenario.includes('Cut')) {
          marketShare -= step * (compRatio * 5);
          revenue -= step * (compRatio * (monthlySales * 0.04));
          customers -= step * (compRatio * 10);
        } else if (targetScenario.includes('Credit') || targetScenario.includes('Demand')) {
          revenue += step * (custRatio * (monthlySales * 0.02));
          expenses += step * (custRatio * (monthlyExpenses * 0.05));
          marketShare += step * (custRatio * 1.5);
        } else if (targetScenario.includes('Chain') || targetScenario.includes('Inflation')) {
          expenses += step * ((1 - distRatio) * (monthlyExpenses * 0.08));
          marketShare -= step * 0.8;
        } else {
          revenue += step * (custRatio * (monthlySales * 0.015)) - step * (compRatio * (monthlySales * 0.01));
        }

        const profit = revenue - expenses;
        points.push({
          name: `Month ${step}`,
          profit: Math.round(profit),
          marketShare: Math.round(Math.max(0, Math.min(100, marketShare))),
          revenue: Math.round(revenue),
          expenses: Math.round(expenses),
          customers: Math.round(Math.max(0, customers))
        });
      }

      setSimulationData(points);

      // Dynamic AI suggestions matching selection
      const firstRivalMm = businessProfile?.rivals && businessProfile.rivals.length > 0 ? businessProfile.rivals[0].name : "ပြိုင်ဘက်များ";
      const firstRivalEn = businessProfile?.rivals && businessProfile.rivals.length > 0 ? businessProfile.rivals[0].name : "rivals";

      let recommendationText = "";
      if (targetScenario.includes('Price') || targetScenario.includes('Cut')) {
        recommendationText = language === 'mm'
          ? `ပြိုင်ဘက် "${firstRivalMm}" ၏ ဈေးနှုန်းအားပြိုင်မှု (${ratios.competitors}%) ကြောင့် နောက် ၆ လအတွင်း အသားတင်အမြတ် ကျဆင်းသွားနိုင်ပါသည်။ စျေးနှုန်းလျှော့ချပြီး တိုက်ရိုက်ယှဉ်ပြိုင်မည့်အစား Viber/Telegram မှတဆင့် ဖောက်သည်ဟောင်းများအား အထူးသစ္စာရှိမှုအစီအစဉ် (Loyalty Program) များ ဖန်တီးပေးခြင်းဖြင့် ဈေးကွက်ဝေစုကို ထိန်းသိမ်းရန် အကြံပြုအပ်ပါသည်။ ၎င်းသည် သင်ခန့်မှန်းထားသော "${expectedResult}" ရလဒ်ထက် ပိုမိုကောင်းမွန်စေပါမည်။`
          : `High competitive pressure (${ratios.competitors}%) from "${firstRivalEn}" will likely erode net profit within 6 months. Rather than engaging in direct price wars, we recommend launching exclusive loyalty programs via Viber and Telegram channels to protect margins, helping mitigate the expected "${expectedResult}" outcome.`;
      } else if (targetScenario.includes('Credit') || targetScenario.includes('Demand')) {
        recommendationText = language === 'mm'
          ? `ဖောက်သည်များ၏ အကြွေးဝယ်ယူလိုအား တိုးတက်လာသဖြင့် ကုန်ကျစရိတ် မြင့်တက်လာနိုင်ပါသည်။ အကြွေးကို စနစ်တကျစီမံရန်အတွက် အမှာစာအသစ်များ၏ ၂၀% အား လက်ငင်းငွေချေစနစ်ဖြင့် ပေးချေစေခြင်း သို့မဟုတ် အရောင်းပမာဏများပြားသော ဖောက်သည်အချို့ကိုသာ ကန့်သတ်ခွင့်ပြုရန် အကြံပြုပါသည်။ ၎င်းသည် "${expectedResult}" ဖြစ်ပေါ်မှုမှ ကာကွယ်ပေးပါမည်။`
          : `High credit demands are projected to inflate operating overheads. To manage outstanding cash safely, implement a policy requiring at least 20% down-payment on new cargo orders, protecting the store from the expected "${expectedResult}" scenario.`;
      } else {
        recommendationText = language === 'mm'
          ? `ထောက်ပံ့ပို့ဆောင်ရေးကုန်ကျစရိတ်များ မြင့်တက်မှုနှင့် စျေးကွက်အပြောင်းအလဲများ ရှိနေသော်လည်း အရောင်းရငွေအား တည်ငြိမ်အောင် ထိန်းထားနိုင်ပါသည်။ ကုန်ပစ္စည်းပြတ်လပ်မှုအန္တရာယ်မှ ကာကွယ်ရန် ကုန်ပစ္စည်းသိုလှောင်မှု ပမာဏကို ၁၅% ခန့် တိုးမြှင့်စုဆောင်းထားရန် အကြံပြုအပ်ပါသည်။ ၎င်းသည် "${expectedResult}" ကို လျှော့ချပေးပါမည်။`
          : `Supply chain bottlenecks are driving operational expenses upward. To prevent stockouts on key high-margin goods, consider diversifying suppliers and building a 15% safety stock buffer for core inventory products, directly addressing "${expectedResult}".`;
      }

      setVerdictData({
        confidence: result.confidence || 0.85,
        verdict: recommendationText,
        criticalAgents: result.criticalAgents || [],
        aiInsights: [
          {
            id: 'income',
            title: language === 'mm' ? 'ဝင်ငွေနှင့် ခန့်မှန်းချက်' : 'Income and Prediction',
            icon: TrendingUp,
            blocks: [
              {
                desc: language === 'mm'
                  ? 'ရက် ၇ နှင့် ၇ ရက် ခန့်မှန်းချက်အရ လွန်ခဲ့သော ၇ ရက်အတွင်း အရောင်းအဝယ် အချက်အလက်များကို အခြေခံ၍ လာမည့်ရက်သတ္တပတ်အတွက် ဈေးကွက်ဝယ်လိုအားနှင့် အရောင်းပမာဏကို အသေးစိတ် ခန့်မှန်းတွက်ချက်ထားပါသည်။ ဤအချက်အလက်များကို အသုံးပြု၍ သင်၏လုပ်ငန်းလည်ပတ်မှုကို ကြိုတင်ပြင်ဆင်နိုင်ပါသည်။'
                  : 'Based on the 7-day and 7-day forecast, we have analyzed the sales data from the past week to predict market demand and sales volume for the upcoming week in detail. You can use these insights to proactively prepare your business operations.'
              },
              {
                desc: language === 'mm'
                  ? 'ပြိုင်ဘက်ဈေးနှုန်းများကြောင့် ဝင်ငွေ ၄% ကျဆင်းနိုင်ပါသည်။ ပြိုင်ဘက်ဆိုင်များ၏ ဈေးနှုန်းလျှော့ချ အရောင်းမြှင့်တင်မှုများကြောင့် လာမည့်ကာလအတွင်း သင့်လုပ်ငန်း၏ ဝင်ငွေပမာဏမှာ ၄% ခန့် ကျဆင်းနိုင်ခြေရှိသဖြင့် ကြိုတင်ကာကွယ်မှုများ ပြုလုပ်ထားရန် အရေးကြီးပါသည်။'
                  : 'Revenue could drop by 4% due to competitor pricing. Due to price-reduction campaigns by local competitors, your business revenue is projected to decline by approximately 4% in the upcoming period, making it crucial to take preventive measures.'
              },
              {
                desc: language === 'mm'
                  ? 'အရောင်းပမာဏထိန်းထားရန် လျှော့ဈေးအစီအစဉ်စဉ်းစားပါ။ ရောင်းအားပမာဏ ကျဆင်းမသွားစေရန်နှင့် လက်ရှိဖောက်သည်များကို ဆက်လက်ထိန်းသိမ်းထားရန် ကုန်ပစ္စည်းအချို့တွင် ကန့်သတ်ကာလတို လျှော့ဈေး သို့မဟုတ် ဝယ်ယူမှုပမာဏအလိုက် မက်လုံးပေးစနစ်များကို ပြုလုပ်ရန် စဉ်းစားသင့်သည်။'
                  : 'Consider a discount program to maintain sales volume. To prevent sales volume from dropping and to retain existing loyal customers, you should consider offering short-term limited discounts on selected items or volume-based incentives.'
              },
              {
                desc: language === 'mm'
                  ? 'လုပ်ငန်းလည်ပတ်ငွေအခြေအနေ ကောင်းမွန်စေရန် Viber မှတဆင့် ငွေတောင်းခံလွှာစနစ်ကို စနစ်တကျ ပြုလုပ်ထားပါ။ လုပ်ငန်း၏ နေ့စဉ်ငွေစီးဆင်းမှု ပြတ်တောက်မှုမရှိစေရန်အတွက် ကုန်ပစ္စည်းဝယ်ယူပြီးသော ဖောက်သည်များထံသို့ Viber မှတစ်ဆင့် Invoices များကို စနစ်တကျ ပေးပို့ပြီး ငွေချေရန် သတိပေးချက်များကို ပုံမှန်ပြုလုပ်သင့်သည်။'
                  : 'Properly set up an invoice system via Viber to improve cash flow status. To maintain a smooth daily cash flow without interruptions, ensure you systematically send digital invoices via Viber to buyers and set up regular payment reminders.'
              }
            ]
          },
          {
            id: 'swot',
            title: language === 'mm' ? 'SWOT သုံးသပ်ချက်' : 'SWOT Analysis',
            icon: Lightbulb,
            blocks: [
              {
                desc: language === 'mm'
                  ? 'အားသာချက်၊ အားနည်းချက်၊ အခွင့်အလမ်းနှင့် ခြိမ်းခြောက်မှုများကို ၃ ချက်စီ ခွဲခြမ်းစိတ်ဖြာထားပါသည်။ လုပ်ငန်း၏ အတွင်းပိုင်းအခြေအနေနှင့် ပြင်ပဈေးကွက်စိန်ခေါ်မှုများကို သုံးသပ်ပြီး စီမံခန့်ခွဲမှုမဟာဗျူဟာကို စနစ်တကျ ညှိနှိုင်းနိုင်ရန် အဓိကအချက်များကို အသေးစိတ် ဖော်ထုတ်ပြသထားခြင်း ဖြစ်ပါသည်။'
                  : '3 points each of strengths, weaknesses, opportunities, and threats have been analyzed. By evaluating the internal conditions of the business and external market challenges, we have identified key factors in detail to help you systematically adjust your management strategy.'
              },
              {
                desc: language === 'mm'
                  ? 'အားသာချက်: ဖောက်သည်ဟောင်းများ၏ ယုံကြည်မှု ဆက်လက်ခိုင်မာနေသည်။ သင့်လုပ်ငန်း၏ အကြီးမားဆုံး အားသာချက်မှာ ကာလရှည်ဝယ်ယူလာခဲ့သော ဖောက်သည်ဟောင်းများ၏ ခိုင်မာသော ယုံကြည်ကိုးစားမှုနှင့် Viber/Telegram အုပ်စုများမှတစ်ဆင့် ဆက်သွယ်ရေး ကောင်းမွန်နေခြင်း ဖြစ်သည်။'
                  : 'Strength: Core customer loyalty remains consistently high. Your store\'s primary strength lies in the strong, enduring trust developed with long-term customers and robust digital connections established via your active Viber and Telegram channels.'
              },
              {
                desc: language === 'mm'
                  ? 'ခြိမ်းခြောက်မှု: ကုန်စည်စီးဆင်းမှု ပြတ်တောက်နိုင်သည့် အန္တရာယ်ရှိသည်။ လက်ရှိသယ်ယူပို့ဆောင်ရေး အခက်အခဲများနှင့် လမ်းခရီးအခြေအနေများကြောင့် အရေးကြီးကုန်ပစ္စည်းများ အချိန်မီ မရောက်ရှိဘဲ လုပ်ငန်းလည်ပတ်မှု ရုတ်တရက် ပြတ်တောက်သွားနိုင်သည့် ပြင်ပခြိမ်းခြောက်မှု ရှိနေပါသည်။'
                  : 'Threat: Immediate risk from new supply chain disruptions. Due to current transportation bottlenecks and unpredictable logistical delays, there is an external threat that critical inventory products may not arrive on time, causing sudden operational stockouts.'
              },
              {
                desc: language === 'mm'
                  ? 'စိန်ခေါ်မှု: ပြိုင်ဘက်များ၏ ဈေးနှုန်းချအရောင်းမြှင့်တင်မှုများနှင့် ခရက်ဒစ်ပေးစနစ်များကြောင့် စိန်ခေါ်မှုရှိသည်။ ပြိုင်ဘက်ဆိုင်များမှ ဈေးနှုန်းလျှော့ချခြင်းနှင့် ကာလရှည်အကြွေးဝယ်ယူခွင့် (Credit Extensions) များ ပေးအပ်လာခြင်းသည် သင့်ဆိုင်၏ အရောင်းအဝယ်ကို ထိခိုက်စေနိုင်သည့် စိန်ခေါ်မှုတစ်ခု ဖြစ်သည်။'
                  : 'Challenge: Competitor aggressive pricing campaigns and credit extensions could impact store margins. Aggressive price-matching campaigns and flexible credit terms launched by rival stores present a significant challenge to your business\'s overall profitability.'
              }
            ]
          },
          {
            id: 'segments',
            title: language === 'mm' ? 'ဖောက်သည် အုပ်စုများ' : 'Customer Segments',
            icon: Users,
            blocks: [
              {
                desc: language === 'mm'
                  ? 'လက်ရှိဝယ်ယူသူများကို ဝယ်ယူမှုအကြိမ်ရေနှင့် ပမာဏအပေါ် မူတည်၍ ဖောက်သည်အုပ်စု ခွဲခြားသတ်မှတ်ထားပြီး အဓိကအုပ်စု ၁ ခုကို အာရုံစိုက်ရန် ဖော်ထုတ်ထားပါသည်။ ဤသို့ခွဲခြားခြင်းဖြင့် ပစ်မှတ်ထားသော အရောင်းမြှင့်တင်ရေး အစီအစဉ်များကို ပိုမိုထိရောက်စွာ လုပ်ဆောင်နိုင်မည် ဖြစ်သည်။'
                  : 'Customers are classified based on purchase frequency and volumes, identifying one critical target segment for immediate optimization. This detailed segmentation allows you to execute highly targeted and effective promotional campaigns.'
              },
              {
                desc: language === 'mm'
                  ? 'လက်ကားဝယ်ယူသူများကို ပိုမိုအာရုံစိုက်ပါ။ လုပ်ငန်း၏ ရောင်းအားအများစုမှာ လက်ကားဝယ်ယူသူများထံမှ လာခြင်းဖြစ်သောကြောင့် ၎င်းတို့၏ တိကျသော လိုအပ်ချက်များနှင့် ကြီးမားသော မှာယူမှုများကို အဓိကထား၍ အထူးဂရုစိုက် ဆောင်ရွက်ပေးသင့်ပါသည်။'
                  : 'Focus specifically on wholesale buyers who are price-sensitive. Since regular wholesale buyers account for the vast majority of your volume stability, prioritizing their specific order demands and addressing their needs is crucial for sustained growth.'
              },
              {
                desc: language === 'mm'
                  ? 'SMS သို့မဟုတ် Viber မှတဆင့် တိုက်ရိုက်ပရိုမိုးရှင်း ပေးပို့ပါ။ ဖောက်သည်များထံသို့ ယေဘုယျကြော်ငြာများ ပေးပို့မည့်အစား မှတ်တမ်းများကို အခြေခံ၍ ရည်ရွယ်ချက်ရှိရှိ တိုက်ရိုက် ပရိုမိုးရှင်းကမ်းလှမ်းချက်များကို SMS နှင့် Viber မှတစ်ဆင့် ကိုယ်တိုင်ကိုယ်ကျ ပေးပို့ပါ။'
                  : 'Avoid broad marketing; target direct SMS campaigns. Instead of sending generic mass advertisements to all customers, utilize purchase histories to send highly personalized, direct promotional offers via SMS or your dedicated Viber channels.'
              },
              {
                desc: language === 'mm'
                  ? 'တန်ဖိုးမြင့် VIP ဖောက်သည်များအတွက် သီးသန့်ဝယ်ယူခွင့်နှင့် လျှော့ဈေးများကို Viber အဖွဲ့တွင် ဦးစားပေးပေးအပ်ပါ။ ဝယ်ယူမှုအများဆုံး VIP ဖောက်သည်များအတွက် ကုန်ပစ္စည်းအသစ်များကို ဦးစားပေးဝယ်ယူခွင့်နှင့် အထူးလျှော့ဈေးများကို Viber VIP အုပ်စုတွင် သီးသန့်စီစဉ်ပေးပါ။'
                  : 'Design premium loyalty incentives specifically targeting VIP buyers. Provide exclusive early product access and highly customized VIP discounts within private Viber groups to ensure the long-term retention of your most valuable high-tier accounts.'
              }
            ]
          },
          {
            id: 'suggestions',
            title: language === 'mm' ? 'AI အကြံပြုချက်များ' : 'AI Suggestions',
            icon: Sparkles,
            blocks: [
              {
                desc: language === 'mm'
                  ? 'လုပ်ငန်းရေရှည်တိုးတက်စေရန်အတွက် အရောင်းမြှင့်တင်ရေး၊ ကုန်ပစ္စည်းရွေးချယ်မှု၊ ဈေးနှုန်းသတ်မှတ်မှုနှင့် လုပ်ငန်းတိုးချဲ့ရေး စသည့် ကဏ္ဍ ၄ ခုလုံးအတွက် မဟာဗျူဟာများကို ပေါင်းစပ်အသုံးပြုရန် အကြံပြုထားသည်။ ၎င်းတို့ကို အချိုးညီညီ အကောင်အထည်ဖော်ခြင်းက အကျိုးအမြတ်ကို အမြင့်ဆုံးရောက်စေမည်ဖြစ်သည်။'
                  : 'Integrated strategies across promotions, product mix, pricing tiers, and business growth parameters are recommended. Implementing these carefully balanced, multi-faceted approaches concurrently will maximize your overall profitability and ensure long-term, sustainable market growth.'
              },
              {
                desc: language === 'mm'
                  ? 'ကုန်ပစ္စည်းမဟာဗျူဟာ: ရောင်းအားနည်းသည့် ပစ္စည်းများကို အရောင်းသွက်ပစ္စည်းများနှင့် တွဲရောင်းပါ။ သိုလှောင်ရုံတွင် ကုန်ပစ္စည်းသက်တမ်း ကြာမြင့်နေသော ကုန်ပစ္စည်းများကို အရောင်းရဆုံးကုန်ပစ္စည်းများနှင့် တွဲဖက်၍ ရောင်းချခြင်း (Bundling) ဖြင့် ကုန်ပစ္စည်းလည်ပတ်မှုကို လျင်မြန်စေပြီး နေရာလွတ်များကို ဖန်တီးနိုင်မည်ဖြစ်သည်။'
                  : 'Product Strategy: Bundle slow-moving items with high-demand goods. Strategically pairing aged warehouse inventory with your fastest-selling products through intelligent bundling will significantly accelerate your overall inventory turnover and swiftly clear out valuable shelf space.'
              },
              {
                desc: language === 'mm'
                  ? 'ဈေးနှုန်းမဟာဗျူဟာ: ပြိုင်ဘက်ဈေးနှုန်းများနှင့် တူညီအောင်ထား၍ ငွေပေးချေမှုသက်တမ်းကို လျှော့ချပါ။ ဈေးနှုန်းကို ပြိုင်ဘက်ဆိုင်များနှင့် တူညီစွာ ထားရှိသော်လည်း အကြွေးပေးချေမှု သက်တမ်းကို တိုတောင်းအောင် ညှိနှိုင်းခြင်းဖြင့် သင့်ဆိုင်၏ ရင်းနှီးငွေလည်ပတ်မှုကို မြန်ဆန်စွာ ပြန်လည်ရရှိစေမည်ဖြစ်သည်။'
                  : 'Pricing Strategy: Match competitor prices but strictly reduce payment terms. While matching local retail prices keeps you competitive, aggressively negotiating shorter credit payment cycles with buyers is essential to protect and rapidly replenish your operational cash reserves.'
              },
              {
                desc: language === 'mm'
                  ? 'လက်ကားဝယ်ယူသူများအတွက် ခရက်ဒစ်ငွေပေးချေမှု သက်တမ်းနှင့် ကန့်သတ်ချက်များကို စနစ်တကျ သတ်မှတ်ထားပါ။ လက်ကားဝယ်သူများအား အကြွေးဝယ်ခွင့်ပြုရာတွင် ဝယ်သူတစ်ဦးချင်းစီအလိုက် ခရက်ဒစ်ကန့်သတ်ချက် (Credit Limit) နှင့် ငွေပြန်ဆပ်ရမည့် သက်တမ်းကို တိကျစွာ သတ်မှတ်ထားရန် လိုအပ်ပါသည်။'
                  : 'Customize wholesale credit policies and tightly enforce credit limits. When extending credit to wholesale partners, it is critically important to clearly define individualized credit limits and strictly enforce payment timelines to safeguard the store\'s operating cash flow.'
              }
            ]
          }
        ]
      });

      setStage('results');
    } catch (err) {
      console.error(err);
      setError("Failed to run prediction swarm.");
      setStage('setup');
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* HEADER */}
      <header>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {t.analyticsTitle}
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {language === 'mm' ? "စက်မှုဥာဏ်ရည်သုံး စျေးကွက်ခန့်မှန်းချက်များနှင့် မဟာဗျူဟာအကြံပြုချက်များ" : "Swarm intelligence simulation & business projections"}
        </p>
      </header>

      {/* 1. STRATEGIC KPI GRID (2x2) */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { 
            label: t.activeCustomers, 
            val: "184", 
            icon: Users,
            color: 'var(--positive)',
            trend: language === 'mm' ? '+၅.၂% တိုးလာသည်' : '+5.2% growth'
          },
          { 
            label: t.totalConnections, 
            val: "34", 
            icon: Activity,
            color: 'var(--accent)',
            trend: language === 'mm' ? 'လည်ပတ်နေသည်' : 'Active'
          },
          { 
            label: t.competitiveSignals, 
            val: "8", 
            icon: ShieldAlert,
            color: 'var(--critical)',
            trend: language === 'mm' ? '၂ ခု သတိပေးချက်' : '2 alerts'
          },
          { 
            label: t.intelligenceSources, 
            val: "12", 
            icon: FileText,
            color: 'var(--caution)',
            trend: language === 'mm' ? '၁၀၀% စင့်ခ်ဖြစ်သည်' : '100% synced'
          }
        ].map((item, idx) => (
          <div 
            key={idx}
            style={{
              background: 'var(--bg-surface)', 
              border: '1px solid var(--border-default)',
              borderRadius: '16px', 
              padding: '16px 20px', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.01)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="mono" style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                {item.label}
              </span>
              <div className="font-number" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {item.val}
              </div>
              <span style={{ fontSize: '10px', color: item.color, fontWeight: 500 }}>
                {item.trend}
              </span>
            </div>
            <div style={{
              color: item.color,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border-default)',
              flexShrink: 0
            }}>
              <item.icon size={18} />
            </div>
          </div>
        ))}
      </section>

      {/* 2. MAIN PREDICTIVE SIMULATION PANEL */}
      <section style={{
        background: 'var(--bg-surface)', borderRadius: '24px',
        border: '1px solid var(--border-default)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
          <Cpu size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {language === 'mm' ? "AI စျေးကွက်အသွင်တူဆန်းစစ်ချက် မော်ဒယ်" : "AI Swarm Predictive Simulation"}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {language === 'mm' ? "စျေးကွက်အခြေအနေများပြောင်းလဲပြီး ၆ လပတ် အရောင်းရလဒ်များကို ခန့်မှန်းကြည့်ပါ" : "Simulate forecast models based on market parameters"}
            </p>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(163, 61, 92, 0.1)', color: 'var(--critical)', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '28px', alignItems: 'start' }}>
          
          {/* Setup Configuration Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
              {t.marketConditions}
            </h4>


            {/* Slider 1: Competitors */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.competitorAggressive}</span>
                <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ratios.competitors}%</span>
              </div>
              <input
                type="range" min="10" max="100" value={ratios.competitors}
                onChange={e => setRatios({ ...ratios, competitors: parseInt(e.target.value) })}
                disabled={stage === 'running'}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 2: Retailer Engagement */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.retailerEngagement}</span>
                <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ratios.customers}%</span>
              </div>
              <input
                type="range" min="10" max="100" value={ratios.customers}
                onChange={e => setRatios({ ...ratios, customers: parseInt(e.target.value) })}
                disabled={stage === 'running'}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 3: Supply capacity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.supplyCapacity}</span>
                <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ratios.distributors}%</span>
              </div>
              <input
                type="range" min="10" max="100" value={ratios.distributors}
                onChange={e => setRatios({ ...ratios, distributors: parseInt(e.target.value) })}
                disabled={stage === 'running'}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>

            {stage !== 'running' && (
              <button
                onClick={runSimulation}
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  padding: '10px 16px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Play size={12} fill="currentColor" /> {t.runSimulationBtn}
              </button>
            )}

            {stage === 'running' && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', padding: '10px' }}>
                {language === 'mm' ? "စနစ်တွက်ချက်မှုများ ပြုလုပ်နေသည်..." : "Simulating swarm model..."}
              </div>
            )}
          </div>

          {/* Chart & Suggestion Output Column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {stage === 'setup' && (
              <div style={{
                height: '420px', border: '1.5px dashed var(--border-default)', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)'
              }}>
                <Cpu size={32} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {language === 'mm' ? "ခန့်မှန်းတွက်ချက်ရန် အချက်အလက်များ အသင့်ရှိပါသည်" : "Simulation Model Ready"}
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', maxWidth: '300px', marginTop: '6px' }}>
                  {language === 'mm' ? "သတ်မှတ်ချက်များကို ချိန်ညှိပြီး 'ခန့်မှန်းချက် တွက်ချက်မည်' ကို နှိပ်ပါ" : "Adjust conditions on the left pane and initialize simulation graph."}
                </p>
              </div>
            )}

            {stage === 'running' && (
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <SimulationSkeleton showCards={false} />
              </div>
            )}

            {stage === 'results' && (
              <div className="space-y-6 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. DYNAMIC AI SUGGESTION TEXT BLOCK */}
                <div style={{
                  background: 'var(--bg-gradient-1)', border: '1px solid var(--border-default)',
                  borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                      <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {language === 'mm' ? 'AI ခွဲခြမ်းစိတ်ဖြာချက် အကျဉ်းချုပ်' : 'Overview of AI Graph Analysis'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onStartInterrogation(verdictData.criticalAgents)}
                      style={{
                        background: 'var(--accent)', color: '#fff', border: 'none',
                        padding: '6px 12px', borderRadius: '6px', fontSize: '11px',
                        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Sparkles size={10} /> {t.consultAgentsBtn}
                    </button>
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {verdictData.verdict}
                  </p>
                </div>

                {/* 2. 5-LINE PROJECTION CHART */}
                <div style={{ border: '1px solid var(--border-default)', borderRadius: '16px', padding: '20px', background: 'var(--bg-surface)' }}>
                  <div style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={simulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        
                        {visibleLines.profit && <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} name="Net Profit (MMK)" dot={{ r: 3 }} />}
                        {visibleLines.revenue && <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={1.5} name="Revenue (MMK)" dot={{ r: 2 }} />}
                        {visibleLines.expenses && <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={1.5} name="Expenses (MMK)" dot={{ r: 2 }} />}
                        {visibleLines.customers && <Line type="monotone" dataKey="customers" stroke="#8b5cf6" strokeWidth={1.5} name="Customers" dot={{ r: 2 }} />}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 5-Line Checkboxes */}
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center',
                    paddingTop: '14px', borderTop: '1px solid var(--border-default)', marginTop: '12px'
                  }}>
                    {[
                      { key: 'profit', label: language === 'mm' ? "အသားတင်အမြတ်" : "Net Profit", color: '#10b981' },
                      { key: 'revenue', label: language === 'mm' ? "စုစုပေါင်းဝင်ငွေ" : "Revenue", color: '#0284c7' },
                      { key: 'expenses', label: language === 'mm' ? "ကုန်ကျစရိတ်" : "Expenses", color: '#ef4444' },
                      { key: 'customers', label: language === 'mm' ? "ဖောက်သည်ဦးရေ" : "Customers", color: '#8b5cf6' }
                    ].map(item => (
                      <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={visibleLines[item.key]}
                          onChange={() => setVisibleLines(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          style={{ accentColor: item.color, cursor: 'pointer' }}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </section>

      {/* 3. 4 MAJOR AI SUGGESTION CARDS GRID (rendered outside the simulation panel) */}
      {stage === 'running' && (
        <div className="animate-fade-in" style={{ width: '100%' }}>
          <SimulationSkeleton showGraph={false} />
        </div>
      )}

      {stage === 'results' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
          {verdictData.aiInsights?.map((insight) => {
            const IconComponent = insight.icon;
            const isExpanded = expandedCardId === insight.id;
            return (
              <div key={insight.id} className="ai-suggestion-card" style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                borderRadius: '16px', display: 'flex', flexDirection: 'column',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)', overflow: 'hidden'
              }}>
                {/* Header Bar */}
                <div 
                  onClick={() => {
                    setExpandedCardId(isExpanded ? null : insight.id);
                    setExpandedBlockIdx(null);
                  }}
                  style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                    padding: '20px 24px', cursor: 'pointer', userSelect: 'none',
                    background: isExpanded ? 'var(--bg-elevated)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid var(--border-default)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <IconComponent size={20} style={{ color: 'var(--text-primary)', opacity: 0.8 }} />
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {insight.title}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '3px 8px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                      {language === 'mm' ? '၄ ချက်' : '4 Insights'}
                    </span>
                    <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </div>
                {/* Collapsible Content - Insight Blocks */}
                {isExpanded && (
                  <div style={{ padding: '24px' }} className="animate-fade-in">
                    {expandedBlockIdx === null ? (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {insight.blocks.map((block, idx) => (
                          <div 
                            key={idx} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedBlockIdx(idx);
                            }}
                            style={{
                              background: 'var(--bg-base)', padding: '16px', borderRadius: '12px',
                              border: '1px solid var(--border-default)', 
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              cursor: 'pointer', userSelect: 'none', transition: 'all 0.2s ease'
                            }}
                          >
                            <div className="mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-primary)', fontWeight: 600 }}>
                              {language === 'mm' ? `အချက် ${idx + 1}` : `Insight ${idx + 1}`}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="animate-fade-in" style={{
                        background: 'var(--bg-base)', padding: '20px', borderRadius: '12px',
                        border: '1px solid var(--accent)', display: 'flex', flexDirection: 'column', gap: '16px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-default)', paddingBottom: '12px' }}>
                          <div className="mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600 }}>
                            {language === 'mm' ? `အချက် ${expandedBlockIdx + 1}` : `Insight ${expandedBlockIdx + 1}`}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedBlockIdx(null);
                            }}
                            style={{
                              background: 'transparent', border: '1px solid var(--border-default)', padding: '6px 10px', borderRadius: '6px',
                              fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            {language === 'mm' ? 'ပိတ်ရန်' : 'Close'} <ChevronUp size={12} />
                          </button>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                          {insight.blocks[expandedBlockIdx].desc}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. TWO COLUMN REGION: CHANNELS & SEGMENTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Customer Acquisition Channels */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '20px',
          padding: '24px', border: '1px solid var(--border-default)'
        }}>
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '16px' }}>
            {t.channelsTitle}
          </h3>
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={acquisitionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segments Alignment */}
        <div style={{
          background: 'var(--bg-surface)', borderRadius: '20px',
          padding: '24px', border: '1px solid var(--border-default)'
        }}>
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '16px' }}>
            {t.segmentsTitle}
          </h3>
          <div style={{ width: '100%', height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" fill="var(--entity-company)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
