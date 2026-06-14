"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, ComposedChart, CartesianGrid } from 'recharts';
import { Sparkles, Brain, Moon, Activity, Flame, Heart, Dumbbell, Scale } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ProgressRing = ({ radius, stroke, progress, colorClass, children }: any) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg]"
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-neutral-900"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={`${colorClass}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default function DashboardClient({ metrics, insights }: { metrics: any[], insights: any }) {
  const latestMetric = metrics[0] || {};
  const latestInsight = insights[0] || {};

  // 1. Calculate Recovery
  const recoveryScore = latestInsight.readiness_score || 0;
  let recoveryColor = "text-neutral-500";
  if (recoveryScore >= 67) recoveryColor = "text-green-500";
  else if (recoveryScore >= 34) recoveryColor = "text-yellow-500";
  else if (recoveryScore > 0) recoveryColor = "text-red-500";

  // 2. Calculate Strain (Simulated 0-21 scale based on active calories, steps, and workout)
  const activeCalories = latestMetric.active_calories || 0;
  const steps = latestMetric.steps || 0;
  const workoutMins = latestMetric.workout_duration_mins || 0;
  const rawStrain = (activeCalories / 100) + (steps / 1000) + (workoutMins / 10);
  const strainScore = Math.min(21, rawStrain);
  const strainProgress = (strainScore / 21) * 100;
  const strainColor = "text-sky-400";

  // 3. Calculate Sleep
  const totalSleepMins = (latestMetric.sleep_core_mins || 0) + (latestMetric.sleep_deep_mins || 0) + (latestMetric.sleep_rem_mins || 0);
  const sleepTargetMins = 8 * 60; // 8 hours target
  const sleepProgress = Math.min(100, (totalSleepMins / sleepTargetMins) * 100);
  const sleepHours = Math.floor(totalSleepMins / 60);
  const sleepMins = totalSleepMins % 60;
  const sleepColor = "text-indigo-500";

  const chartData = [...metrics].reverse().map(m => ({
    ...m,
    dateFormatted: m.date ? format(parseISO(m.date), 'MMM dd') : ''
  }));

  // Reusable custom tooltip for minimalist look
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl shadow-xl">
          <p className="text-neutral-400 text-sm mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="font-bold">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-4 md:p-8 font-sans selection:bg-sky-500/30">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col items-center justify-center border-b border-neutral-900 pb-6 pt-4">
          <p className="text-neutral-500 uppercase tracking-widest text-sm font-semibold mb-2">Today</p>
          <h1 className="text-2xl font-medium tracking-tight">
            {latestInsight.date ? format(parseISO(latestInsight.date), 'EEEE, MMMM do') : 'No data yet'}
          </h1>
        </header>

        {/* THE BIG THREE RINGS */}
        <div className="flex justify-center items-center gap-4 md:gap-12">
          
          {/* Strain Ring */}
          <div className="flex flex-col items-center group cursor-pointer">
            <ProgressRing radius={65} stroke={8} progress={strainProgress} colorClass={strainColor}>
              <span className="text-3xl font-black tracking-tighter text-white group-hover:scale-110 transition-transform">{strainScore.toFixed(1)}</span>
            </ProgressRing>
            <span className="mt-4 text-sm font-semibold text-neutral-400 tracking-wider uppercase">Strain</span>
          </div>

          {/* Recovery Ring */}
          <div className="flex flex-col items-center group cursor-pointer">
            <ProgressRing radius={75} stroke={10} progress={recoveryScore} colorClass={recoveryColor}>
              <span className="text-4xl font-black tracking-tighter text-white group-hover:scale-110 transition-transform">{recoveryScore}%</span>
            </ProgressRing>
            <span className="mt-4 text-sm font-semibold text-neutral-400 tracking-wider uppercase">Recovery</span>
          </div>

          {/* Sleep Ring */}
          <div className="flex flex-col items-center group cursor-pointer">
            <ProgressRing radius={65} stroke={8} progress={sleepProgress} colorClass={sleepColor}>
              <div className="flex flex-col items-center group-hover:scale-110 transition-transform">
                <span className="text-2xl font-black tracking-tighter text-white">{sleepHours}<span className="text-sm font-medium text-neutral-400 ml-0.5">h</span> {sleepMins}<span className="text-sm font-medium text-neutral-400 ml-0.5">m</span></span>
              </div>
            </ProgressRing>
            <span className="mt-4 text-sm font-semibold text-neutral-400 tracking-wider uppercase">Sleep</span>
          </div>

        </div>

        {/* AI Coach Interface */}
        <section className="bg-neutral-900/40 rounded-3xl p-6 md:p-8 border border-neutral-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">AI Coach</h2>
              <p className="text-xs text-neutral-500">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 rounded-2xl rounded-tl-sm p-5 border border-neutral-700/30">
            <p className="text-neutral-200 leading-relaxed text-[15px]">
              {latestInsight.summary_briefing || "Waiting for your first daily sync."}
            </p>
          </div>
        </section>

        {/* Minimalist Charts Section */}
        <div className="space-y-6 pt-6">
          
          {/* HRV & RHR Trend */}
          <div className="bg-neutral-900/30 p-6 rounded-3xl border border-neutral-800/50">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-neutral-400 text-sm font-medium mb-1 uppercase tracking-wider">Recovery Trends</h3>
                <p className="text-white font-medium">HRV & Resting Heart Rate</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-red-500 font-bold">{latestMetric.hrv_avg || '--'} ms</p>
                <p className="text-sm text-blue-500 font-bold">{latestMetric.resting_heart_rate || '--'} bpm</p>
              </div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorHrv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRhr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
                  <XAxis dataKey="dateFormatted" hide />
                  <YAxis yAxisId="left" hide domain={['dataMin - 10', 'dataMax + 10']} />
                  <YAxis yAxisId="right" orientation="right" hide domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#404040', strokeWidth: 1 }} />
                  <Area connectNulls={true} yAxisId="left" type="monotone" dataKey="hrv_avg" name="HRV" stroke="#ef4444" fillOpacity={1} fill="url(#colorHrv)" strokeWidth={3} activeDot={{ r: 6, fill: '#ef4444', strokeWidth: 0 }} />
                  <Area connectNulls={true} yAxisId="right" type="monotone" dataKey="resting_heart_rate" name="RHR" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRhr)" strokeWidth={3} activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity vs Weight Trend */}
          <div className="bg-neutral-900/30 p-6 rounded-3xl border border-neutral-800/50">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-neutral-400 text-sm font-medium mb-1 uppercase tracking-wider">Strain Trends</h3>
                <p className="text-white font-medium">Active Calories & Weight</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-sky-500 font-bold">{activeCalories} cal</p>
                <p className="text-sm text-emerald-500 font-bold">{latestMetric.weight || '--'} kg</p>
              </div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#171717" vertical={false} />
                  <XAxis dataKey="dateFormatted" hide />
                  <YAxis yAxisId="left" hide />
                  <YAxis yAxisId="right" orientation="right" hide domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#262626', opacity: 0.4 }} />
                  <Bar yAxisId="left" dataKey="active_calories" name="Active Cals" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={30} opacity={0.4} />
                  <Area connectNulls={true} yAxisId="right" type="monotone" dataKey="weight" name="Weight" stroke="#10b981" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={3} activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Detailed Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 pb-12">
          
          <div className="bg-neutral-900/30 p-5 rounded-3xl border border-neutral-800/50">
            <h3 className="text-neutral-500 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-3">
              <Activity className="w-4 h-4 text-indigo-400" /> Pattern Analysis
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{latestInsight.monthly_pattern_insight || "Analyzing patterns..."}</p>
          </div>

          <div className="bg-neutral-900/30 p-5 rounded-3xl border border-neutral-800/50">
            <h3 className="text-neutral-500 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-3">
              <Heart className="w-4 h-4 text-red-400" /> Stress
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{latestInsight.stress_analysis || "No data"}</p>
          </div>

          <div className="bg-neutral-900/30 p-5 rounded-3xl border border-neutral-800/50">
            <h3 className="text-neutral-500 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-3">
              <Dumbbell className="w-4 h-4 text-sky-400" /> Fitness
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{latestInsight.fitness_recommendation || "No data"}</p>
          </div>

          <div className="bg-neutral-900/30 p-5 rounded-3xl border border-neutral-800/50">
            <h3 className="text-neutral-500 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-3">
              <Scale className="w-4 h-4 text-emerald-400" /> Weight
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{latestInsight.weight_trend_analysis || "No data"}</p>
          </div>

        </div>

      </div>
    </div>
  );
}
