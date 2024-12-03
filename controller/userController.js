const sampleUsers=require('../models/user')
const bcrypt=require('bcrypt')
const nodemailer=require('nodemailer')
const generateOtp = require('../middleware/otpSend')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const productSchema = require('../models/products')
const Cart = require('../models/cart')
const Wishlist = require('../models/wishlist')
const Category = require('../models/category');
const Address = require('../models/address')
const Order = require('../models/order')
const paypal = require('../middleware/paypal')





const signupUsers=async(req,res)=>{
  const {fullName,email,phoneNumber,password}=req.body

  try{

    const hashedPassword=await bcrypt.hash(password,10);

    const newUser=new sampleUsers({
      fullName,
      email,
      phoneNumber,
      password:hashedPassword
    })
    console.log(req.body)
    const savedUser=await newUser.save()
    res.status(201).send(savedUser)
    console.log(savedUser);

  }
  catch(error){
    console.error(error)
    res.status(400).send({message:"Failed to create user"})
  }
}




const loginUser=async(req,res)=>{
  const {email,password}=req.body;

  try{
    const user=await sampleUsers.findOne({email})
    if(!user){
      res.status(401).render('user/loginSignup/login',{err:'Invalid Email'})
      return;
    }
    const match=await bcrypt.compare(password,user.password)
    if(!match){
      res.status(401).render('user/loginSignup/login',{err:'Invalid Password'})
      return;
    }
    const token = jwt.sign({userToken:user},process.env.JWT_SECRET_KEY,{expiresIn:'1d'})
    res.cookie('userToken',token)
    if(!(user.role=='user')){
    res.redirect('/admin/adminDash')
    return;
    }
    else{
    res.redirect('/user/mainPage')
    }
  }
  catch(err){
    console.log(err);
    // res.status(400).send({message:"Failed to login user"})
  }
}



const forgotPassword=async(req,res)=>{
  const {email} = req.body

  try{
    const user=await sampleUsers.findOne({email})
    if(!user){
      res.status(401).send({message:'Enter a valid Email'})
      return;
    }
    
    const otp=await generateOtp(email)
    const token = jwt.sign({otpToken:otp},process.env.JWT_SECRET_KEY,{expiresIn:'10m'})
    res.cookie('otpToken',token).render('user/loginSignup/enterOtp')
  }
  catch(err){
    console.log(err);
    res.status(400).send("Failed to send forgot password link")
  }
}


const enterOtp=async(req,res)=>{
  const {user_otp}=req.body
  const otpToken=req.cookies.otpToken
  try{
    const decoded=jwt.verify(otpToken,process.env.JWT_SECRET_KEY)
    console.log(decoded.otpToken)
    console.log(user_otp)
    if(decoded.otpToken==user_otp){
    return res.render('user/loginSignup/changePassword')
    }
    else{
      return res.status(401).send({message:"Invalid OTP"})
      }
    }
catch(err){
  res.status(400).send({message:'Invalid OTP'})
  }
}



const changePassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { email } = req.cookies;

  try {
    if (newPassword !== confirmPassword) {
      return res.status(401).send({err:'Enter same password'});

    }
    const user = await sampleUsers.findOne({ email });
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await sampleUsers.updateOne({ email }, { password: hashedPassword });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(400).render('user/loginSignup/changePassword', { err: 'Failed to change password' });
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const mainPage = async (req, res) => {
  try {
    const products = await productSchema.find({ isBlocked: false });
    const categories = await Category.find();

    let totalProducts = 0;
    let totalWishlistProduct = 0;
    let user = null; // Initialize a variable to hold the logged-in user's info

    const userToken = req.cookies.userToken;
    if (userToken) {
      const decode = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
      const userId = decode.userToken._id;

      user = await sampleUsers.findById(userId); // Fetch the logged-in user's details

      const cart = await Cart.findOne({ userId });
      if (cart) {
        totalProducts = cart.items.length;
      }

      const wishlist = await Wishlist.findOne({ userId });
      if (wishlist) {
        totalWishlistProduct = wishlist.items.length;
      }
    }

    res.render('user/mainPage', { 
      products, 
      categories, 
      totalProducts, 
      totalWishlistProduct, 
      user
    });
  } catch (err) {
    console.log(err);
    res.render('error', { message: 'Something went wrong' });
  }
};




const mainPageFunction = async (req, res) => {
  try {
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    // const wishlist = await Wishlist.findOne({userId}).populate('items.productId')

    const totalProducts = cart ? cart.items.length : 0;
    // const totalWishlistProduct = wishlist ? wishlist.items.length : 0;

    const products = await productSchema.find({ isBlocked: false });
    const categories = await Category.find();

    res.render('user/mainPage', { products, categories, cartItems: cart ? cart.items : [], totalProducts  });
  } catch (err) {
    console.log(err);
    res.render('error', { message: 'Something went wrong' });
  }
};




const addToCart = async (req, res) => {
  try {
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id;
    const productId = req.params.id;
    const newQuantity = req.body.quantity || 1;

    if (!userId) {
      return res.status(404).send({ message: 'User not found' });
    }

    const product = await productSchema.findById(productId);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity: newQuantity }] });
      await cart.save();
    } else {
      const existingProductIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (existingProductIndex !== -1) {
        cart.items[existingProductIndex].quantity += newQuantity;
      } else {
        cart.items.push({ productId, quantity: newQuantity });
      }
      await cart.save();
    }

    const updatedCart = await Cart.findOne({ userId }).populate('items.productId');


    const validItems = updatedCart.items.filter((item) => item.productId);

    const totalPrice = validItems.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    const productTotalPrice = product.price * newQuantity;

    res.json({
      newQuantity,
      productPrice: product.price,
      productTotalPrice,
      totalPrice,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error adding to cart' });
  }
};






const getCart = async (req, res) => {
  try {
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id;

    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      populate: { path: 'category', select: '_id name' },
    });
    

    if (!cart || cart.items.length === 0) {
      return res.render('user/cart', { cart: [], totalPrice: 0, totalItems: 0 });
    }

    const validItems = cart.items.filter((item) => item.productId);

    const cartItems = validItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      productTotalPrice: item.productId.price * item.quantity,
    }));

    const totalPrice = cartItems.reduce((sum, item) => sum + item.productTotalPrice, 0);
    const totalItems = cartItems.length;

    res.render('user/cart', { cart: cartItems, totalPrice, totalItems });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: 'Error fetching cart' });
  }
};



const removeItem = async(req,res)=>{
  try{
    const productId = req.params.id
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id;

    const cart = await Cart.findOne({userId})
    if(!cart){
      return res.status(404).send({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();


    res.redirect('/user/cart')

  }
  catch(err){
    console.log(err)
  }
}


const getWishlist = async(req,res)=>{
  try {
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id;
    const product = await productSchema.find()
    const wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
    res.render('user/wishlist', { wishlist: wishlist ? wishlist.items : [] , product});
} catch (err) {
    console.error(err);
    res.status(500).send('An error occurred.');
}
}




const viewWishlist = async(req,res)=>{
  try{
    const productId = req.params.id;
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken,process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id;
    
    if(!productId){
      res.status(400).json('productId is required')
    }
    let wishlist = await Wishlist.findOne({userId})
    if(!wishlist){
      wishlist = new Wishlist({userId,items:[]})
    }
    
    const existingProduct = wishlist.items.some(item => item.productId.toString()===productId)

    if(existingProduct){
      return res.status(400).json({ message: "Product already in wishlist" });
    }
    
    wishlist.items.push({productId})
    await wishlist.save()

    res.status(200).json({ message: "Product added to wishlist"});
  }
  catch(err){
    console.log(err);
    res.status(500).json({ message: "An error occurred while adding the product to the wishlist" });
  }

}


const removeWishlist = async(req,res)=>{
  try{
    const productId = req.params.id;
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken,process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id;

    const wishlist = await Wishlist.findOne({userId});
    if(!wishlist){
      return res.status(400).json({message:'wishlist not fount'})
    }

    wishlist.items = wishlist.items.filter(item => item.productId.toString() !== productId);
    await wishlist.save()
    res.redirect('/user/wishlist')
  }
  catch(err){
    console.log(err);
    
  }
}

const productDetails = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await productSchema
      .findById(productId)
      .populate('category')
      .populate('rating.userId', 'fullName');

    if (!product) {
      return res.status(400).send('Product not found');
    }

    res.render('user/productDetails', { product });
  } catch (err) {
    console.log(err);
  }
};



const filterData = async(req,res)=>{
  try{
    
    const { category, minPrice, maxPrice } = req.query;

    let filter = {};
    if (category) filter.category = category;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    console.log("Filter:", filter);
    const products = await productSchema.find(filter);
    const categories = await Category.find()

    res.render('user/shop', { products, categories });
  }
  catch(err){
    console.log(err);
    
  }
}


const categoryList = async(req,res)=>{
  try{
    const categoryId = req.params.id;
    const products = await productSchema.find({category : categoryId})
    const categories = await Category.find();

    res.render('user/mainPage',{products , categories})
  }
  catch(err){
    console.log(err);
  }


}


const reduceQuantity = async(req,res)=>{
  try{
    const productId = req.params.id;
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken,process.env.JWT_SECRET_KEY);
    const userId = decode.userToken

    const userCart = await Cart.findOne({userId})
    const item = userCart.items.find(item => item.productId.toString() === productId)

    if(item && item.quantity>1){
      item.quantity -= 1;
      item.productTotalPrice = item.productPrice * item.quantity

    await userCart.save()
    res.redirect('/user/cart')
    }else{
    res.redirect('/user/cart')
    }
  }
  catch(err){
    console.log(err);
    
  }
}

const addQuantity = async (req,res) =>{
  try{
    const productId = req.params.id;
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken , process.env.JWT_SECRET_KEY);
    const userId = decode.userToken

    const userCart = await Cart.findOne({userId})
    const item = userCart.items.find(item => item.productId.toString() === productId)

    if(item){
      item.quantity += 1
      item.productTotalPrice = item.productPrice * item.quantity

      await userCart.save()
      res.redirect('/user/cart')
    }
    else {
      res.redirect('/user/cart')
    }
  }
  catch(err){
    console.log(err)
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const addressForm = async (req, res) => {
  try {
      const { fullName, phoneNumber, addressLine, city, state, pinCode, country } = req.body;

      if (!fullName || !phoneNumber || !addressLine || !city || !state || !pinCode || !country) {
          return res.status(400).send('All fields are required!');
      }

      const userToken = req.cookies.userToken;
      const decode = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
      const userId = decode.userToken._id;

      const newAddress = new Address({
          fullName,
          phoneNumber,
          addressLine,
          city,
          state,
          pinCode,
          country,
          userId,
      });

      await newAddress.save();
      res.redirect(`/user/checkout?productId=${req.params.id}`);

      
  } catch (err) {
      console.error(err);
      res.status(500).send('Error saving address');
  }
};




const updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    const { fullName, phoneNumber, addressLine, city, state, pinCode, country } = req.body;


    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      { fullName, phoneNumber, addressLine, city, state, pinCode, country },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).send('Address not found');
    }

    res.redirect('/user/checkout');
  } catch (err) {
    console.error('Error updating address:', err);
    res.status(500).send('Internal Server Error');
  }
};



const getCheckout = async (req, res) => {
  try {
    const userToken = req.cookies.userToken;
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    const userId = decoded.userToken._id;

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    const products = cart?.items || [];
    
    const totalPrice = products.reduce((sum, item) => {
      return sum + (item.productId?.price || 0) * (item.quantity || 0);
    }, 0);

    // console.log('Data passed to EJS:', { products, totalPrice });
    const address = await Address.findOne({ userId });

    res.render('user/checkout', {
      products,
      totalPrice,
      address,
      productId: req.query.productId || null,
      error: null,
    });
  } catch (error) {
    console.error('Error in getCheckout:', error.message);
    res.status(500).send('Internal Server Error');
  }
};




const placeOrder = async (req, res) => {
  try {
    const userToken = req.cookies.userToken;
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    const userId = decoded.userToken._id;

    const { paymentMethod } = req.body;

    if (!paymentMethod || !['COD', 'Net-Banking'].includes(paymentMethod)) {
      return res.status(400).send("Please select a valid payment method.");
    }

    const address = await Address.findOne({ userId });
    if (!address) {
      return res.status(400).send("Please provide a valid address.");
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      populate: { path: 'category', select: 'name' }, // Populate category
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).send("Cart is empty.");
    }

    const products = cart.items.map((item) => {
      if (
        !item.productId ||
        !item.productId.productName ||
        !item.productId.price ||
        !item.productId.category
      ) {
        console.error("Invalid item:", item);
        throw new Error("Invalid product details in cart.");
      }
      return {
        productId: item.productId._id,
        productName: item.productId.productName,
        price: item.productId.price,
        quantity: item.quantity,
        category: item.productId.category._id, // Use ObjectId here
      };
    });
    
    const totalPrice = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (paymentMethod === 'Net-Banking') {
      const createPaymentJson = {
        intent: "sale",
        payer: { payment_method: "paypal" },
        redirect_urls: {
          return_url: `http://localhost:3000/user/confirmOrder`,
          cancel_url: "http://localhost:3000/user/cancel",
        },
        transactions: [
          {
            amount: { currency: "USD", total: totalPrice.toFixed(2) },
            description: "Order payment description",
            item_list: {
              items: products.map((item) => ({
                name: item.productName,
                sku: item.productId.toString(),
                price: item.price.toFixed(2),
                currency: "USD",
                quantity: item.quantity,
              })),
            },
          },
        ],
      };

      paypal.payment.create(createPaymentJson, async (error, payment) => {
        if (error) {
          console.error("PayPal Payment Error:", error);
          return res.status(500).send("Error processing PayPal payment.");
        }

        const approvalUrl = payment.links.find((link) => link.rel === "approval_url");
        if (approvalUrl) {
          const newOrder = new Order({
            userId,
            products,
            totalPrice,
            address: address._id,
            paymentMethod,
            orderStatus: 'Pending',
          });
          await newOrder.save();
          return res.redirect(approvalUrl.href);
        } else {
          return res.status(500).send("No approval URL found.");
        }
      });
    } else if (paymentMethod === 'COD') {
      const newOrder = new Order({
        userId,
        products,
        totalPrice,
        address: address._id,
        paymentMethod,
        orderStatus: 'Pending',
      });

      await newOrder.save();
      await Cart.updateOne({ userId }, { $set: { items: [] } });

      return res.redirect(`/user/confirmOrder?orderId=${newOrder._id}`);
    }
  } catch (err) {
    console.error("Error placing order:", err.message);
    res.status(500).send("Internal server error.");
  }
};





const confirmOrder = async(req,res)=>{
  try {
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken,process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id

      const order = await Order.findOne({ userId }).sort({ createdAt: -1 });

      if (!order) {
          return res.status(404).send('No recent orders found.');
      }

      res.render('user/confirmOrder', { orderId: order._id });
  } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).send('Server Error');
  }
}


const orderDetails = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).send('Order ID is required.');
    }

    const order = await Order.findById(orderId)
      .populate({
        path: 'products.productId',
        populate: {
          path: 'category',
          select: 'name',
        },
      })
      .populate('address');

    if (!order) {
      return res.render('user/orderDetails', { order: null });
    }

    res.render('user/orderDetails', { order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).send('Server Error');
  }
};





const getOrderSummary = async (req, res) => {
  try {
    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id;

    const orders = await Order.find({ userId })
      .populate('products.productId')
      .populate('address');

    // console.log('Orders fetched:', orders);

    if (!orders) {
      return res.render('user/orderDetails', { orders: null });
    }

    res.render('user/orderSummary', { orders });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};



const cancelOrder = async(req,res)=>{
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId).populate('products.productId')

    if(!order){
      res.status(400).send('Order not found')
    }
    if(order.orderStatus !== 'Pending'){
      res.status(400).send('Only pending order can be cancelled')
    }

    order.orderStatus = 'Cancelled';
    await order.save()
    res.redirect('/user/orderSummary')

  } catch (error) {
    console.log(error);
  }
}


const deleteOrder = async(req,res)=>{
  try {
    const orderId = req.params.id;

    const order = await Order.findByIdAndDelete(orderId)
    res.redirect('/user/orderSummary')

  } catch (error) {
    console.log(error);
    
  }
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const addReview = async (req,res)=>{
  try {

    const userToken = req.cookies.userToken;
    const decode = jwt.verify(userToken,process.env.JWT_SECRET_KEY);
    const userId = decode.userToken._id;

    const {productId , ratingValue , comment} = req.body

    const product = await productSchema.findById(productId)
    if(!product){
      res.status(400).send('product not found')
    }

    const existingReview = product.rating.find((review)=> review.userId.toString() === userId.toString());
    if(existingReview){
      res.status(400).send('Already review the product')
    }
    
    product.rating.push({
      userId,
      ratingValue,
      comment
    })
    await product.save()

    res.redirect(`/user/productDetails/${productId}`)

  } catch (error) {
    console.log(error);
    
  }

}









module.exports = { signupUsers,loginUser,forgotPassword,enterOtp,changePassword,mainPage,mainPageFunction,addToCart,getCart,removeItem,getWishlist,viewWishlist,removeWishlist,filterData,productDetails,categoryList,reduceQuantity,addQuantity,addressForm,updateAddress,getCheckout,placeOrder,confirmOrder,orderDetails,getOrderSummary,cancelOrder,deleteOrder,addReview}