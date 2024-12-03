const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'sampleUsers'
  },
  items:[{
    productId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'productSchema',
      required:true
    },
  }]
})

const Wishlist = mongoose.model('Wishlist',wishlistSchema);
module.exports = Wishlist