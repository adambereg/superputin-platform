import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Search, Edit2, Shield, AlertCircle, Trash2, X } from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

interface UserResponse {
  users: User[];
  total: number;
  pages: number;
}

interface UserModalProps {
  user: User;
  onClose: () => void;
  onDelete: (userId: string) => void;
  onUpdate: (userId: string, data: Partial<User>) => void;
}

function UserModal({ user, onClose, onDelete, onUpdate }: UserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setLoading(true);
      try {
        const response = await api.admin.deleteUser(user._id);
        if (response.success) {
          onDelete(user._id);
          onClose();
        } else {
          setError(response.error || 'Ошибка удаления пользователя');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка удаления пользователя');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Управление пользователем</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-2xl font-medium">
                {user.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{user.username}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Действия</h4>
            <div className="space-y-2">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 size={18} />
                {loading ? 'Удаление...' : 'Удалить пользователя'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: UserResponse = await api.admin.getUsers({ 
        page, 
        limit: 10,
        search: search.trim()
      });
      
      setUsers(response.users);
      setTotalPages(response.pages);
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await api.admin.updateUserRole(userId, newRole);
      if (response.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
      } else {
        setError(response.error || 'Ошибка обновления роли');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления роли');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user._id !== userId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Найти
          </button>
        </form>
      </div>

      {loading && users.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-red-500">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {user.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-primary/20"
                        disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                      >
                        <option value="user">Пользователь</option>
                        <option value="moderator">Модератор</option>
                        <option value="admin">Администратор</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-primary hover:text-primary/80 transition-colors"
                        title="Управление пользователем"
                      >
                        <Edit2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Назад
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </>
      )}

      {editingUser && (
        <UserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onDelete={handleDeleteUser}
          onUpdate={(userId, data) => {
            setUsers(users.map(user => 
              user._id === userId ? { ...user, ...data } : user
            ));
          }}
        />
      )}
    </div>
  );
} 