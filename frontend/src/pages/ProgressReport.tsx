import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import client from '../api/client';
import { Child } from '../types';

interface ReportData {
  childId: string;
  period: string;
  totalSessions: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  correctRate: number;
  avgResponseTime: number;
  responseTimeChart: Array<{ question: string; timeMs: number; correct: boolean }>;
  donutChart: { correct: number; wrong: number };
}

export const ProgressReport: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (childId) {
      fetchChild(childId);
      fetchReport(childId, days);
    }
  }, [childId, days]);

  const fetchChild = async (id: string) => {
    try {
      const response = await client.get(`/children/${id}`);
      setChild(response.data);
    } catch (err) {
      console.error('Failed to fetch child:', err);
    }
  };

  const fetchReport = async (id: string, daysParam: number) => {
    setIsLoading(true);
    try {
      const response = await client.get(`/reports/${id}?days=${daysParam}`);
      setReport(response.data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-2xl text-teal font-bold">Đang tải báo cáo...</div>
      </div>
    );
  }

  const childIcon = child?.name === 'Bé Bo' ? '📖' : child?.name === 'Bé Thỏ' ? '🐰' : child?.name === 'Bé Bi' ? '🎈' : '✨';

  const pieData = [
    { name: 'Đúng', value: report.donutChart.correct },
    { name: 'Sai', value: report.donutChart.wrong },
  ];

  const COLORS = ['#B8E0B0', '#FFB4B4']; // green, red

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-teal/10 to-green/10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => navigate('/parent-dashboard')}
            className="text-3xl text-teal hover:scale-110 transition"
          >
            ←
          </button>
          <div className="text-center flex-1">
            <p className="text-gray-600 text-sm font-semibold">BÁO CÁO TIẾN ĐỘ</p>
            <h1 className="text-3xl font-bold text-text">{child?.name}</h1>
          </div>
          <div className="text-4xl">{childIcon}</div>
        </div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3 mb-8 justify-center"
        >
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                days === d
                  ? 'btn-primary'
                  : 'bg-white text-teal border-2 border-teal hover:bg-teal/10'
              }`}
            >
              {d} ngày
            </button>
          ))}
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {[
            {
              label: 'Phiên học',
              value: report.totalSessions,
              icon: '📚',
              gradient: 'from-teal to-blue',
            },
            {
              label: 'Câu hỏi',
              value: report.totalQuestions,
              icon: '❓',
              gradient: 'from-yellow to-peach',
            },
            {
              label: 'Độ chính xác',
              value: `${report.correctRate}%`,
              icon: '✅',
              gradient: 'from-green to-teal',
            },
            {
              label: 'Thời gian TB',
              value: `${Math.round(report.avgResponseTime)}ms`,
              icon: '⏱️',
              gradient: 'from-pink to-yellow',
            },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-br ${metric.gradient} rounded-3xl p-6 text-center shadow-soft text-white`}
            >
              <div className="text-3xl mb-2">{metric.icon}</div>
              <p className="text-sm font-semibold opacity-90">{metric.label}</p>
              <p className="text-2xl font-bold mt-1">{metric.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Response Time Bar Chart */}
          <div className="card-rounded bg-white shadow-soft p-6">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span>⏱️</span> Thời gian phản hồi
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={report.responseTimeChart.slice(0, 10)}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="question" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f0f7f7', borderRadius: '12px', border: 'none' }}
                />
                <Bar dataKey="timeMs" fill="#5BBFB5" name="ms" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Correct vs Wrong Pie Chart */}
          <div className="card-rounded bg-white shadow-soft p-6">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span>🎯</span> Tỷ lệ đúng/sai
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#f0f7f7', borderRadius: '12px', border: 'none' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-sm font-semibold">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          className="card-rounded bg-white shadow-soft p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-bold text-text mb-6">📋 Tóm tắt</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green/10 rounded-2xl p-4">
              <p className="text-sm text-gray-600 mb-1">Câu trả lời đúng</p>
              <p className="text-3xl font-bold text-green">
                {report.correctAnswers} / {report.totalQuestions}
              </p>
            </div>
            <div className="bg-red-100 rounded-2xl p-4">
              <p className="text-sm text-gray-600 mb-1">Câu trả lời sai</p>
              <p className="text-3xl font-bold text-red-500">
                {report.wrongAnswers}
              </p>
            </div>
            <div className="bg-teal/10 rounded-2xl p-4">
              <p className="text-sm text-gray-600 mb-1">Thời gian trung bình</p>
              <p className="text-3xl font-bold text-teal">
                {Math.round(report.avgResponseTime)}ms
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
