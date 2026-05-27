require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Serve static files FIRST (js, css, images, etc.)
app.use(express.static(path.join(__dirname)));

// ✅ Only fallback to HTML for actual HTML routes
app.get('*', (req, res) => {
  if (req.path.endsWith('.html') || req.path === '/') {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).send('File not found');
  }
});

app.listen(PORT, () => console.log(`🍽️ FoodCourt Hub running on http://localhost:${PORT}`));