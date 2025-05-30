// At the very top of your server file, add:
require('dotenv').config();

const express = require('express');
const path = require('path')

const cors = require('cors')
const multer = require('multer');
const connectDB = require('./src/config/db')

// initalize express app

const app = express()
const PORT = process.env.PORT || 5000;

// connect to datbase
connectDB()

// middlewarre
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))


// set up static  folder for  uplaod files
app.use('/uploads',express.static(path.join(__dirname,"uploads")))


// Routes
app.use('/api/auth',require('./src/routes/authRoutes'))
app.use('/api/college',require('./src/routes/collegeRoutes'))


// server statuc assest in production 

if(process.env.NODE_ENV==='production'){
    app.use(express.static(path.join(__dirname,'../frontend/build')))
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'../frontend/build' , 'index.html'))
    })
}


// start servr 
app.listen(PORT,()=>{
    console.log(`Server is running on port http://localhost:${PORT}`)
})