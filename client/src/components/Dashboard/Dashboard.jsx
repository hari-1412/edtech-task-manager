import React, { useState, useEffect } from 'react';
import { taskAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../Layout/Navbar';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    progress: 'not-started'
  });
  const { user } = useAuth();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getTasks();
      setTasks(response.data.data);
      setFilteredTasks(response.data.data);
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredTasks(tasks);
    } else {
      setFilteredTasks(tasks.filter(task => task.progress === filter));
    }
  }, [filter, tasks]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await taskAPI.updateTask(editingTask._id, formData);
      } else {
        await taskAPI.createTask(formData);
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', dueDate: '', progress: 'not-started' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskAPI.deleteTask(taskId);
        fetchTasks();
      } catch (err) {
        setError('Failed to delete task');
      }
    }
  };

  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        progress: task.progress
      });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '', dueDate: '', progress: 'not-started' });
    }
    setShowModal(true);
  };

  const isOwner = (task) => {
    return task.userId === user._id || task.userId?._id === user._id;
  };

  const getProgressIcon = (progress) => {
    switch (progress) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '⏳';
      default:
        return '⭕';
    }
  };

  const getProgressColor = (progress) => {
    switch (progress) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.progress === 'completed').length,
    inProgress: tasks.filter(t => t.progress === 'in-progress').length,
    notStarted: tasks.filter(t => t.progress === 'not-started').length
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
            <p className="text-xl text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-lg">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚠️</span>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-indigo-100 hover:shadow-2xl transition transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Total Tasks</p>
                  <p className="text-4xl font-bold text-gray-800 mt-2">{taskStats.total}</p>
                </div>
                <div className="bg-indigo-100 p-4 rounded-2xl">
                  <span className="text-4xl">📚</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-2xl transition transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Completed</p>
                  <p className="text-4xl font-bold text-green-600 mt-2">{taskStats.completed}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-2xl">
                  <span className="text-4xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-yellow-100 hover:shadow-2xl transition transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">In Progress</p>
                  <p className="text-4xl font-bold text-yellow-600 mt-2">{taskStats.inProgress}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-2xl">
                  <span className="text-4xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-2xl transition transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wide">Not Started</p>
                  <p className="text-4xl font-bold text-gray-600 mt-2">{taskStats.notStarted}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl">
                  <span className="text-4xl">⭕</span>
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {user.role === 'teacher' ? '🎓 All Learning Tasks' : '📝 My Learning Tasks'}
              </h2>
              <p className="text-gray-500 text-lg">Manage and track your progress</p>
            </div>
            
            <button
              onClick={() => openModal()}
              className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-2"
            >
              <span className="text-2xl">➕</span>
              <span>Create New Task</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <span className="text-2xl">🔍</span>
              <h3 className="text-xl font-bold text-gray-800">Filter Tasks by Progress</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: 'all', label: `All (${taskStats.total})`, icon: '📚', color: 'indigo' },
                { value: 'not-started', label: 'Not Started', icon: '⭕', color: 'gray' },
                { value: 'in-progress', label: 'In Progress', icon: '⏳', color: 'yellow' },
                { value: 'completed', label: 'Completed', icon: '✅', color: 'green' }
              ].map(({ value, label, icon, color }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`px-6 py-4 rounded-2xl font-bold transition transform hover:scale-105 shadow-md flex items-center justify-center space-x-2 border-2 ${
                    filter === value
                      ? `bg-${color}-600 text-white border-${color}-700 shadow-xl`
                      : `bg-${color}-50 text-${color}-700 border-${color}-200 hover:bg-${color}-100`
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center border-2 border-gray-100">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No tasks found</h3>
              <p className="text-gray-500 text-lg mb-8">Create your first task to get started on your learning journey!</p>
              <button
                onClick={() => openModal()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition transform hover:scale-105 inline-flex items-center space-x-2"
              >
                <span className="text-2xl">➕</span>
                <span>Create First Task</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition border-2 border-gray-100 overflow-hidden group transform hover:scale-105"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl">{getProgressIcon(task.progress)}</span>
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold border-2 uppercase tracking-wide ${getProgressColor(task.progress)}`}>
                          {task.progress.replace('-', ' ')}
                        </span>
                      </div>
                      {task.dueDate && (
                        <div className="bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-200">
                          <div className="flex items-center space-x-1 text-indigo-600">
                            <span>📅</span>
                            <span className="text-xs font-semibold">{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition">
                      {task.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {task.description}
                    </p>

                    {user.role === 'teacher' && task.userId?.email && (
                      <div className="bg-purple-50 px-4 py-3 rounded-xl mb-4 border border-purple-200">
                        <div className="flex items-center space-x-2">
                          <span>👤</span>
                          <span className="text-purple-700 font-semibold text-sm">{task.userId.email}</span>
                        </div>
                      </div>
                    )}

                    {isOwner(task) && (
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-gray-100">
                        <button
                          onClick={() => openModal(task)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                          <span>✏️</span>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-bold transition transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                        >
                          <span>🗑️</span>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-indigo-200">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white rounded-t-3xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-4xl">{editingTask ? '✏️' : '➕'}</span>
                    <h3 className="text-3xl font-bold">
                      {editingTask ? 'Edit Task' : 'Create New Task'}
                    </h3>
                  </div>
                  <p className="text-indigo-100 text-lg">
                    {editingTask ? 'Update your task details' : 'Add a new task to your learning journey'}
                  </p>
                </div>

                <div className="p-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        📝 Task Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        maxLength="200"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition text-lg"
                        placeholder="Enter an awesome task title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        📄 Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        maxLength="1000"
                        rows="5"
                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition resize-none text-lg"
                        placeholder="Describe what needs to be done..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                          📅 Due Date (Optional)
                        </label>
                        <input
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                          📊 Progress Status
                        </label>
                        <select
                          name="progress"
                          value={formData.progress}
                          onChange={handleChange}
                          className="w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-500 transition text-lg font-semibold"
                        >
                          <option value="not-started">⭕ Not Started</option>
                          <option value="in-progress">⏳ In Progress</option>
                          <option value="completed">✅ Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-2xl font-bold transition transform hover:scale-105 shadow-md text-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:shadow-2xl transition transform hover:scale-105 text-lg"
                    >
                      {editingTask ? '💾 Update Task' : '➕ Create Task'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;