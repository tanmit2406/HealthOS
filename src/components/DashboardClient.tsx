"use client";

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Activity, Heart, Moon, Flame, Brain, Dumbbell, Scale } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function DashboardClient({ metrics, insights }: { metrics: any[], insights: any }) {
  const latestMetric = metrics[0] || {};
  const latestInsight = insights[0] || {};

  // Color mapping for readiness score
  const getReadinessColor = (score: number) => {
    if (!score) return "text-gray-500";
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const chartData = [...metrics].reverse().map(m => ({
    ...m,
    dateFormatted: m.date ? format(parseISO(m.date), 'MMM dd') : ''
  }));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Health OS</h1>
            <p className="text-neutral-400 mt-1">
              {latestInsight.date ? format(parseISO(latestInsight.date), 'EEEE, MMMM do, yyyy') : 'No data yet'}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-neutral-900 px-6 py-4 rounded-2xl border border-neutral-800 shadow-xl">
            <div className="flex flex-col">
              <span className="text-sm text-neutral-400 uppercase tracking-wider font-semibold">Readiness</span>
              <span className={`text-4xl font-black ${getReadinessColor(latestInsight.readiness_score)}`}>
                {latestInsight.readiness_score || '--'}
              </span>
            </div>
            <Activity className={`w-10 h-10 ${getReadinessColor(latestInsight.readiness_score)}`} />
          </div>
        </header>

        {/* Morning Briefing */}
        <section className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800/50 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            <Brain className="text-purple-400" /> Morning Briefing
          </h2>
          <p className="text-lg leading-relaxed text-neutral-300">
            {latestInsight.summary_briefing || "Waiting for your first daily sync."}
          </p>
        </section>

        {/* Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
            <h3 className="text-neutral-400 flex items-center gap-2 font-medium mb-3">
              <Heart className="w-5 h-5 text-red-400" /> Stress Analysis
            </h3>
            <p className="text-sm text-neutral-300">{latestInsight.stress_analysis || "No data"}</p>
          </div>
          <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
            <h3 className="text-neutral-400 flex items-center gap-2 font-medium mb-3">
              <Dumbbell className="w-5 h-5 text-orange-400" /> Fitness
            </h3>
            <p className="text-sm text-neutral-300">{latestInsight.fitness_recommendation || "No data"}</p>
          </div>
          <div className="bg-neutral-900 p-5 rounded-2xl border border-neutral-800">
            <h3 className="text-neutral-400 flex items-center gap-2 font-medium mb-3">
              <Scale className="w-5 h-5 text-blue-400" /> Weight Trend
            </h3>
            <p className="text-sm text-neutral-300">{latestInsight.weight_trend_analysis || "No data"}</p>
          </div>
        </div>

        {/* Charts Section */}
        <h2 className="text-2xl font-bold mt-12 mb-6">Trends</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HRV & RHR Chart */}
          <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 h-80">
            <h3 className="text-neutral-400 font-medium mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> HRV vs Resting HR
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="dateFormatted" stroke="#737373" fontSize={12} />
                <YAxis yAxisId="left" stroke="#ef4444" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="hrv_avg" name="HRV (ms)" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="resting_heart_rate" name="Resting HR (bpm)" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sleep Stages Chart */}
          <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 h-80">
            <h3 className="text-neutral-400 font-medium mb-4 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" /> Sleep Stages
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="dateFormatted" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626' }} />
                <Legend />
                <Bar dataKey="sleep_deep_mins" name="Deep" stackId="a" fill="#4f46e5" />
                <Bar dataKey="sleep_core_mins" name="Core" stackId="a" fill="#818cf8" />
                <Bar dataKey="sleep_rem_mins" name="REM" stackId="a" fill="#c7d2fe" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity vs Weight */}
          <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 h-80 lg:col-span-2">
            <h3 className="text-neutral-400 font-medium mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" /> Active Calories & Weight
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="dateFormatted" stroke="#737373" fontSize={12} />
                <YAxis yAxisId="left" stroke="#f97316" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="active_calories" name="Active Cals" stroke="#f97316" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="weight" name="Weight" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
