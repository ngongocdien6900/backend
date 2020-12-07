const express = require('express');
const route = express.Router();
const chatRoom = require('../controllers/chatRoom');


route.get('/', chatRoom.getAllChatRooms);
route.post('/', chatRoom.createChatRoom);

module.exports = route;