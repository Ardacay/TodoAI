const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const db = require('./db');
const aiService = require('./aiService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('TodoAI API is running with SQLite');
});

// AI Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        const tasks = await db.all("SELECT * FROM tasks");
        // Parse dependencies for better context
        const preparedTasks = tasks.map(task => ({
            ...task,
            dependencies: JSON.parse(task.dependencies || '[]')
        }));

        const analysis = await aiService.analyzeTasks(preparedTasks);
        res.json(analysis);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await db.all("SELECT * FROM tasks");
        // Parse dependencies from JSON string
        const parsedTasks = tasks.map(task => ({
            ...task,
            completed: !!task.completed,
            dependencies: JSON.parse(task.dependencies || '[]')
        }));
        res.json(parsedTasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
    const { title, duration, deadline, priority, dependencies } = req.body;
    const id = Date.now().toString();
    const completed = 0;
    const dependenciesStr = JSON.stringify(dependencies || []);

    try {
        await db.run(
            `INSERT INTO tasks (id, title, duration, deadline, priority, dependencies, completed) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, title, duration, deadline, priority, dependenciesStr, completed]
        );
        const newTask = { id, title, duration, deadline, priority, dependencies: dependencies || [], completed: false };
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update a task
app.put('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, duration, deadline, priority, dependencies, completed } = req.body;

    // Fetch existing task to merge updates if needed, or just update what's provided
    // For simplicity, we'll update all fields provided.
    // Note: completed comes as boolean from frontend, we store as 0/1

    try {
        // First check if task exists
        const task = await db.get("SELECT * FROM tasks WHERE id = ?", [id]);
        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        const newCompleted = completed !== undefined ? (completed ? 1 : 0) : task.completed;
        const newDependencies = dependencies !== undefined ? JSON.stringify(dependencies) : task.dependencies;

        await db.run(
            `UPDATE tasks SET 
             title = COALESCE(?, title),
             duration = COALESCE(?, duration),
             deadline = COALESCE(?, deadline),
             priority = COALESCE(?, priority),
             dependencies = ?,
             completed = ?
             WHERE id = ?`,
            [title, duration, deadline, priority, newDependencies, newCompleted, id]
        );

        const updatedTask = await db.get("SELECT * FROM tasks WHERE id = ?", [id]);
        res.json({
            ...updatedTask,
            completed: !!updatedTask.completed,
            dependencies: JSON.parse(updatedTask.dependencies || '[]')
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.run("DELETE FROM tasks WHERE id = ?", [id]);
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
