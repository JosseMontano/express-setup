import express from 'express';

const app = express();
app.use(express.json());

const PORT=3000;

app.get('/', (_, res) => {
  res.send('Hi');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});