const amqplib = require("amqplib");
const { v4: uuid4 } = require('uuid');

let amqplibConnection = null;

const getChannel = async () => {
    if (amqplibConnection === null) {
        amqplibConnection = await amqplib.connect('amqp://localhost');
    }
    return await amqplibConnection.createChannel();
}

const expensiveDBOperation = (payload, fakeResponse) => {
    console.log(payload);
    console.log(fakeResponse);

    return new Promise((req, res) => {
        setTimeout(() => {
            res(fakeResponse)
        }, 3000);
    })
}

const RPCObserver = async (RPC_QUEUE_NAME, fakeResponse) => {
    const channel = await getChannel();
    await channel.assertQueue(RPC_QUEUE_NAME, {
        durable: false
    });
    channel.prefetch(1);
    channel.consume(
        RPC_QUEUE_NAME,
        async (msg) => {
            if (msg.context) {
                console.log(msg.context)
                //DB operation
                const payload = JSON.parse(msg.context.toString());
                const response = await expensiveDBOperation(payload, fakeResponse)// Call fake DB operation
                channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(response)),
                    {
                        correlationId: msg.properties.correlationId,
                    }
                );
                channel.ack(msg)
            }
        }, {
        noAck: false
    }
    );
}

const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {
    
    const channel = await getChannel();
    
    const q = await channel.assertQueue("", { exclusive: true });
    console.log('nooo');
    
    channel.sendToQueue(RPC_QUEUE_NAME, Buffer.from(JSON.stringify(requestPayload)), {
        replyTo: q.queue,
        correlationId: uuid
    });
    console.log('**** LOGGERRR')

    return new Promise((resolve, reject) => {
        channel.consume(q.queue, (msg) => {
            if (msg.properties.correlationId === uuid) {
                resolve(JSON.parse(msg.content.toString()));
            } else {
                reject("Data not found");
            }
        },
            {
                noAck: true
            });
    });
}

const RPCRequest = async (RPC_QUEUE_NAME, requestPayload) => {
    console.log('*****requestreceived', RPC_QUEUE_NAME, requestPayload)
    const uuid = uuid4(); //correlation Id
    return requestData(RPC_QUEUE_NAME, requestPayload, uuid);
}

module.exports = {
    getChannel,
    RPCObserver,
    RPCRequest
}