const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Token = require('../models/tokenModel.js');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail.js');

//Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

//Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    //validation
    if (!name || !email || !password) {
        req.status(400);
        throw new Error('Please fill in all fields');
    }
    if (password.length < 6) {
        req.status(400);
        throw new Error('Password must be at least 6 characters long');
    }

    //Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('Email has already registered');
    }

    //Create new user
    const user = await User.create({
        name,
        email,
        password
    })

    //Generate Token
    const token = generateToken(user._id);

    //Send HTTP-only cookie
    res.cookie('token', token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400 * 30), //1 mes
        sameSite: "none",
        secure: true,
    })

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(201).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        })
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

//Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    //Validate Request
    if (!email || !password) {
        res.status(400);
        throw new Error('Please add email and password');
    }

    //Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400);
        throw new Error("User not found, please register")
    }

    //User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    //Generate Token
    const token = generateToken(user._id);

    if (passwordIsCorrect) {
        //Send HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400 * 30), //1 mes
            sameSite: "none",
            secure: true,
        });
    }
    if (user && passwordIsCorrect) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token,
        })
    } else {
        res.status(400);
        throw new Error('Invalid email or password')
    }
});

//logout User
const logout = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
    });
    return res.status(200).json({ message: "Successfully Logged Out" })
});

//Get user Data
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email, photo, phone, bio } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

//Get login status
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false)
    }
    //Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
        return res.json(true)
    }
    return res.json(false)
});

//Update User
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { name, email, photo, phone, bio } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const changePassword = asyncHandler(async (req, res) => {
    const user = await User.finById(req.user._id);
    const { oldPassword, password } = req.body;

    if (!user) {
        res.status(400);
        throw new Error("User not found, please signup")
    }
    //Validate
    if (!oldPassword || !password) {
        res.status(400);
        throw new Error('Please add old password and new password');
    }

    //
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    //Save new password
    if (user && passwordIsCorrect) {
        user.password = password;
        await user.save();
        res.status(200).send("Password changed successfully");
    } else {
        res.status(400);
        throw new Error("Old password is incorrect")
    }
});

//Forgot Password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("User not found, please register")
    }

    //Delete token if it exists in DB
    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }

    //Create Reset Token
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
    console.log(resetToken);

    //Hash token before saving to DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //Save token to DB
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 1000 * 60 * 30, //30 mins
    }).save();

    // Construct Reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    //Reset Email Template
    const message = `
        <h1>Hello ${user.name}</h1>
        <p>Please use the url below to reset your password</p>
        <p>This reset link is valid only for 30 minutes.</p>

        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

        <p>Regards...</p>
        <p>Greetings</p>
    `;
    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;

    try {
        await sendEmail(subject, message, send_to, sent_from);
        res.status(200).json({ success: true, message: "Reset Email Sent" });
    } catch (error) {
        res.status(500);
        throw new Error("Email not sent, please try again later")
    }
});

//Reset Password
const resetPassowrd = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;

    //Hash token, then compare to Token in DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //Find token in DB
    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
        res.status(404);
        throw new Error("Invalid or Expired token");
    }

    //Find User
    const user = await User.findOne({ _id: userToken.userId });
    user.password = password;
    await user.save();
    res.status(200).jsons({
        message: "Password reset successful, please log in with your new password"
    });
});

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassowrd,
};