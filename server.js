require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/product'));
app.use('/api/orders', require('./routes/order'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});