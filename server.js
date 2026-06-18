import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;
const URL = process.env.URL || "http://localhost";

app.listen(PORT, () => {
    console.log(`API on ${URL}:${PORT}`);
});