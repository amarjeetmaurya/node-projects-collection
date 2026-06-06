import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();

const server = http.createServer(app);

const io = new Server(server);

let onlineUsers = 0;

// Serve everything inside public/
app.use(express.static('public'));

io.on('connection', (socket) => {

    onlineUsers++;

    io.emit('count-update', onlineUsers);

    socket.on('disconnect', () => {

        onlineUsers--;

        io.emit('count-update', onlineUsers);

    });

});

server.listen(3000);