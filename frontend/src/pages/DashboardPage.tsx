import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { LayoutDashboard, CheckCircle, Clock, AlertCircle, Folder } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await axiosInstance.get('/dashboard');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="pt-20 text-center">Loading dashboard...</div>;

  const stats = [
    { name: 'Total Projects', value: data.totalProjects, icon: Folder, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Tasks', value: data.totalTasks, icon: LayoutDashboard, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Tasks Done', value: data.tasksByStatus.DONE, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Overdue Tasks', value: data.overdueTasks.length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
              <div className={`${stat.bg} p-3 rounded-full mr-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" /> Overdue Tasks
            </h2>
            <div className="space-y-4">
              {data.overdueTasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No overdue tasks. Good job!</p>
              ) : (
                data.overdueTasks.map((task: any) => (
                  <div key={task._id} className="flex justify-between items-center p-3 bg-red-50 rounded-md">
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.project.name} • Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                    <Link to={`/projects/${task.project._id}`} className="text-xs text-indigo-600 font-medium hover:underline">View</Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-600" /> Recent Activity
            </h2>
            <div className="space-y-4">
              {data.recentTasks.map((task: any) => (
                <div key={task._id} className="flex items-start p-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      Status: <span className="font-semibold">{task.status}</span> • Project: {task.project.name}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400">{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
