import React, { useState, useEffect } from 'react';

const TaskForm = ({ onAdd, onUpdate, editingTask, onCancelEdit, existingTasks }) => {
    const [formData, setFormData] = useState({
        title: '',
        duration: '',
        deadline: '',
        priority: 'medium',
        dependencies: []
    });

    useEffect(() => {
        if (editingTask) {
            setFormData({
                title: editingTask.title,
                duration: editingTask.duration || '',
                deadline: editingTask.deadline || '',
                priority: editingTask.priority || 'medium',
                dependencies: editingTask.dependencies || []
            });
        }
    }, [editingTask]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title) return;

        if (editingTask) {
            onUpdate(editingTask.id, formData);
        } else {
            onAdd(formData);
        }

        setFormData({
            title: '',
            duration: '',
            deadline: '',
            priority: 'medium',
            dependencies: []
        });
    };

    const toggleDependency = (taskId) => {
        setFormData(prev => {
            const deps = prev.dependencies.includes(taskId)
                ? prev.dependencies.filter(id => id !== taskId)
                : [...prev.dependencies, taskId];
            return { ...prev, dependencies: deps };
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">
                {editingTask ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
            </h2>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Görev Adı</label>
                <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Örn: Proje Raporu Hazırla"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tahmini Süre (Saat)</label>
                    <input
                        type="number"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                        placeholder="2"
                        min="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Öncelik</label>
                    <select
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                        <option value="low">Düşük</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yüksek</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Son Teslim Tarihi</label>
                <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
            </div>

            {existingTasks.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Bağımlılıklar (Önce tamamlanması gerekenler)</label>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 max-h-32 overflow-y-auto space-y-2">
                        {existingTasks.map(task => (
                            <div key={task.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`dep-${task.id}`}
                                    checked={formData.dependencies.includes(task.id)}
                                    onChange={() => toggleDependency(task.id)}
                                    className="h-4 w-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
                                />
                                <label htmlFor={`dep-${task.id}`} className="ml-2 text-sm text-gray-300 truncate cursor-pointer select-none">
                                    {task.title}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-2">
                {editingTask && (
                    <button
                        type="button"
                        onClick={() => {
                            onCancelEdit();
                            setFormData({
                                title: '',
                                duration: '',
                                deadline: '',
                                priority: 'medium',
                                dependencies: []
                            });
                        }}
                        className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors"
                    >
                        İptal
                    </button>
                )}
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform transition-all active:scale-95"
                >
                    {editingTask ? 'Güncelle' : 'Görev Oluştur'}
                </button>
            </div>
        </form>
    );
};

export default TaskForm;
