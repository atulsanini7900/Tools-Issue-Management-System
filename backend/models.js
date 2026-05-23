import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  mobileNo: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid 10-digit mobile number!`
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['admin', 'mechanic'],
    default: 'mechanic'
  },
  level: {
    type: String,
    enum: {
      values: ['Expert', 'Medium', 'New Recruit', 'Trainee'],
      message: 'Mechanic level must be Expert, Medium, New Recruit, or Trainee'
    },
    required: function() {
      return this.role === 'mechanic';
    }
  },
  picture: {
    type: String, // Base64
    default: ''
  }
}, { timestamps: true });

// Tool Schema
const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tool name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Tool category is required'],
    enum: {
      values: ['Screwdriver', 'Wrench', 'Plier', 'Hammer', 'Saw', 'Drill', 'Other'],
      message: 'Category must be Screwdriver, Wrench, Plier, Hammer, Saw, Drill, or Other'
    }
  },
  image: {
    type: String, // Base64
    default: ''
  },
  quantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  }
}, { timestamps: true });

// Issue Record Schema
const issueRecordSchema = new mongoose.Schema({
  toolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tool',
    required: true
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Must issue at least 1 tool']
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned'],
    default: 'Issued'
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
export const Tool = mongoose.model('Tool', toolSchema);
export const IssueRecord = mongoose.model('IssueRecord', issueRecordSchema);
