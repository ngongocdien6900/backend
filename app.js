const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const morgan = require("morgan");
require("dotenv").config();

//require route
const userRoute = require("./routes/user");
const messageRoute = require('./routes/message');

const ConversationModel = require("./models/conversation");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.use(morgan("tiny"));

//use route
app.use("/", userRoute);
app.use("/message", messageRoute);

//chạy khi client kết nối lên server
io.on("connection", (socket) => {

  socket.emit("message-welcome", "Xin chào bạn, bạn cần hỗ trợ gì không?");

  socket.on("join_room", idUser => {

    ConversationModel.findOne({
      idUser
    }).then(conversation => {
      if (!conversation) {
        const conversation = new ConversationModel({
          idUser,
        });

        conversation
          .save()
          .then(result => console.log('Tạo rồi nhé bạn hiền'))
          .catch(err => {
            console.log('Lỗi cmnr');
          })
      } else {
        console.log('Có rồi mà tạo gì nữa cha');
      }
    })


  });

  socket.on('chat', value => {
    // ConversationModel.updateOne({
    //   lastMessage: value
    // })
    // .then(console.log('Thành công'))
    // .catch(console.log('Thất bại'))
  })

  socket.on('join', idUser => {
    ConversationModel.findOne({
      idUser
    }).then(room => {
      if (room) {
        return socket.join(room._id);
      }
    })
  })


  socket.on("disconnect", () => {
    io.emit("user-leave", "Bạn ấy đã rời cuộc trò truyện");
  });
});

server.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});