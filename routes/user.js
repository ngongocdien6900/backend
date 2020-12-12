const express = require('express');
const route = express.Router();
const user = require('../controllers/user');

//user
route.post('/googlelogin', user.postLoginGoogle);
route.post('/facebooklogin', user.postLoginFacebook);

module.exports = route;