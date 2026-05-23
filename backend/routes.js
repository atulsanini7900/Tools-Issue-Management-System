import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Tool, IssueRecord } from './models.js';

const router = express.Router();

// Authentication Middleware
export const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_tool_room_encryption_key_98765');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Admin check Middleware
export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access denied' });
  }
};

// --- AUTHENTICATION ROUTES ---

// Mechanic Registration
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, mobileNo, password, level, picture } = req.body;

    // Basic Input Validations
    if (!name || !email || !mobileNo || !password || !level) {
      return res.status(400).json({ message: 'All fields (Name, Email, Mobile No, Password, Level) are required.' });
    }

    // Email check (Unique)
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'This Email is already registered. Please use a different one.' });
    }

    // Mobile Number Validation
    // Maximum 10 characters check & unique check
    if (!/^\d{10}$/.test(mobileNo)) {
      return res.status(400).json({ message: 'Mobile number must be a valid 10-digit number.' });
    }

    const existingUserByMobile = await User.findOne({ mobileNo });
    if (existingUserByMobile) {
      return res.status(400).json({ message: 'This Mobile Number is already registered.' });
    }

    // Password Validation: Alphanumeric and at least one special character
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/-]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long, alphanumeric, and contain at least one special character.' 
      });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Mechanic User
    const newMechanic = new User({
      name,
      email: email.toLowerCase(),
      mobileNo,
      password: hashedPassword,
      role: 'mechanic',
      level,
      picture: picture || ''
    });

    await newMechanic.save();

    res.status(201).json({ 
      message: 'Mechanic registered successfully!', 
      user: { 
        id: newMechanic._id, 
        name: newMechanic.name, 
        email: newMechanic.email, 
        mobileNo: newMechanic.mobileNo, 
        role: newMechanic.role,
        level: newMechanic.level 
      } 
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Error registering mechanic. ' + error.message });
  }
});

// Login for Admin & Mechanic
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find User
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'super_secret_tool_room_encryption_key_98765',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        role: user.role,
        level: user.level,
        picture: user.picture
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// --- TOOLS INVENTORY ROUTES ---

// List all tools (Accessible by logged in mechanics & admins)
router.get('/tools', authenticateJWT, async (req, res) => {
  try {
    const tools = await Tool.find({}).sort({ name: 1 });
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tools. ' + error.message });
  }
});

// Add a new tool to inventory (Admin Only)
router.post('/tools', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const { name, category, image, quantity } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Tool Name and Category are required.' });
    }

    const availableQuantity = quantity ? parseInt(quantity) : 0;
    if (isNaN(availableQuantity) || availableQuantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative number.' });
    }

    // Create new tool
    const newTool = new Tool({
      name,
      category,
      image: image || '',
      quantity: availableQuantity
    });

    await newTool.save();
    res.status(201).json({ message: 'New tool added successfully to the tool room!', tool: newTool });

  } catch (error) {
    console.error('Add Tool Error:', error);
    res.status(500).json({ message: 'Error adding tool. ' + error.message });
  }
});

// --- TOOL ISSUE & RETURN ROUTES ---

// Issue a tool (Mechanic Only)
router.post('/tools/issue', authenticateJWT, async (req, res) => {
  try {
    const { toolId, quantity } = req.body;
    const mechanicId = req.user.id;
    const issueQty = quantity ? parseInt(quantity) : 1;

    if (!toolId) {
      return res.status(400).json({ message: 'Tool ID is required.' });
    }

    // Fetch tool to verify existence and quantity
    const tool = await Tool.findById(toolId);
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found in inventory.' });
    }

    if (tool.quantity < issueQty) {
      return res.status(400).json({ 
        message: `Insufficient inventory! Only ${tool.quantity} unit(s) of "${tool.name}" available in the tool room.` 
      });
    }

    // Deduct inventory
    tool.quantity -= issueQty;
    await tool.save();

    // Create Issue Record
    const issueRecord = new IssueRecord({
      toolId,
      mechanicId,
      quantity: issueQty,
      status: 'Issued'
    });
    await issueRecord.save();

    // Fetch populated record to return
    const populatedRecord = await IssueRecord.findById(issueRecord._id)
      .populate('toolId', 'name category image')
      .populate('mechanicId', 'name email mobileNo level');

    res.status(201).json({ 
      message: `Tool "${tool.name}" successfully issued!`, 
      record: populatedRecord 
    });

  } catch (error) {
    console.error('Issue Tool Error:', error);
    res.status(500).json({ message: 'Error processing tool issue. ' + error.message });
  }
});

// Return an issued tool (Mechanic Only)
router.post('/tools/return', authenticateJWT, async (req, res) => {
  try {
    const { recordId } = req.body;
    const mechanicId = req.user.id;

    if (!recordId) {
      return res.status(400).json({ message: 'Issue Record ID is required.' });
    }

    // Find active issue record
    const record = await IssueRecord.findOne({ _id: recordId, mechanicId, status: 'Issued' });
    if (!record) {
      return res.status(404).json({ message: 'Active issue record not found for this user.' });
    }

    // Find matching tool
    const tool = await Tool.findById(record.toolId);
    if (!tool) {
      return res.status(404).json({ message: 'Tool referenced in the record was not found.' });
    }

    // Increment inventory back
    tool.quantity += record.quantity;
    await tool.save();

    // Mark record returned
    record.status = 'Returned';
    record.returnDate = new Date();
    await record.save();

    res.json({ 
      message: `Tool "${tool.name}" successfully returned and inventory restocked!`,
      record 
    });

  } catch (error) {
    console.error('Return Tool Error:', error);
    res.status(500).json({ message: 'Error processing tool return. ' + error.message });
  }
});

// --- ISSUE REGISTER AUDIT ROUTES ---

// Get issue logs
router.get('/issues', authenticateJWT, async (req, res) => {
  try {
    let query = {};
    
    // If mechanic, they only view their own logs
    if (req.user.role === 'mechanic') {
      query.mechanicId = req.user.id;
    }
    
    // Admins view all logs across the tool room
    const logs = await IssueRecord.find(query)
      .populate('toolId', 'name category image')
      .populate('mechanicId', 'name email mobileNo level')
      .sort({ issueDate: -1 });

    res.json(logs);
  } catch (error) {
    console.error('Get Issue Register Error:', error);
    res.status(500).json({ message: 'Error retrieving issue register. ' + error.message });
  }
});

export default router;
