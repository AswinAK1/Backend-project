const mongoose = require('mongoose')

const addressFormSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'sampleUsers',
    require:true
  },
  fullName:{
    type:String,
    required:true,
    trim:true
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{10,15}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`,
    },
  },
  addressLine: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pinCode: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{5,10}$/.test(v); // Validate postal code (5-10 digits)
      },
      message: props => `${props.value} is not a valid postal code!`,
    },
  },
  country: {
    type: String,
    required: true,
    default: 'India',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Address = mongoose.model('Address',addressFormSchema)
module.exports = Address