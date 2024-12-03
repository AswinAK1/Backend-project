const express = require('express')
const { logout,createProduct,viewProduct,editProduct,deleteProduct,updateSuccess,updateProduct,blockProduct,blockedProductPage,unblockedProduct,userManagement,blockUser,blockedUsersPage,unblockedUser,getCategory,createCategory,deleteCategory,updateCategory,editCategory,createSubcategory,editSubcategory,updateSubcategory,deleteSubcategory,updateOrder,viewDetails,deleteReview} = require('../controller/adminController')
const multer = require('multer')
const router = express.Router()
const productSchema = require('../models/products')
const Subcategory = require('../models/subCategory')
const Category = require('../models/category')
const Order = require('../models/order')


// Logout Route in your Express application
router.get('/logout',logout)


router.get('/adminDash', async (req, res) => {
  try {
    const products = await productSchema.find();
    res.render('admin/adminDash', { products });
  } catch (err) {
    console.error("Error fetching products for adminDash:", err);
    res.status(500).send("Error loading the dashboard");
  }
});




router.get('/createProduct', async (req, res) => {
  try {
    // Fetch categories with their related subcategories
    const categories = await Category.find().populate('subcategories');
    
    // Render createProduct page with the categories and subcategories data
    res.render('admin/createProduct', { categories });
  } catch (err) {
    console.error("Error fetching categories for createProduct:", err);
    res.status(500).send("Error loading categories");
  }
});


router.post('/createProduct',createProduct)

router.get('/viewProduct/:id',viewProduct)


// view all the product in a all product page

router.get('/allProduct', async (req, res) => {
  try {
    const products = await productSchema.find();
    res.render('admin/allProduct', { products });
  } catch (err) {
    console.error("Error fetching products for adminDash:", err);
    res.status(500).send("Error loading the dashboard");
  }
});




router.get('/successCreation',(req,res)=>{
  res.render('admin/successCreation')
})

router.get('/editProduct/:id',editProduct)

router.post('/updateProduct/:id',async(req,res)=>{
  updateProduct(req,res)
})

router.get('/update/:id',updateSuccess)

router.post('/delete/:id',deleteProduct)

router.post('/block/:id',blockProduct)

router.get('/blockedProduct',blockedProductPage)

router.post('/blockedProduct',blockedProductPage)

router.get('/unblockedProduct',unblockedProduct)

router.post('/unblockedProduct/:id',unblockedProduct)

router.get('/manageUser',userManagement)

router.post('/blockUser/:id',blockUser)

router.get('/blockedUsersPage',blockedUsersPage)

router.post('/blockedUsersPage/:id',blockedUsersPage)

router.get('/unblockedUser',unblockedUser)

router.post('/unblockedUser/:id',unblockedUser)
router.get('/category',getCategory)


router.get('/createCategory',(req,res)=>{
  res.render('admin/createCategory')
})

router.post('/createCategory',createCategory)

router.get('/editCategory/:id',editCategory)

router.post('/updateCategory/:id',updateCategory)

router.post('/deleteCategory/:id',deleteCategory)


router.get('/addSubcategory',async(req,res)=>{
  try{
    const categories = await Category.find()
    res.render('admin/addSubcategory',{categories})

  }
  catch(err){
    console.log(err);
    
  }
})

router.post('/addSubcategory',createSubcategory)


router.get('/editSubcategory/:id', editSubcategory);

router.post('/updateSubcategory/:id',updateSubcategory)

router.post('/deleteSubcategory/:id',deleteSubcategory)

router.get('/orderManagement', async (req, res) => {
  try {
    const { orderStatus, paymentMethod, category: selectedCategory } = req.query;

    const filter = {};

    if (orderStatus && orderStatus !== '') {
      filter.orderStatus = orderStatus;
    }
    if (paymentMethod && paymentMethod !== '') {
      filter.paymentMethod = paymentMethod;
    }
    if (selectedCategory && selectedCategory !== '') {
      filter['products.category'] = selectedCategory;
    }

    const categories = await Category.find();

    const orders = await Order.find(filter)
      .populate('userId', 'fullName')
      .populate({
        path: 'products.productId',
        populate: {
          path: 'category',
          model: 'Category',
          select: 'name',
        },
      })
      .populate('address');

    res.render('admin/orderManagement', {
      orders,
      orderStatus,
      paymentMethod,
      categories,
      selectedCategory: selectedCategory || '',
    });
  } catch (error) {
    console.error('Error fetching order data:', error);
    res.status(500).send('Internal Server Error');
  }
});





router.get('/editOrder/:id',async(req,res)=>{
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('userId', 'fullName')
    if(!order){
      res.status(400).send('Order not found')
    }
    res.render('admin/editingOrder',{order})
  } catch (error) {
    console.log(error);
  }

})

router.post('/updateOrder/:id',updateOrder)

router.get('/orderDetailsAdmin/:id',async(req,res)=>{
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId)
    .populate({
      path: 'products.productId',
      populate: {
        path: 'category',
        select: 'name',
      },
    })
    .populate('userId', 'fullName')
    .populate('address');

    if(!order){
      res.status(400).send('Order not found');
    }
    res.render('admin/orderDetailsAdmin',{order})

  } catch (error) {
    console.log(error);
  }
})


//////////////////////////////////////////////////////////////////////////////////////////////

router.get('/viewDetails/:id',viewDetails)

router.post('/deleteReview/:id',deleteReview)

module.exports=router