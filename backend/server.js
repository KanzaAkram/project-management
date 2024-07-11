// require("dotenv").config();
import express from 'express';
import api from './routes/index.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

mongoose.connect(process.env.MONGODB_PATH, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.log('Error connecting to MongoDB:', error));

const PORT = process.env.SERVER_PORT || 9000;
const origin = process.env.CORS_ORIGIN || 'http://localhost:3000';

const app = express();

app.use(cors({
    origin
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(api);

app.listen(PORT, () => {
    console.log(`Your app is running on http://localhost:${PORT}`);
});
