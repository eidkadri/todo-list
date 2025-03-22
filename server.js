const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات
const uri = process.env.MONGODB_URI;

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch(err => console.error('❌ Error connecting to MongoDB:', err));

// نموذج المهام (Todo Schema)
const TodoSchema = new mongoose.Schema({
  task: String,
  completed: {
    type: Boolean,
    default: false,
  },
  dueDate: Date, // تاريخ الاستحقاق
  priority: String, // الأولوية (مثل p1, p2, p3)
  reminder: Date, // التذكير
});

const Todo = mongoose.model('Todo', TodoSchema);

// إضافة مهمة جديدة
app.post('/api/todos', async (req, res) => {
  try {
    const { task, dueDate, priority, reminder } = req.body;
    const newTodo = new Todo({ task, dueDate, priority, reminder });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: "Error adding task", error });
  }
});

// استرجاع جميع المهام
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ dueDate: 1 }); // ترتيب المهام حسب التاريخ
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
});

// تحديث حالة المهمة (تمت/لم تتم)
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, dueDate, priority, reminder } = req.body;
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { completed, dueDate, priority, reminder },
      { new: true }
    );
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
});

// حذف مهمة
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
});

// الحصول على تاريخ اليوم
app.get('/api/today', (req, res) => {
  const today = new Date().toLocaleDateString(); // تاريخ اليوم
  res.json({ today });
});

// تشغيل الخادم
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server is running on port ${PORT}`));