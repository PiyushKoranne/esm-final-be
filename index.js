const express = require('express');
const server = express();
const cors  = require('cors');
// const {corsConfig} = require('./config/corsConfig');
require('dotenv').config();
const PORT = process.env.PORT || 4001;
const path = require('path');
const {connectDB} = require('./config/dbConn.js');
const mongoose = require('mongoose');
const { limiter } = require('./middlewares/rateLimit');
const session = require('express-session');
const MongoStore = require('connect-mongo')
const {checkLogin} = require('./middlewares/checkLogin');
const {authRouter} = require('./routes/authRouter');
const { emailManageRouter } = require('./routes/emailRouter');

// middlewares
connectDB();

server.use(session({
	secret:process.env.SESSION_SECRET,
	resave:false,
	saveUninitialized:false,
	store: MongoStore.create({
		mongoUrl:process.env.MONGODB_URL,
	})
}))
server.use(cors({origin:[process.env.FRONTEND_URL, 'http://localhost:5173'], credentials:true}));
server.use(express.urlencoded({extended:true}));
server.use(express.json());
server.use(express.static(path.join(__dirname,'public')));
server.use(limiter);

//routes
server.use('/auth', authRouter);
server.use('/manage', emailManageRouter);

//server listen // only listen for connections if mongodb is connected.
mongoose.connection.once('connected', ()=>{
    console.log('Connected to Mongo DB')
    server.listen(PORT, '0.0.0.0',()=>{
        console.log(`Server Listening for connections on PORT ${PORT}`);
    });
})

