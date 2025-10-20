const express = require('express');
const app = express();

app.get('/', (req, res) => {
res.send('Hello, Mego! Your Node.js app is running on AWS 🚀');
});

app.get('/mego', (req, res) => {
res.send('Hello, Pipeline is working Fine! 💪');
});

app.listen(5000, () => {
console.log('App is running on port 5000');
});