import express from 'express';
import { connect, Schema, model } from 'mongoose';
import { json } from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(json({ limit: '10mb' }));

const mongoURI = 'mongodb+srv://root:root@cluster0.sl5euf7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Определение схемы и модели для постов
const postSchema = new Schema({
  title: String,
  image: String,
  content: String,
});

const Post = model('Post', postSchema);

// Роуты для обработки запросов
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/posts', async (req, res) => {
  const { title, image, content } = req.body;

  const post = new Post({
    title,
    image,
    content,
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, image, content } = req.body;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, image, content },
      { new: true }
    );

    res.json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const authApp = express();
const AUTH_PORT = 3002;

authApp.use(cors());
authApp.use(json({ limit: '10mb' }));

const userSchema = new Schema({
  email: String,
  password: String,
});

const User = model('User', userSchema);

app.get('/users', async (req, res) => {
  const { email } = req.query;
  try {
    const user = await User.findOne({ email });
    res.json(user ? [user] : []);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/users', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
    } else {
      const newUser = new User({ email, password });
      await newUser.save();
      res.json(newUser);
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

authApp.listen(AUTH_PORT, () => {
  console.log(`Auth Server is running on http://localhost:${AUTH_PORT}`);
});