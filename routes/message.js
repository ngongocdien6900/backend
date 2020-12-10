const express = require('express');
const route = express.Router();
const message = require('../controllers/message');

//user
route.get('/', message.getMessageByConversation);


module.exports = route;