import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

let onlineUsers = 0;

app.get('/', (req, res) => {
    res.json({
        message: 'Server Running'
    });
});

io.on('connection', (socket) => {

    console.log('User Connected');

    onlineUsers++;

    io.emit('count-update', onlineUsers);
    console.log('count-update= ', onlineUsers)

    socket.on('disconnect', () => {

        console.log('User Disconnected');

        onlineUsers--;

        io.emit('count-update', onlineUsers);

    });

});

io.on('connect_error', (err) => {
    console.log('Connection error:', err.message);
});

server.listen(3000, () => {
    console.log('Server Started');
});