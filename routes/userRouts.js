const express=require('express');
const {loginUser,
  signupUsers,
  forgotPassword,
  enterOtp,
  changePassword,
  mainPage,
  mainPageFunction,
  addToCart,
  getCart,
  removeItem,
  getWishlist,
  viewWishlist,
  removeWishlist,
  filterData,
  productDetails,
  categoryList,
  reduceQuantity,
  addQuantity,
  addressForm,
  updateAddress,
  getCheckout,
  placeOrder,
  confirmOrder,
  orderDetails,
  getOrderSummary,
  cancelOrder,
  deleteOrder,
  addReview

  }=require('../controller/userController')
const router=express.Router()
const productSchema = require('../models/products')
const Category = require('../models/category')
const Cart = require('../models/cart')
const sampleUsers = require('../models/user');
const Address = require('../models/address');
const mongoose = require('mongoose')
const { authenticateUser } = require('../middleware/authenticateUser');
const Order = require('../models/order');
const { route } = require('./adminRoute');

router.get('/login',(req,res)=>{
  res.render('user/loginSignup/login',{err:""})
})
router.post('/login',async(req,res)=>{
  loginUser(req,res)
})

router.get('/signup',(req,res)=>{
  res.render('user/loginSignup/signup',{err:""})
})
router.post('/signup',async(req,res)=>{
  signupUsers(req,res)
})


router.get('/forgotPassword',(req,res)=>{
  res.render('user/loginSignup/forgotPassword')
})
router.post('/forgotPassword',async(req,res)=>{
  forgotPassword(req,res)
})


router.get('/enterOtp',(req,res)=>{
  res.render('user/loginSignup/enterOtp')
})
router.post('/enterOtp',async(req,res)=>{
  enterOtp(req,res)
})


router.get('/changePassword',(req,res)=>{
  res.render('user/loginSignup/changePassword',{err:''})
})
router.post('/changePassword',async(req,res)=>{
  changePassword(req,res)
})


////////////////////////////////////////////////////////////////////////////////////////


router.get('/mainPage',mainPage)

router.post('/mainPage',mainPageFunction)

router.get('/shop',async(req,res)=>{
  const products = await productSchema.find()
  const categories = await Category.find()
  res.render('user/shop',{products,categories,cartItems:[]})
})


router.get('/cart',getCart)
router.post('/addToCart/:id',addToCart)

router.post('/cart/remove/:id',removeItem)

router.get('/wishlist',getWishlist)

router.post('/viewWishlist/:id',viewWishlist)

router.post('/wishlist/remove/:id',removeWishlist)

router.get('/filter',filterData)

router.get('/productDetails/:id',productDetails)

router.get('/category/:id',categoryList)

router.post('/cart/reduce/:id',reduceQuantity)

router.post('/cart/add/:id',addQuantity)


///////////////////////////////////////////////////////////////////


router.get('/addressForm/:id',(req,res)=>{
  const productId = req.params.id
  const country = Address.find()
  res.render('user/addressForm',{productId,country})
})

router.post('/addressForm',addressForm)

router.get('/editAddress/:id', async (req, res) => {
  try {
      const addressId = req.params.id;
      
      const address = await Address.findById(addressId);
      if (!address) {
          return res.status(404).send('Address not found');
      }

      res.render('user/changeAddress', { address ,addressId , country:address.country});
  } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
  }
});



router.post('/updateAddress/:id',updateAddress)

router.get('/checkout',getCheckout)

router.post('/placeOrder',placeOrder)

router.get('/confirmOrder', confirmOrder)


router.get('/orderDetails/:id',orderDetails)

router.get('/orderSummary',getOrderSummary)

router.post('/cancelOrder/:id',cancelOrder)

router.post('/deleteOrder/:id',deleteOrder)


///////////////////////////////////////////////////////////////////////////////////////

router.post('/addReview',addReview)


module.exports=router;