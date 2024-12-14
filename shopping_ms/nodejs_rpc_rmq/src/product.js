const express = require('express');
const { RPCObserver, RPCRequest } = require('./rpc');
const PORT = 8000;

const app = express();
app.use(express.json());


const fakeProductResponse = {
    _id: "ythoahr89h8a938hfu",
    title: "iPhone",
    price: "100$"
}
RPCObserver("PRODUCT_RPC", fakeProductResponse);


app.get('/customer', async (req, res) => {
    try {
        const requestPayload = {
            customerId: "ythoahr89h8a938hfu"
        };
        console.log(requestPayload)
        const responseData = await RPCRequest("CUSTOMER_RPC", requestPayload)
        console.log(responseData);
        return res.status(200).json(responseData)
    } catch (error) {
        console.log(error)
        return res.status(500).json(error);
    }
})

app.get('/', (req, res) => {
    return res.json("Product Service")
})

app.listen(PORT, () => {
    console.log(`Product is running on ${PORT}`);
    console.clear();
})