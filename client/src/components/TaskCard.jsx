import React from 'react';

const TaskCard = ({ task, onDelete, onStatusCheck, onEdit, allTasks }) => {
    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'bg-red-500 text-white';
            case 'medium': return 'bg-yellow-500 text-white';
            case 'low': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Belirtilmedi';
        return new Date(dateString).toLocaleString('tr-TR', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className={`group relative bg-slate-800 rounded-xl p-4 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${task.completed ? 'border-green-500/30 opacity-75' : 'border-slate-700'}`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-3">
                    <button
                        onClick={() => onStatusCheck(task)}
                        className={`mt-1 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-500 hover:border-purple-500'}`}
                    >
                        {task.completed && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                    <div>
                        <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {task.title}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'high' ? 'Yüksek' : task.priority === 'medium' ? 'Orta' : 'Düşük'}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onEdit(task)}
                        className="text-gray-500 hover:text-blue-400 transition-colors"
                        title="Düzenle"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(task.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                        title="Sil"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Süre: {task.duration} saat</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Bitiş: {formatDate(task.deadline)}</span>
                </div>
                {task.dependencies && task.dependencies.length > 0 && (
                    <div className="flex flex-col gap-1 text-xs text-orange-400 mt-2">
                        <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="font-semibold">Bağımlı olduğu görevler:</span>
                        </div>
                        <ul className="list-disc list-inside pl-6 text-gray-400">
                            {task.dependencies.map(depId => {
                                const depTask = allTasks?.find(t => t.id === depId);
                                return (
                                    <li key={depId}>
                                        {depTask ? depTask.title : 'Bilinmeyen Görev'}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
