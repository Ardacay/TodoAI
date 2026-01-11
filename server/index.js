const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
require('dotenv').config();
const db = require('./db');
const aiService = require('./aiService');
const { authenticateToken, generateToken } = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('TodoAI API is running with SQLite');
});

// AUTH ENDPOINTS

app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = Date.now().toString();

        await db.run(
            `INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)`,
            [id, username, email, hashedPassword]
        );

        const token = generateToken({ id, email });
        res.status(201).json({ token, user: { id, username, email } });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: err.message });
        }
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// AI Analysis Endpoint (Protected)
app.post('/api/analyze', authenticateToken, async (req, res) => {
    try {
        const tasks = await db.all("SELECT * FROM tasks WHERE user_id = ?", [req.user.id]);
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

// GET all tasks (Protected)
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const tasks = await db.all("SELECT * FROM tasks WHERE user_id = ?", [req.user.id]);
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

// POST a new task (Protected)
app.post('/api/tasks', authenticateToken, async (req, res) => {
    const { title, duration, deadline, priority, dependencies } = req.body;
    const id = Date.now().toString();
    const completed = 0;
    const dependenciesStr = JSON.stringify(dependencies || []);

    try {
        await db.run(
            `INSERT INTO tasks (id, user_id, title, duration, deadline, priority, dependencies, completed) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, req.user.id, title, duration, deadline, priority, dependenciesStr, completed]
        );
        const newTask = { id, title, duration, deadline, priority, dependencies: dependencies || [], completed: false };
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update a task (Protected)
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, duration, deadline, priority, dependencies, completed } = req.body;

    // Fetch existing task ensuring it belongs to user
    try {
        const task = await db.get("SELECT * FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id]);
        if (!task) {
            return res.status(404).json({ error: "Task not found or access denied" });
        }

        const newCompleted = completed !== undefined ? (completed ? 1 : 0) : task.completed;
        const newDependencies = dependencies !== undefined ? JSON.stringify(dependencies) : task.dependencies;

        // Check completion restrictions
        if (newCompleted === 1) {
            const currentDependencies = dependencies !== undefined ? dependencies : JSON.parse(task.dependencies || '[]');

            if (currentDependencies.length > 0) {
                const placeholders = currentDependencies.map(() => '?').join(',');
                // Check incomplete deps strictly belonging to the user
                const incompleteDeps = await db.all(
                    `SELECT title FROM tasks WHERE id IN (${placeholders}) AND user_id = ? AND completed = 0`,
                    [...currentDependencies, req.user.id] // Note: This query logic is slightly complex for array diff, 
                    // but strictly checking if any ID in list is uncompleted for YES user.
                    // Actually, IN clause handles IDs. We just ensure they belong to user AND are uncompleted.
                );

                // Correction: The query above is trying to pass params. 
                // correct param order: specific IDs..., then userId.
                // However, logic: find tasks that ARE in the dependency list AND are NOT completed.
                // We trust the dependency list contains valid IDs. 
                const incompleteDepsCheck = await db.all(
                    `SELECT title FROM tasks WHERE id IN (${placeholders}) AND completed = 0`,
                    currentDependencies
                );

                if (incompleteDepsCheck.length > 0) {
                    const depTitles = incompleteDepsCheck.map(t => t.title).join(', ');
                    return res.status(400).json({
                        error: `Bu görevi tamamlamadan önce şu görevleri bitirmelisiniz: ${depTitles}`
                    });
                }
            }
        }

        await db.run(
            `UPDATE tasks SET 
             title = COALESCE(?, title),
             duration = COALESCE(?, duration),
             deadline = COALESCE(?, deadline),
             priority = COALESCE(?, priority),
             dependencies = ?,
             completed = ?
             WHERE id = ? AND user_id = ?`,
            [title, duration, deadline, priority, newDependencies, newCompleted, id, req.user.id]
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

// DELETE a task (Protected)
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.run("DELETE FROM tasks WHERE id = ? AND user_id = ?", [id, req.user.id]);
        // db.run context this.changes could be checked if we weren't using the wrapper mostly.
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
