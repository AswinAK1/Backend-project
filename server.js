const express=require('express');
const app=express();
const path = require('path')
const fs = require('fs')
const DB=require('./DB/database')
const dotenv=require('dotenv').config()
const userRoute = require('./routes/userRouts')
const adminRoute = require('./routes/adminRoute')
const cookieParser= require('cookie-parser')
const multer = require('multer')
app.set('view engine','ejs')
const mongoose = require('mongoose')
mongoose.set('strictPopulate', false);




DB();

const imageDir = path.join(__dirname, './public/image');
if (!fs.existsSync(imageDir)) {
fs.mkdirSync(imageDir);
}

const fileStorage = multer.diskStorage({
  destination:(req,file,callback)=>{
    callback(null,path.join(__dirname,'./public/image'));
  },
  filename: (req, file, callback) => {
    const date = new Date().toISOString().replace(/:/g, '-');
    callback(null, `${date}_${file.originalname}`);
  }
})

const fileFilter = (req,file,callback)=>{
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg'){
    callback(null,true)
    console.log('Passed');
  }
  else{
    callback(null,false)
    console.log('Not passed');
  }
}

app.use(multer({dest:'images',storage:fileStorage,fileFilter:fileFilter}).single('imageUrl'))

app.use(express.static(path.join(__dirname,'public')));
app.set('views', path.join(__dirname, 'views'));
app.use('/images',express.static(path.join(__dirname,'images')))




app.use(express.json());
app.use(express.urlencoded({ extended:true}))
app.use(cookieParser())
app.use('/user', userRoute)
app.use('/admin',adminRoute)




const PORT=process.env.PORT
app.listen(PORT,()=>{
  console.log(`server is running on port ${PORT}`)
})