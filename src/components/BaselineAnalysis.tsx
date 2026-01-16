import { useState, useEffect } from 'react';
import { Save, CheckCircle2, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface BaselineAnalysisProps {
  lessonId: string;
  pathId: string;
}

interface AnalysisData {
  timeSinks: {
    mostTime: string;
    surprises: string;
    longerThanExpected: string;
  };
  interruptions: {
    frequency: string;
    causes: string;
    contextSwitchCost: string;
  };
  valueAnalysis: {
    highValue: string;
    necessaryLowValue: string;
    waste: string;
  };
  aiOpportunities: {
    tier1Activities: string;
    mostFrequent: string;
    mostFrustrating: string;
  };
  topWorkflows: Array<{
    activity: string;
    tier: number;
    currentHours: string;
    targetHours: string;
  }>;
  qualityStandards: Array<{
    activity: string;
    measure: string;
  }>;
  outputBaseline: {
    emailsSent: string;
    documentsWritten: string;
    reportsDelivered: string;
    meetingsConducted: string;
    projectsCompleted: string;
    customMetric: string;
    customMetricName: string;
  };
  satisfactionBaseline: {
    jobSatisfaction: number;
    workloadManageability: number;
    stressLevel: number;
    creativeFulfillment: number;
    workLifeBalance: number;
  };
}

const defaultData: AnalysisData = {
  timeSinks: { mostTime: '', surprises: '', longerThanExpected: '' },
  interruptions: { frequency: '', causes: '', contextSwitchCost: '' },
  valueAnalysis: { highValue: '', necessaryLowValue: '', waste: '' },
  aiOpportunities: { tier1Activities: '', mostFrequent: '', mostFrustrating: '' },
  topWorkflows: [
    { activity: '', tier: 1, currentHours: '', targetHours: '' },
    { activity: '', tier: 1, currentHours: '', targetHours: '' },
    { activity: '', tier: 1, currentHours: '', targetHours: '' }
  ],
  qualityStandards: [
    { activity: '', measure: '' },
    { activity: '', measure: '' },
    { activity: '', measure: '' }
  ],
  outputBaseline: {
    emailsSent: '',
    documentsWritten: '',
    reportsDelivered: '',
    meetingsConducted: '',
    projectsCompleted: '',
    customMetric: '',
    customMetricName: 'Other'
  },
  satisfactionBaseline: {
    jobSatisfaction: 5,
    workloadManageability: 5,
    stressLevel: 5,
    creativeFulfillment: 5,
    workLifeBalance: 5
  }
};

export default function BaselineAnalysis({ lessonId, pathId }: BaselineAnalysisProps) {
  const { user } = useAuth();
  const [data, setData] = useState<AnalysisData>(defaultData);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadAnalysis();
  }, [user, lessonId]);

  const loadAnalysis = async () => {
    if (!user) return;

    const { data: entry } = await supabase
      .from('lesson_journal_entries')
      .select('user_response')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .eq('prompt_text', 'BASELINE_ANALYSIS_DATA')
      .maybeSingle();

    if (entry?.user_response) {
      try {
        const parsed = JSON.parse(entry.user_response);
        setData(parsed);
      } catch (e) {
        console.error('Error parsing analysis data', e);
      }
    }
  };

  const saveAnalysis = async () => {
    if (!user) return;

    setSaving(true);
    await supabase
      .from('lesson_journal_entries')
      .upsert({
        user_id: user.id,
        path_id: pathId,
        lesson_id: lessonId,
        prompt_text: 'BASELINE_ANALYSIS_DATA',
        user_response: JSON.stringify(data),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,lesson_id,prompt_text'
      });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateTimeSinks = (field: keyof AnalysisData['timeSinks'], value: string) => {
    setData(prev => ({ ...prev, timeSinks: { ...prev.timeSinks, [field]: value } }));
  };

  const updateInterruptions = (field: keyof AnalysisData['interruptions'], value: string) => {
    setData(prev => ({ ...prev, interruptions: { ...prev.interruptions, [field]: value } }));
  };

  const updateValueAnalysis = (field: keyof AnalysisData['valueAnalysis'], value: string) => {
    setData(prev => ({ ...prev, valueAnalysis: { ...prev.valueAnalysis, [field]: value } }));
  };

  const updateAIOpportunities = (field: keyof AnalysisData['aiOpportunities'], value: string) => {
    setData(prev => ({ ...prev, aiOpportunities: { ...prev.aiOpportunities, [field]: value } }));
  };

  const updateWorkflow = (index: number, field: keyof AnalysisData['topWorkflows'][0], value: string | number) => {
    setData(prev => ({
      ...prev,
      topWorkflows: prev.topWorkflows.map((w, i) => i === index ? { ...w, [field]: value } : w)
    }));
  };

  const updateQualityStandard = (index: number, field: keyof AnalysisData['qualityStandards'][0], value: string) => {
    setData(prev => ({
      ...prev,
      qualityStandards: prev.qualityStandards.map((q, i) => i === index ? { ...q, [field]: value } : q)
    }));
  };

  const updateOutputBaseline = (field: keyof AnalysisData['outputBaseline'], value: string) => {
    setData(prev => ({ ...prev, outputBaseline: { ...prev.outputBaseline, [field]: value } }));
  };

  const updateSatisfaction = (field: keyof AnalysisData['satisfactionBaseline'], value: number) => {
    setData(prev => ({ ...prev, satisfactionBaseline: { ...prev.satisfactionBaseline, [field]: value } }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4">
          Step 1: Identify Patterns
        </h3>

        <div className="space-y-6">
          <div>
            <h4 className="font-extrabold text-sm uppercase mb-3">Time Sinks</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">What consumed the most time?</label>
                <input
                  type="text"
                  value={data.timeSinks.mostTime}
                  onChange={(e) => updateTimeSinks('mostTime', e.target.value)}
                  placeholder="e.g., Email management and ad-hoc requests"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Were there any surprises?</label>
                <input
                  type="text"
                  value={data.timeSinks.surprises}
                  onChange={(e) => updateTimeSinks('surprises', e.target.value)}
                  placeholder="e.g., Context switching took 4+ hours per week"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">What took longer than expected?</label>
                <input
                  type="text"
                  value={data.timeSinks.longerThanExpected}
                  onChange={(e) => updateTimeSinks('longerThanExpected', e.target.value)}
                  placeholder="e.g., Writing reports - 2x longer than I thought"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase mb-3">Interruptions</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">How often were you interrupted?</label>
                <input
                  type="text"
                  value={data.interruptions.frequency}
                  onChange={(e) => updateInterruptions('frequency', e.target.value)}
                  placeholder="e.g., 10-15 times per day"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">What caused most interruptions?</label>
                <input
                  type="text"
                  value={data.interruptions.causes}
                  onChange={(e) => updateInterruptions('causes', e.target.value)}
                  placeholder="e.g., Slack messages and urgent emails"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Cost of context switching?</label>
                <input
                  type="text"
                  value={data.interruptions.contextSwitchCost}
                  onChange={(e) => updateInterruptions('contextSwitchCost', e.target.value)}
                  placeholder="e.g., 20 minutes to get back to deep work"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase mb-3">Value Analysis</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">What % of time was high-value work?</label>
                <input
                  type="text"
                  value={data.valueAnalysis.highValue}
                  onChange={(e) => updateValueAnalysis('highValue', e.target.value)}
                  placeholder="e.g., 30%"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">What % was necessary low-value work?</label>
                <input
                  type="text"
                  value={data.valueAnalysis.necessaryLowValue}
                  onChange={(e) => updateValueAnalysis('necessaryLowValue', e.target.value)}
                  placeholder="e.g., 50%"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">What % was waste?</label>
                <input
                  type="text"
                  value={data.valueAnalysis.waste}
                  onChange={(e) => updateValueAnalysis('waste', e.target.value)}
                  placeholder="e.g., 20%"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-sm uppercase mb-3">AI Opportunities</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">What Tier 1 activities take most time?</label>
                <input
                  type="text"
                  value={data.aiOpportunities.tier1Activities}
                  onChange={(e) => updateAIOpportunities('tier1Activities', e.target.value)}
                  placeholder="e.g., Writing emails, research, report creation"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">What do you do most frequently?</label>
                <input
                  type="text"
                  value={data.aiOpportunities.mostFrequent}
                  onChange={(e) => updateAIOpportunities('mostFrequent', e.target.value)}
                  placeholder="e.g., Email responses, status updates"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">What's most frustrating/tedious?</label>
                <input
                  type="text"
                  value={data.aiOpportunities.mostFrustrating}
                  onChange={(e) => updateAIOpportunities('mostFrustrating', e.target.value)}
                  placeholder="e.g., Formatting documents, finding information"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" strokeWidth={2} />
          Step 2: Rank Your Top 3 Workflows
        </h3>

        <p className="text-sm mb-4">Identify the 3 most impactful workflows to automate with AI:</p>

        <div className="space-y-4">
          {data.topWorkflows.map((workflow, index) => (
            <div key={index} className="p-4 bg-[#FFF9E6] border border-black">
              <p className="font-extrabold text-xs uppercase mb-3">Workflow #{index + 1}</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Activity</label>
                  <input
                    type="text"
                    value={workflow.activity}
                    onChange={(e) => updateWorkflow(index, 'activity', e.target.value)}
                    placeholder="e.g., Email response workflow"
                    className="w-full p-2 border border-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">AI Tier</label>
                  <select
                    value={workflow.tier}
                    onChange={(e) => updateWorkflow(index, 'tier', Number(e.target.value))}
                    className="w-full p-2 border border-black text-sm"
                  >
                    <option value={1}>Tier 1 - High Impact</option>
                    <option value={2}>Tier 2 - Medium Impact</option>
                    <option value={3}>Tier 3 - Low Impact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Current Hours/Week</label>
                  <input
                    type="text"
                    value={workflow.currentHours}
                    onChange={(e) => updateWorkflow(index, 'currentHours', e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full p-2 border border-black text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Target Hours/Week</label>
                  <input
                    type="text"
                    value={workflow.targetHours}
                    onChange={(e) => updateWorkflow(index, 'targetHours', e.target.value)}
                    placeholder="e.g., 2.5"
                    className="w-full p-2 border border-black text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4">
          Step 3: Define Quality Standards
        </h3>

        <p className="text-sm mb-4">Define how you'll measure quality to ensure AI maintains your standards:</p>

        <div className="space-y-3">
          {data.qualityStandards.map((standard, index) => (
            <div key={index} className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Activity</label>
                <input
                  type="text"
                  value={standard.activity}
                  onChange={(e) => updateQualityStandard(index, 'activity', e.target.value)}
                  placeholder="e.g., Email writing"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Quality Measure</label>
                <input
                  type="text"
                  value={standard.measure}
                  onChange={(e) => updateQualityStandard(index, 'measure', e.target.value)}
                  placeholder="e.g., Clear, professional, timely, achieves goal"
                  className="w-full p-2 border border-black text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4">
          Step 4: Output Baseline
        </h3>

        <p className="text-sm mb-4">Track your current volume/throughput per week:</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Emails Sent</label>
            <input
              type="text"
              value={data.outputBaseline.emailsSent}
              onChange={(e) => updateOutputBaseline('emailsSent', e.target.value)}
              placeholder="e.g., 50"
              className="w-full p-2 border border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Documents Written</label>
            <input
              type="text"
              value={data.outputBaseline.documentsWritten}
              onChange={(e) => updateOutputBaseline('documentsWritten', e.target.value)}
              placeholder="e.g., 3"
              className="w-full p-2 border border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Reports Delivered</label>
            <input
              type="text"
              value={data.outputBaseline.reportsDelivered}
              onChange={(e) => updateOutputBaseline('reportsDelivered', e.target.value)}
              placeholder="e.g., 2"
              className="w-full p-2 border border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Meetings Conducted</label>
            <input
              type="text"
              value={data.outputBaseline.meetingsConducted}
              onChange={(e) => updateOutputBaseline('meetingsConducted', e.target.value)}
              placeholder="e.g., 10"
              className="w-full p-2 border border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Projects Completed</label>
            <input
              type="text"
              value={data.outputBaseline.projectsCompleted}
              onChange={(e) => updateOutputBaseline('projectsCompleted', e.target.value)}
              placeholder="e.g., 1"
              className="w-full p-2 border border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              <input
                type="text"
                value={data.outputBaseline.customMetricName}
                onChange={(e) => updateOutputBaseline('customMetricName', e.target.value)}
                placeholder="Custom metric name"
                className="w-full p-1 border border-gray-300 text-xs mb-1"
              />
            </label>
            <input
              type="text"
              value={data.outputBaseline.customMetric}
              onChange={(e) => updateOutputBaseline('customMetric', e.target.value)}
              placeholder="Value"
              className="w-full p-2 border border-black text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <h3 className="font-extrabold text-xl uppercase tracking-tight mb-4">
          Step 5: Satisfaction Baseline
        </h3>

        <p className="text-sm mb-4">Rate 1-10 (track how AI impacts these over time):</p>

        <div className="space-y-4">
          {[
            { key: 'jobSatisfaction', label: 'Overall Job Satisfaction' },
            { key: 'workloadManageability', label: 'Workload Manageability' },
            { key: 'stressLevel', label: 'Stress Level (10 = very stressed)' },
            { key: 'creativeFulfillment', label: 'Creative Fulfillment' },
            { key: 'workLifeBalance', label: 'Work-Life Balance' }
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold">{label}</label>
                <span className="text-sm font-extrabold">{data.satisfactionBaseline[key as keyof typeof data.satisfactionBaseline]}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={data.satisfactionBaseline[key as keyof typeof data.satisfactionBaseline]}
                onChange={(e) => updateSatisfaction(key as keyof typeof data.satisfactionBaseline, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #FF6A00 0%, #FF6A00 ${(data.satisfactionBaseline[key as keyof typeof data.satisfactionBaseline] - 1) * 11.11}%, #e5e7eb ${(data.satisfactionBaseline[key as keyof typeof data.satisfactionBaseline] - 1) * 11.11}%, #e5e7eb 100%)`
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#10b981] border border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-6 h-6" strokeWidth={2} />
          <h3 className="font-extrabold text-xl uppercase tracking-tight">Your Baseline Summary</h3>
        </div>
        <p className="text-sm mb-4">
          You've documented your current state. This is the foundation for measuring AI's impact on your productivity, quality, and satisfaction. Save this data and review it monthly as you implement AI workflows.
        </p>
        <button
          onClick={saveAnalysis}
          disabled={saving}
          className="flex items-center gap-2 bg-black text-white border border-black px-6 py-3 font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
              SAVED TO YOUR PROFILE
            </>
          ) : saving ? (
            'SAVING...'
          ) : (
            <>
              <Save className="w-5 h-5" strokeWidth={2} />
              SAVE YOUR BASELINE
            </>
          )}
        </button>
      </div>
    </div>
  );
}
