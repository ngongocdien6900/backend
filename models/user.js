 const mongoose = require('../config/connectDB');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    fullname: {
        type: String,
        require: true,
    },
    gender: {
        type: String,
    },
    avatar: {
        //đường dẫn avatar
        type: String,
    },
    admin: {
        email: String,
        password: String,
        resetLink: String,
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