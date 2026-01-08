import { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';
import TaskCard from './components/TaskCard';
import AIInsights from './components/AIInsights';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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
    setLoadingAI(true);
    try {
      // Send a request to analyze, passing nothing as body since server fetches from DB
      // But our endpoint design was server-side fetching.
      // Wait, did I implement POST /api/analyze to read from DB or body?
      // Checking server code... it reads from DB.
      const response = await axios.post(`${API_URL}/analyze`);
      setAiAnalysis(response.data);
    } catch (error) {
      console.error('Error during AI analysis:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-2">
            TodoAI
          </h1>
          <p className="text-gray-400">Yapay Zeka Destekli Akıllı Görev Yönetimi</p>
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
