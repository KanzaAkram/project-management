import express from 'express';
import joi from 'joi';
import mongoose from 'mongoose';
import Project from '../models/index.js';

const api = express.Router();

// GET all projects
api.get('/projects', async (req, res) => {
    try {
        const data = await Project.find({}, { task: 0, __v: 0, updatedAt: 0 });
        return res.send(data);
    } catch (error) {
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

// GET project by ID
api.get('/project/:id', async (req, res) => {
    try {
        const data = await Project.findById(req.params.id);
        if (!data) return res.status(404).send({ error: true, message: 'Project not found' });
        return res.send(data);
    } catch (error) {
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

// POST new project
api.post('/project', async (req, res) => {
    const projectSchema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    });

    const { error, value } = projectSchema.validate(req.body);
    if (error) return res.status(422).send({ error: true, message: error.details[0].message });

    try {
        const newProject = await Project.create(value);
        return res.send(newProject);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(422).send({ error: true, message: 'Title must be unique' });
        }
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

// PUT update project by ID
api.put('/project/:id', async (req, res) => {
    const projectSchema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    });

    const { error, value } = projectSchema.validate(req.body);
    if (error) return res.status(422).send({ error: true, message: error.details[0].message });

    try {
        const updatedProject = await Project.findByIdAndUpdate(req.params.id, value, { new: true });
        if (!updatedProject) return res.status(404).send({ error: true, message: 'Project not found' });
        return res.send(updatedProject);
    } catch (error) {
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

// DELETE project by ID
api.delete('/project/:id', async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);
        if (!deletedProject) return res.status(404).send({ error: true, message: 'Project not found' });
        return res.send(deletedProject);
    } catch (error) {
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

// POST new task for a project
api.post('/project/:id/task', async (req, res) => {
    const taskSchema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    });

    const { error, value } = taskSchema.validate(req.body);
    if (error) return res.status(422).send({ error: true, message: error.details[0].message });

    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).send({ error: true, message: 'Project not found' });

        const newTask = { ...value, stage: 'Requested', order: project.task.length + 1, index: project.task.length };
        project.task.push(newTask);
        await project.save();

        return res.send(newTask);
    } catch (error) {
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

// GET task by ID for a project
api.get('/project/:id/task/:taskId', async (req, res) => {
    try {
        const project = await Project.findOne({ _id: req.params.id, 'task._id': req.params.taskId });
        if (!project) return res.status(404).send({ error: true, message: 'Task not found' });

        const task = project.task.find(t => t._id.toString() === req.params.taskId);
        return res.send(task);
    } catch (error) {
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

// PUT update task by ID for a project
api.put('/project/:id/task/:taskId', async (req, res) => {
    const taskSchema = joi.object({
        title: joi.string().min(3).max(30).required(),
        description: joi.string().required(),
    });

    const { error, value } = taskSchema.validate(req.body);
    if (error) return res.status(422).send({ error: true, message: error.details[0].message });

    try {
        const project = await Project.findOneAndUpdate(
            { _id: req.params.id, 'task._id': req.params.taskId },
            { $set: { 'task.$.title': value.title, 'task.$.description': value.description } },
            { new: true }
        );

        if (!project) return res.status(404).send({ error: true, message: 'Task not found' });

        return res.send(project);
    } catch (error) {
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

// DELETE task by ID for a project
api.delete('/project/:id/task/:taskId', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, { $pull: { task: { _id: req.params.taskId } } }, { new: true });
        if (!project) return res.status(404).send({ error: true, message: 'Task not found' });
        return res.send(project);
    } catch (error) {
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

// PUT update multiple tasks for a project
api.put('/project/:id/todo', async (req, res) => {
    const todo = [];

    try {
        for (const key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                for (let index = 0; index < req.body[key].items.length; index++) {
                    const item = req.body[key].items[index];
                    const updatedTask = await Project.findOneAndUpdate(
                        { _id: req.params.id, 'task._id': item._id },
                        { $set: { 'task.$.order': index, 'task.$.stage': key } },
                        { new: true }
                    );
                    if (updatedTask) todo.push(updatedTask);
                }
            }
        }

        return res.send(todo);
    } catch (error) {
        return res.status(500).send({ error: true, message: 'Server error' });
    }
});

export default api;
