const MessageModel = require("../models/messages");
const ConversationModel = require("../models/conversation");
module.exports = {

    getMessageByConversation: (req, res) => {

        ConversationModel.findOne({
            $or: [
                {idUser: req.query.idUser},
                {_id: req.query.idConversation}
            ]
        }).then(user => {
            if (!user) {
                console.log('Hi, hihihi');
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
    },

    postSaveMessage: (req, res) => {
        const {
            idConversation,
            sender,
            message
        } = req.body;

        const messagee = new MessageModel({
            sender,
            message,
            idConversation
        })

        messagee
            .save()
            .then(result => {
                res.status(201).json({
                    data: result,
                });
            })
            .catch((err) => {
                res.status(500).json({
                    error: err,
                });
            });
    },

};