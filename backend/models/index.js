// import { number, string } from "joi";
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    order: Number,
    stage: String,
    index: Number,
    attachment: [
        { type: String, url: String }
    ],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: String,
    task: [taskSchema]
}, { timestamps: true });

const Project = mongoose.model('tasks.usertask', projectSchema);

export default Project;
