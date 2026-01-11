import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import AIInsights from './components/AIInsights';
import Login from './components/Login';
import Register from './components/Register';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // Auth State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login'); // login or register

  // Set default auth header if token exists
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Optionally fetch user profile if needed, but for now we rely on storage or simple flow
      // user state might be empty on refresh, but we have token. 
      // In a real app we would verify token /me. For now, if token exists we assume logged in contextually.
      fetchTasks();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setTasks([]); // Clear tasks on logout
    }
  }, [token]);

  // Initial load checks
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setAiAnalysis(null);
  };

  const fetchTasks = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response && error.response.status === 401) handleLogout();
    }
  };

  const addTask = async (newTask) => {
    try {
      const response = await axios.post(`${API_URL}/tasks`, newTask);
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (id, updatedFields) => {
    try {
      const response = await axios.put(`${API_URL}/tasks/${id}`, updatedFields);
      setTasks(tasks.map(t => t.id === id ? response.data : t));
      setEditingTask(null); // Exit edit mode
    } catch (error) {
      console.error('Error updating task details:', error);
    }
  };

  const updateTaskStatus = async (task) => {
    try {
      const updated = { completed: !task.completed };
      const response = await axios.put(`${API_URL}/tasks/${task.id}`, updated);
      setTasks(tasks.map(t => t.id === task.id ? response.data : t));
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(error.response.data.error);
      }
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const analyzeTasks = async () => {
    if (!token) return;
    setLoadingAI(true);
    try {
      const response = await axios.post(`${API_URL}/analyze`);
      setAiAnalysis(response.data);
    } catch (error) {
      console.error('Error during AI analysis:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  if (!token) {
    return authMode === 'login'
      ? <Login onLogin={handleLogin} onSwitchToRegister={() => setAuthMode('register')} />
      : <Register onLogin={handleLogin} onSwitchToLogin={() => setAuthMode('login')} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-2">
              TodoAI
            </h1>
            <p className="text-gray-400">Yapay Zeka Destekli Akıllı Görev Yönetimi</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-semibold text-white">{user?.username}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2 rounded-md transition-colors"
              title="Çıkış Yap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form & AI */}
          <div className="lg:col-span-1 space-y-8">
            <TaskForm
              onAdd={addTask}
              onUpdate={updateTask}
              editingTask={editingTask}
              onCancelEdit={() => setEditingTask(null)}
              existingTasks={tasks.filter(t => !t.completed)}
            />
            <AIInsights
              analysis={aiAnalysis}
              loading={loadingAI}
              onAnalyze={analyzeTasks}
            />
          </div>

          {/* Right Column: Task List */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Görevlerim</h2>
              <div className="bg-slate-800 px-3 py-1 rounded-full text-sm text-gray-400 border border-slate-700">
                Toplam: {tasks.length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.length === 0 ? (
                <div className="col-span-full text-center py-10 opacity-50 border-2 border-dashed border-slate-700 rounded-xl">
                  <p>Henüz görev eklenmemiş.</p>
                </div>
              ) : (
                tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusCheck={updateTaskStatus}
                    onDelete={deleteTask}
                    onEdit={setEditingTask}
                    allTasks={tasks}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
