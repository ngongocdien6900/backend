 const mongoose = require('../config/connectDB');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    fullname: {
        type: String,
        require: true,
    },
    gender: {
        type: String,
        require: true,
    },
    phone: {
        type: String,
        default: null,
    },
    avatar: {
        //đường dẫn avatar
        type: String,
        default: null,
    },
    facebook: {
        uid: String,
        email: String,
    },
    google: {
        uid: String,
        email: String,
    },
    createAt: {
        type: Number,
        default: Date.now
    },
    updateAt: {
        type: Number,
        default: null
    },
    deleteAt: {
        type: Number,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    resetLink: {
        data: String,
        default: ''
    }
}, {
    collection: 'user'
});

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;