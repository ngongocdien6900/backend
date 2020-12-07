const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const morgan = require('morgan')
require('dotenv').config();

//require route
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const chatRoomRoute = require('./routes/chatRoom');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json());
app.use(morgan('tiny'));


//use route
app.use('/auth', userRoute);
app.use('/admin', adminRoute);
app.use('/chatroom', chatRoomRoute)

//chạy khi client kết nối lên server
io.on("connection", socket => {
    console.log('Có người kết nối');
    
    socket.emit('message-welcome', 'Xin chào bạn, bạn cần hỗ trợ gì không?')

    socket.on('disconnect', () => {
        io.emit('user-leave', 'Bạn ấy đã rời cuộc trò truyện')
    })
});


server.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`)
})