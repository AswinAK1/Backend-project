const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'sampleUsers',
    required:true
  },
  items:[{
    productId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'productSchema',
      required:true
    },
    quantity:{
      type:Number,
      required:true
    }
  }],
})

const Cart = mongoose.model('Cart',cartSchema);
module.exports = Cart;

