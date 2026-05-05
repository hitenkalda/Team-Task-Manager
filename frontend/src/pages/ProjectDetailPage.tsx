import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';
import { Plus, Users, Trash2, UserPlus, MoreVertical, Calendar, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state: authState } = useAuth();
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  
  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignee, setTaskAssignee] = useState('');

  // Member Form State
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');

  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/projects/${id}`);
      return res.data.data;
    }
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/projects/${id}/tasks`);
      return res.data.data;
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: any) => axiosInstance.post(`/projects/${id}/tasks`, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] });
      setIsTaskModalOpen(false);
      setTaskTitle(''); setTaskDesc(''); setTaskPriority('MEDIUM'); setTaskDueDate(''); setTaskAssignee('');
    }
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string, status: string }) => 
      axiosInstance.put(`/projects/${id}/tasks/${taskId}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', id] })
  });

  const addMemberMutation = useMutation({
    mutationFn: async (newMember: any) => axiosInstance.post(`/projects/${id}/members`, newMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      setIsMemberModalOpen(false);
      setMemberEmail('');
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => axiosInstance.delete(`/projects/${id}`),
    onSuccess: () => navigate('/projects')
  });

  if (projectLoading || tasksLoading) return <div className="pt-20 text-center">Loading project...</div>;

  const { project, stats } = projectData;
  const isAdmin = project.members.some((m: any) => m.user._id === authState.user?.id && m.role === 'ADMIN');

  const columns = [
    { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-50' },
    { id: 'DONE', title: 'Done', color: 'bg-green-50' }
  ];

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'HIGH': return 'text-red-600 bg-red-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-20 pb-8 px-4 max-w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">{project.description}</p>
          </div>
          <div className="flex space-x-2">
            <button onClick={() => setIsMemberModalOpen(true)} className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm hover:bg-gray-50">
              <Users className="w-4 h-4 mr-2" /> Members ({project.members.length})
            </button>
            <button onClick={() => setIsTaskModalOpen(true)} className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-1" /> Add Task
            </button>
            {isAdmin && (
              <button onClick={() => { if(confirm('Delete project?')) deleteProjectMutation.mutate() }} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-4">
          {columns.map(column => (
            <div key={column.id} className={`rounded-lg p-4 min-h-[500px] ${column.color}`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-700 uppercase text-sm tracking-wider">{column.title}</h2>
                <span className="bg-white px-2 py-1 rounded text-xs font-bold text-gray-500 shadow-sm">
                  {tasks.filter((t: any) => t.status === column.id).length}
                </span>
              </div>
              <div className="space-y-3">
                {tasks.filter((t: any) => t.status === column.id).map((task: any) => (
                  <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <div className="relative group-hover:block hidden">
                        <select 
                          className="text-[10px] border-none bg-gray-50 rounded p-1"
                          value={task.status}
                          onChange={(e) => updateTaskStatusMutation.mutate({ taskId: task._id, status: e.target.value })}
                        >
                          <option value="TODO">Move to Todo</option>
                          <option value="IN_PROGRESS">Move to In Progress</option>
                          <option value="DONE">Move to Done</option>
                        </select>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{task.title}</h3>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-[10px] text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                      {task.assignee && (
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold" title={task.assignee.name}>
                          {task.assignee.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modals */}
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create New Task</h2>
              <form onSubmit={(e) => { e.preventDefault(); createTaskMutation.mutate({ title: taskTitle, description: taskDesc, priority: taskPriority, dueDate: taskDueDate, assigneeId: taskAssignee }) }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input type="text" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} className="w-full p-2 border rounded-md" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="w-full p-2 border rounded-md" rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} className="w-full p-2 border rounded-md">
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Due Date</label>
                      <input type="date" value={taskDueDate} onChange={e => setTaskDueDate(e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assignee</label>
                    <select value={taskAssignee} onChange={e => setTaskAssignee(e.target.value)} className="w-full p-2 border rounded-md">
                      <option value="">Unassigned</option>
                      {project.members.map((m: any) => (
                        <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-gray-700">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Project Members</h2>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {project.members.map((m: any) => (
                  <div key={m.user._id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-bold">{m.user.name}</p>
                      <p className="text-xs text-gray-500">{m.user.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'}`}>
                      {m.role}
                    </span>
                  </div>
                ))}
              </div>
              {isAdmin && (
                <form onSubmit={(e) => { e.preventDefault(); addMemberMutation.mutate({ email: memberEmail, role: memberRole }) }} className="border-t pt-4">
                  <h3 className="text-sm font-bold mb-2">Invite Member</h3>
                  <div className="flex gap-2">
                    <input type="email" placeholder="User email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} className="flex-1 p-2 border rounded-md text-sm" required />
                    <select value={memberRole} onChange={e => setMemberRole(e.target.value)} className="p-2 border rounded-md text-sm">
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <button type="submit" className="p-2 bg-indigo-600 text-white rounded-md"><UserPlus className="w-4 h-4" /></button>
                  </div>
                </form>
              )}
              <div className="flex justify-end mt-6">
                <button onClick={() => setIsMemberModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-md text-sm">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectDetailPage;
