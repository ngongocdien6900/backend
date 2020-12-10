const mongoose = require('../config/connectDB');
const conversation = require('./conversation');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    idConversation: {
        type: Schema.Types.ObjectId,
        ref: 'conversation',
    },
    sender: {
        type: String,
        ref: 'user',
    },
    message: {
        type: String,
    }
}, {
    collection: 'message'
});

const MessageModel = mongoose.model('message', MessageSchema);







// MessageModel.find({
//     idConversation: '5fd22c4fa0326c27c40e2bb9'
// })
// .populate('idConversation')
// .exec((err, message) => {
//     if(message)
//         return console.log(message);
//     console.log(err)
// })

module.exports = MessageModel;