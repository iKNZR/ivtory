const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Your password must be at least 6 characters long'],
    },
    photo: {
        type: String,
        required: [true, 'Please upload your photo'],
        default: 'https://i.ibb.co/4pDNDk1/avatar.png'
    },
    phone: {
        type: String,
        defaul: '+51'
    },
    bio: {
        type: String,
        maxLength: [250, 'Please enter your bio and it must be less than 250 characters'],
        default: 'bio'
    },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(this.password, salt);
    this.password = hashPassword;
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;