const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
  fullName:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true,
    // match:[/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
  },
  phoneNumber:{
    type:Number,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  role:{
    type:String,
    enum:['user','admin'],
    default:'user'
  },
  isBlocked:{
    type:Boolean,
    default:false
  },
})

const sampleUsers=mongoose.model('sampleUsers',userSchema)
module.exports=sampleUsers;