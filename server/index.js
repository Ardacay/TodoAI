const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// In-memory data store
let tasks = [];

app.get('/', (req, res) => {
    res.send('TodoAI API is running');
});

// GET all tasks
app.get('/api/tasks', (req, res) => {
    res.json(tasks);
});

// POST a new task
app.post('/api/tasks', (req, res) => {
    const task = {
        id: Date.now().toString(),
        title: req.body.title,
        duration: req.body.duration, // in hours
        deadline: req.body.deadline, // ISO string
        priority: req.body.priority, // 'low', 'medium', 'high'
        dependencies: req.body.dependencies || [], // array of task IDs
        completed: false
    };
    tasks.push(task);
    res.status(201).json(task);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
