const MessageModel = require("../models/messages");
const ConversationModel = require("../models/conversation");
module.exports = {



    getMessageByConversation: (req, res) => {

        ConversationModel.findOne({
            idUser: req.query.idUser,
        }).then(user => {
            if (!user) {
                console.log('User chưa chat lần nào cả');
            } else {
                MessageModel.find({
                    idConversation: user._id
                })
                .populate('idConversation')
                .exec((err, messages) => {
                    if (!messages) {
                        return res.status(400).json({
                            message: 'Thất bại'
                        })
                    } else {
                        return res.status(200).json({
                            messageList: messages
                        })
                    }
                })
            }
        })


    }

};