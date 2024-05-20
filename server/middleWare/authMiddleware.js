const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');

const protect = asyncHandler(async(req, res, next) =>{
    try {
        const token = req.cookies.token;
        if(!token){
            res.status(401);
            throw new Error('Not authorized, please login first')
        }

        //VerifyToken
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        //Get user id from token
        const user = await User.findById(verified.id).select('-password');

        if(!user){
            res.status(401);
            throw new Error('User not found')
        }
        req.user=user;
        next();

    } catch (error) {
        res.status(401);
        throw new Error(error.message)        
    }
})

module.exports = protect;