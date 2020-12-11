const express = require('express');
const route = express.Router();
const message = require('../controllers/message');

//user
route.get('/', message.getMessageByConversation);
route.post('/', message.postSaveMessage);

module.exports = route;