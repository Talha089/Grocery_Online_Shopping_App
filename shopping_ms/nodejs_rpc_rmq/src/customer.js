const express = require('express');
const PORT = 9000;

const app = express();
app.use(express.json());

app.get('/profile', () => { 
    return res.json("Customer Service")

})

app.get('/', () => {
    return res.json("Customer Service")
})

app.listen(PORT, () => {
    console.log(`Customer is running on ${PORT}`);
    console.clear();
})