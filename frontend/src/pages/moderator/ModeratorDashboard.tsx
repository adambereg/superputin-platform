import React, { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ModeratorStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalModerated: number;
}

export function ModeratorDashboard() {
  const [stats, setStats] = useState<ModeratorStats>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalModerated: 0
  });

  useEffect(() => {
    fetchModeratorStats();
  }, []);

  const fetchModeratorStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/moderator/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching moderator stats:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="text-primary" />
        Панель модератора
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="На модерации"
          value={stats.pendingCount}
          icon={<Clock className="text-yellow-500" />}
          color="bg-yellow-50"
        />
        <StatCard
          title="Одобрено"
          value={stats.approvedCount}
          icon={<CheckCircle className="text-green-500" />}
          color="bg-green-50"
        />
        <StatCard
          title="Отклонено"
          value={stats.rejectedCount}
          icon={<XCircle className="text-red-500" />}
          color="bg-red-50"
        />
        <StatCard
          title="Всего проверено"
          value={stats.totalModerated}
          icon={<Shield className="text-primary" />}
          color="bg-primary/5"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Последние действия</h2>
        {/* Здесь будет компонент с историей модерации */}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <div className={`p-6 rounded-lg ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
} 