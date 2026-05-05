import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import client from '../api/client';

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
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    if (childId) {
      fetchReport(childId, days);
    }
  }, [childId, days]);

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-primary">Đang tải báo cáo...</div>
      </div>
    );
  }

  const pieData = [
    { name: 'Đúng', value: report.donutChart.correct },
    { name: 'Sai', value: report.donutChart.wrong },
  ];

  const COLORS = ['#95D5B2', '#FFB4B4'];

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-primary/10 to-secondary/10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <button
          onClick={() => navigate('/parent-dashboard')}
          className="mb-6 text-primary hover:underline flex items-center gap-2"
        >
          ← Quay lại
        </button>

        <h1 className="text-4xl font-bold text-primary mb-2">📊 Báo Cáo Tiến Độ</h1>
        <p className="text-gray-600 mb-6">{report.period}</p>

        {/* Period Selector */}
        <div className="flex gap-3 mb-8">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                days === d
                  ? 'bg-primary text-white'
                  : 'bg-white text-primary border-2 border-primary'
              }`}
            >
              {d} ngày
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {[
            {
              label: 'Phiên học',
              value: report.totalSessions,
              icon: '📚',
              color: 'bg-blue-100',
            },
            {
              label: 'Câu hỏi',
              value: report.totalQuestions,
              icon: '❓',
              color: 'bg-yellow-100',
            },
            {
              label: 'Độ chính xác',
              value: `${report.correctRate}%`,
              icon: '✅',
              color: 'bg-green-100',
            },
            {
              label: 'Thời gian TB',
              value: `${report.avgResponseTime}ms`,
              icon: '⏱️',
              color: 'bg-purple-100',
            },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`${metric.color} rounded-lg p-4 text-center shadow-md`}
            >
              <div className="text-3xl mb-2">{metric.icon}</div>
              <p className="text-sm text-gray-600">{metric.label}</p>
              <p className="text-2xl font-bold text-primary">{metric.value}</p>
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
          {/* Correct vs Wrong Donut Chart */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold text-primary mb-4">Tỷ Lệ Đúng/Sai</h2>
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
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Response Time Bar Chart */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold text-primary mb-4">Thời Gian Trả Lời</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={report.responseTimeChart.slice(0, 10)}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="question" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="timeMs" fill="#5BBFB5" name="ms" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          className="bg-white rounded-lg p-6 shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-primary mb-4">Tóm Tắt</h2>
          <p className="text-gray-700 mb-2">
            ✅ <strong>{report.correctAnswers}</strong> câu trả lời đúng / {report.totalQuestions} câu
          </p>
          <p className="text-gray-700 mb-2">
            ❌ <strong>{report.wrongAnswers}</strong> câu trả lời sai
          </p>
          <p className="text-gray-700">
            ⏱️ Thời gian trả lời trung bình: <strong>{report.avgResponseTime}ms</strong>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
