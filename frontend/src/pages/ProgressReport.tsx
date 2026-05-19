import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { Child } from '../types';
import { getChildVisual, getLocalChildById } from '../utils/childVisuals';

interface ReportData {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  correctRate: number;
  responseTimeChart: Array<{ question: string; timeMs: number }>;
  donutChart: { correct: number; wrong: number };
}

const createDemoReport = (): ReportData => ({
  totalQuestions: 20,
  correctAnswers: 16,
  wrongAnswers: 4,
  correctRate: 80,
  responseTimeChart: [
    { question: 'câu 1', timeMs: 8000 },
    { question: 'câu 2', timeMs: 6400 },
    { question: 'câu 3', timeMs: 6200 },
    { question: 'câu 4', timeMs: 3300 },
    { question: 'câu 5', timeMs: 5400 },
  ],
  donutChart: { correct: 16, wrong: 4 },
});

export const ProgressReport: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!childId) return;
      try {
        const [childResponse, reportResponse] = await Promise.all([
          client.get(`/children/${childId}`),
          client.get(`/reports/${childId}?days=7`),
        ]);
        setChild(childResponse.data);
        setReport(reportResponse.data);
      } catch (err) {
        setChild(getLocalChildById(childId));
        setReport(createDemoReport());
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [childId]);

  if (isLoading || !report) {
    return (
      <main className="app-screen grid place-items-center">
        <div className="text-2xl text-[#71C9E8] font-extrabold">Đang tải báo cáo...</div>
      </main>
    );
  }

  const visual = getChildVisual(child);
  const bars = report.responseTimeChart.slice(0, 5);
  const maxTime = Math.max(1, ...bars.map((item) => item.timeMs));
  const correct = report.donutChart.correct;
  const wrong = report.donutChart.wrong;

  return (
    <main className="app-screen px-8 py-9">
      <div className="screen-top">
        <button className="circle-button" onClick={() => navigate('/parent-dashboard')} aria-label="Quay lại">
          ←
        </button>
        <div className="text-center">
          <p className="text-gray-400 font-extrabold">BÁO CÁO TIẾN ĐỘ</p>
          <h1 className="app-title">{child?.name?.toUpperCase()}</h1>
        </div>
        <div className="kid-chip">
          <span style={{ backgroundColor: visual.color }}>{visual.avatar}</span>
        </div>
      </div>

      <section className="soft-card mt-9 p-7">
        <h2 className="text-xl font-extrabold mb-8">⏱ Thời gian phản hồi</h2>
        <div className="flex h-48 items-end justify-around gap-4 border-b border-gray-100 pb-2">
          {bars.map((item, index) => (
            <div key={`${item.question}-${index}`} className="flex flex-1 flex-col items-center gap-3">
              <div
                className="w-full rounded-t-lg"
                style={{
                  height: `${Math.max(18, (item.timeMs / maxTime) * 170)}px`,
                  backgroundColor: ['#9DD9E8', '#9DE8D0', '#FFD39A', '#F7A6B8', '#CDBBE3'][index % 5],
                }}
              />
              <span className="text-sm text-gray-400">câu {index + 1}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center font-bold text-gray-400">● Mỗi cột = một câu hỏi (đơn vị: giây)</p>
      </section>

      <section className="soft-card mt-7 p-7">
        <h2 className="text-xl font-extrabold mb-5">🎯 Tỷ lệ đúng / sai</h2>
        <div className="h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={[{ name: 'Đúng', value: correct }, { name: 'Sai', value: wrong }]} innerRadius={80} outerRadius={115} paddingAngle={2} dataKey="value">
                <Cell fill="#9DE8D0" />
                <Cell fill="#FF7A7A" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-8 font-bold text-gray-500">
          <span><span className="text-[#9DE8D0]">■</span> Đúng</span>
          <span><span className="text-[#FF7A7A]">■</span> Sai</span>
        </div>
        <div className="mt-7 grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 pt-6 text-center">
          <div>
            <strong className="text-4xl text-[#9DE8D0]">{report.correctRate}%</strong>
            <p className="font-bold text-gray-400">Đúng</p>
          </div>
          <div>
            <strong className="text-4xl text-[#FF7A7A]">{100 - report.correctRate}%</strong>
            <p className="font-bold text-gray-400">Sai</p>
          </div>
        </div>
      </section>
    </main>
  );
};
