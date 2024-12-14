const express = require('express');
const { RPCObserver, RPCRequest } = require('./rpc');
const PORT = 9000;

const app = express();
app.use(express.json());

const fakeCustomerResponse = {
    _id: "ythoahr89h8a938hfu",
    name: "Mike",
    country: "America"
}
RPCObserver("CUSTOMER_RPC", fakeCustomerResponse);

app.get('/wishlist', async (req, res) => {
    try {
        const requestPayload = {
            productId: "123",
            customerId: "ythoahr89h8a938hfu"
        };
        console.log("***** requestPayload", requestPayload)
        const responseData = await RPCRequest("PRODUCT_RPC", requestPayload)
        console.log("***** responseData", responseData);
        return res.status(200).json(responseData)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

app.get('/', (req, res) => {
    return res.json("Customer Service")
})

app.listen(PORT, () => {
    console.log(`Customer is running on ${PORT}`);
    console.clear();
})