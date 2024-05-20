const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleWare/errorMiddleware.js');
const userRouter = require('../server/routes/userRouter.js');
const productRouter = require('../server/routes/productRoute.js');
const contactRouter = require('../server/routes/contactRoutes.js');

const app = express();

//Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(
    cors({
        origin:["http://localhost:5173" || "https://elivtory.netlify.app"],
        credentials: true,
    })
)

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

//Routes Middleware
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/contactus', contactRouter);

//Routes
app.get("/", (req, res) => {
    res.send("Hello World")
});

//Error Middleware
app.use(errorHandler);
//Connect to MongoDB
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => { app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) }) })
    .catch((err) => { console.log(err) });