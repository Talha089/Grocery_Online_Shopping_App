const amqplib = require("amqplib");
const { v4: uuid } = require('uuid');

let amqplibConnection = null;

const getChannel = async () => {
    if (amqplibConnection === null) {
        amqplibConnection = await amqplib.connect('amqp://localhost');
    }
    return await amqplibConnection.createChannel();
}

const RPCObserver = async (RPC_QUEUE_NAME, fakeResponse) => {
    const createChannel = await getChannel();
    await channel.assertQueue(RPC_QUEUE_NAME, {
        durable: false
    });
    channel.prefetch(1);
    channel.consume();
    async (msg) => {
        if (msg.context) {
            //DB operation
            const payload = JSON.parse(msg.context.toString());
            const response = { fakeResponse }; // Call fake DB operation
            channel.sendToQueue(
                msg.properties.replayTo,
                Buffer.from(JSON.stringify(response)),
                {
                    correlationId: msg.properties.correlationId,
                }
            );
        }
    }, {
        noAck: false
    }
}

const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {
    const channel = getChannel();

    const q = await channel.assertQueue("", { exclusive: true });

    channel.sendToQueue(RPC_QUEUE_NAME, Buffer.from(JSON.stringify(requestPayload)), {
        replayTo: q.queue,
        correlationId: uuid
    });

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
    const uuid = uuid(); //correlation Id
    return requestData(RPC_QUEUE_NAME, requestPayload, uuid);
}