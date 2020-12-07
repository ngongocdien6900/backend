const mongoose = require('../config/connectDB');

const Schema = mongoose.Schema;
const ChatRoomSchema = new Schema({
    name: {
        type: String,
        require: "Name is required"
    }
}, {
    collection: 'chatroom'
});

const ChatRoomModel = mongoose.model('chatroom', ChatRoomSchema);

module.exports = ChatRoomModel;