const express = require('express');
const PORT = 8000;

const app = express();
app.use(express.json());

app.get('/products', () => { 
    return res.json("Product Service")

})

app.get('/', () => {
    return res.json("Product Service")
})

app.listen(PORT, () => {
    console.log(`Product is running on ${PORT}`);
    console.clear();
})