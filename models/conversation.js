const mongoose = require('../config/connectDB');

const Schema = mongoose.Schema;
const ConversationSchema = new Schema({
    idUser: String,
    nameConversation: String,
    lastMessage: String,
    createAt: {
        type: Number,
        default: Date.now
    },
}, {
    collection: 'conversation'
});

const ConversationModel = mongoose.model('conversation', ConversationSchema);

module.exports = ConversationModel;