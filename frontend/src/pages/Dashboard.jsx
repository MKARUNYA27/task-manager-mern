import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    try {
      const response = await api.post('/tasks', { title, description });
      setTasks([response.data, ...tasks]);
      setTitle('');
      setDescription('');
      setSuccess('Task created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task._id !== id));
      setSuccess('Task deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete task');
      setTimeout(() => setError(''), 3000);
    }
  };

  const updateTask = async (id, updatedData) => {
    try {
      const response = await api.put(`/tasks/${id}`, updatedData);
      setTasks(tasks.map(task => task._id === id ? response.data : task));
      setEditing(null);
      setSuccess('Task updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update task');
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleComplete = (task) => {
    updateTask(task._id, { ...task, completed: !task.completed });
  };

  const startEditing = (task) => {
    setEditing(task._id);
    setEditTitle(task.title);
  };

  const saveEdit = (task) => {
    if (!editTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }
    updateTask(task._id, { ...task, title: editTitle });
  };

  const getStatusBadge = (completed) => {
    return completed ? (
      <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">✅ Completed</span>
    ) : (
      <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">⏳ Pending</span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Task Manager
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">👋 {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition transform hover:scale-105"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Toast Notifications */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4 animate-slideDown">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4 animate-slideDown">
            ✅ {success}
          </div>
        )}

        {/* Add Task Form - Glass Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-8 border border-white/30">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">✨ Add New Task</h2>
          <form onSubmit={createTask} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold px-6 py-3 rounded-lg hover:opacity-90 transition transform hover:scale-105"
            >
              + Add Task
            </button>
          </form>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📌 Your Tasks ({tasks.length})
          </h2>

          {tasks.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center border border-white/30">
              <span className="text-6xl block mb-4">🎯</span>
              <h3 className="text-2xl font-semibold text-gray-600">No tasks yet!</h3>
              <p className="text-gray-400 mt-2">Create your first task above to get started.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task._id}
                className={`bg-white/70 backdrop-blur-md rounded-2xl shadow-md p-5 border border-white/30 transition-all hover:shadow-lg hover:scale-[1.01] ${
                  task.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {editing === task._id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-3 py-1 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(task);
                            if (e.key === 'Escape') setEditing(null);
                          }}
                        />
                        <button
                          onClick={() => saveEdit(task)}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="bg-gray-400 text-white px-3 py-1 rounded-lg hover:bg-gray-500 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className={`text-lg font-semibold text-gray-800 ${
                          task.completed ? 'line-through text-gray-500' : ''
                        }`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className={`text-gray-500 text-sm mt-1 ${
                            task.completed ? 'line-through' : ''
                          }`}>
                            {task.description}
                          </p>
                        )}
                        <div className="mt-2">
                          {getStatusBadge(task.completed)}
                          <span className="text-xs text-gray-400 ml-3">
                            🕐 {new Date(task.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium transition transform hover:scale-105 ${
                        task.completed
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {task.completed ? '↩ Undo' : '✓ Done'}
                    </button>
                    <button
                      onClick={() => startEditing(task)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition transform hover:scale-105"
                      disabled={editing === task._id}
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition transform hover:scale-105"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-400 text-sm py-6 mt-8 border-t border-gray-200/50">
        Made with ❤️ by Karunya | MERN Task Manager
      </footer>
    </div>
  );
};

export default Dashboard;
