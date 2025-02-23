import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BarChart, Users, FileText, AlertCircle } from 'lucide-react';

interface Stats {
  totalUsers: number;
  moderators: number;
  totalContent: number;
  pendingContent: number;
  approvedContent: number;
  rejectedContent: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.admin.getStats();
        setStats(response.data);
      } catch (err) {
        setError('Ошибка загрузки статистики');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Панель управления</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Пользователи"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6" />}
          color="primary"
        />
        <StatCard
          title="Модераторы"
          value={stats.moderators}
          icon={<AlertCircle className="w-6 h-6" />}
          color="success"
        />
        <StatCard
          title="Весь контент"
          value={stats.totalContent}
          icon={<FileText className="w-6 h-6" />}
          color="info"
        />
        <StatCard
          title="Ожидает проверки"
          value={stats.pendingContent}
          icon={<BarChart className="w-6 h-6" />}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContentStats stats={stats} />
        <RecentActivity />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'info' | 'warning';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-600',
    info: 'bg-blue-100 text-blue-600',
    warning: 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function ContentStats({ stats }: { stats: Stats }) {
  const data = [
    { label: 'Одобрено', value: stats.approvedContent, color: 'bg-green-500' },
    { label: 'Отклонено', value: stats.rejectedContent, color: 'bg-red-500' },
    { label: 'На проверке', value: stats.pendingContent, color: 'bg-yellow-500' }
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Статистика контента</h2>
      <div className="space-y-4">
        {data.map(item => (
          <div key={item.label}>
            <div className="flex justify-between text-sm mb-1">
              <span>{item.label}</span>
              <span>{((item.value / total) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${(item.value / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Последние действия</h2>
      <div className="space-y-4">
        {/* Здесь будет список последних действий */}
        <p className="text-gray-500">Функционал в разработке</p>
      </div>
    </div>
  );
} 