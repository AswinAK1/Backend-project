const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'sampleUsers',
    required:true
  },
  products:[{
    productId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'productSchema',
      required:true
    },
    productName:{
      type:String,
      required:true
    },
    price:{
      type:Number,
      required:true
    },
    imageUrl: {
      type: [String],
      required: false,
      trim: true
    },
    quantity:{
      type:Number,
      default:1,
      required:true
    },
    category: {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Category",
      required: true,
      trim: true,
    },
  }],
  totalPrice:{
    type:Number,
    required:true
  },
  address:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Address',
    required:true
  },
  paymentMethod:{
    type:String,
    enum:['COD','Net-Banking'],
    required:true,
  },
  orderStatus:{
    type:String,
    enum:['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default:'pending'
  },
  paymentReceived:{
    type:String,
    enum:['Paid','Pending'],
    default:'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
}
})



const Order = mongoose.model('Order',orderSchema);
module.exports = Order