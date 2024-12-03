const mongoose = require('mongoose')

const product = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category",
    required: true,
    trim: true,
    
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imageUrl: {
    type: [String],
    required: false,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isBlocked:{
    type:Boolean,
    default:false
  },
  rating:[{
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'sampleUsers',
      required:true
    },
    ratingValue:{
      type:Number,
      min:1,
      max:5,
      required:true
    },
    comment:{
      type:String,
      trim:true
    }
  }]
});


const productSchema = mongoose.model("productSchema",product)
module.exports = productSchema;
