import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from './models.js';
import apiRouter from './routes.js';

// Load Environment Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Configure JSON parser with extended payload size limits for Base64 images
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Serve API Routes
app.use('/api', apiRouter);

// Basic Welcome Route
app.get('/', (req, res) => {
  res.send('Tools Issue Management System API is running...');
});

// Seed Default Administrator Account
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@toolroom.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      console.log('Seeding default administrator account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@12345', salt);

      const adminUser = new User({
        name: 'Toolroom Admin',
        email: adminEmail,
        mobileNo: '0000000000', // Unique placeholder for Admin
        password: hashedPassword,
        role: 'admin',
        level: undefined
      });

      await adminUser.save();
      console.log('Default administrator account created successfully!');
      console.log(`Email: ${adminEmail}`);
      console.log('Password: Admin@12345');
    } else {
      console.log('Administrator account already exists. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding default administrator:', error.message);
  }
};

// Database Connection & Server Initialization
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tools_issue_db';

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('Successfully connected to MongoDB database!');
    // Seed admin account
    await seedAdmin();
    // Start Express listener
    app.listen(PORT, () => {
      console.log(`Server successfully started and running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB database connection failure:', err.message);
    process.exit(1);
  });
