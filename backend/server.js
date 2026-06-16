const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas cluster successfully.'))
  .catch((err) => console.error('MongoDB connection error:', err));

// --- Schemas & Models ---

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    enum: ['general', 'daily', 'weekly', 'monthly'],
    default: 'general'
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const TodoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
const Transaction = mongoose.model('Transaction', TransactionSchema);
const Todo = mongoose.model('Todo', TodoSchema);

const JWT_SECRET = process.env.JWT_SECRET || 'selfmony_secret_key_123_abc';

// --- Auth Routes ---

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username.toLowerCase(),
      password: hashedPassword
    });

    const savedUser = await user.save();
    const token = jwt.sign({ userId: savedUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during signup', error: error.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error during login', error: error.message });
  }
});

// GET /api/auth/me (Get current user)
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// --- API Routes (Protected) ---

// GET /api/transactions
app.get('/api/transactions', auth, async (req, res) => {
  try {
    const { type, category } = req.query;
    const filter = { userId: req.user.userId };
    
    if (type) filter.type = type;
    if (category) filter.category = category;

    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving transactions', error: error.message });
  }
});

// POST /api/transactions
app.post('/api/transactions', auth, async (req, res) => {
  try {
    const { name, description, amount, type, category, date } = req.body;
    
    if (!name || amount === undefined || !type) {
      return res.status(400).json({ message: 'Missing required fields: name, amount, or type' });
    }

    const transaction = new Transaction({
      userId: req.user.userId,
      name,
      description: description || '',
      amount: Number(amount),
      type,
      category: category || 'general',
      date: date ? new Date(date) : new Date()
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
});

// DELETE /api/transactions (Clear All Data for logged-in user)
app.delete('/api/transactions', auth, async (req, res) => {
  try {
    await Transaction.deleteMany({ userId: req.user.userId });
    await Todo.deleteMany({ userId: req.user.userId });
    res.json({ message: 'All transactions and todos have been successfully deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing data', error: error.message });
  }
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Transaction.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found or unauthorized' });
    }
    res.json({ message: 'Transaction deleted successfully', transaction: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting transaction', error: error.message });
  }
});

// GET /api/todos
app.get('/api/todos', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving todos', error: error.message });
  }
});

// POST /api/todos
app.post('/api/todos', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Task name is required' });
    }

    const todo = new Todo({
      userId: req.user.userId,
      name: name.trim()
    });
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating todo', error: error.message });
  }
});

// PUT /api/todos/:id (Toggle complete)
app.put('/api/todos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;

    const updatedTodo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { completed },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ message: 'Todo not found or unauthorized' });
    }

    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating todo', error: error.message });
  }
});

// DELETE /api/todos/:id
app.delete('/api/todos/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Todo.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!deleted) {
      return res.status(404).json({ message: 'Todo not found or unauthorized' });
    }
    res.json({ message: 'Todo deleted successfully', todo: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting todo', error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

