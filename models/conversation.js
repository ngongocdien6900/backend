const mongoose = require('../config/connectDB');

const Schema = mongoose.Schema;
const ConversationSchema = new Schema({
    idUser: String,
}, {
    collection: 'conversation'
});

const ConversationModel = mongoose.model('conversation', ConversationSchema);

module.exports = ConversationModel;