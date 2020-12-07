const mongoose = require('../config/connectDB');

const Schema = mongoose.Schema;
const AdminSchema = new Schema({
    fullname: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
    role: {
        type: String,
        default: 'admin',
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
    resetLink: {
        data: String,
        default: ''
    }

}, {
    collection: 'admin'
});

const AdminModel = mongoose.model('admin', AdminSchema);

module.exports = AdminModel;