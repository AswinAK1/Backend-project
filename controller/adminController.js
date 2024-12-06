const productSchema = require('../models/products')
const userSchema = require('../models/user')
const Category = require('../models/category');
const Subcategory = require('../models/subCategory');
const Order = require('../models/order');




const logout = (req, res) => {

  res.clearCookie('accessToken');

  res.redirect('/user/login');
};




const createProduct = async(req,res)=>{
  const { productName,description,price,category,stock }=req.body
  const image = req.file ? req.file.path.replace(/\\/g,'/') : '';
  console.log(productName);
  // if(!image){
  //   return res.status(400).send({ message: 'Image upload failed' });
  // }
  // console.log(image);
  

try{
  const newProduct = await productSchema.create({
    productName,
    description,
    price,
    category,
    stock,
    imageUrl: image ? '/image/' + image.split('/').pop(): ''
  });

  res.redirect(`/admin/viewProduct/${newProduct._id}`);
}
catch (err){
  console.log(err);
  
  // res.status(400).send({message:'some error occur'})
}
}

const viewProduct = async(req,res)=>{
  try{
    const productId = req.params.id;

    const product = await productSchema.findById(productId).populate('category')

    res.render('admin/viewProduct',{product})
  }
  catch(err){
    console.log(err);
    
  }
}

const editProduct = async(req,res)=>{
  try{
    const productID=req.params.id
    const categories = await Category.find().populate('subcategories')
    // const categories = await Category.find()
    const product = await productSchema.findById(productID)
    res.render('admin/editProduct',{product,categories})
  }
  catch(error){
    console.log(error);
    res.status(400).send('no Product found')
  }
}

const updateProduct = async(req,res)=>{

  try{
    const productId = req.params.id
    const {productName,description,price,category,stock,imageUrl} =req.body

    const existProduct =await productSchema.findById(productId)
    if(!existProduct){
      res.status(400).send("product not exist")
    }
    const image = req.file?req.file.path.replace(/\\/g,'/'): existProduct.image

      const product = await productSchema.findByIdAndUpdate(productId,{
        productName,
          description,
          price,
          category,
          stock,
          imageUrl:imageUrl ? '/image/'+imageUrl.split('/').pop():imageUrl
      },{new:true})

      res.redirect(`/admin/update/${productId}`)
  }
  catch(err){
    console.log(err);
    
  }
}



const deleteProduct = async(req,res)=>{
  try{
    const productID = req.params.id;

    const products = await productSchema.findByIdAndDelete(productID)
    res.redirect('/admin/adminDash')
  }
  catch (err) {
    console.log(err);
    res.status(500).send("Error deleting the product");
  }
}

const updateSuccess = async(req,res)=>{
  try{
    const productID = req.params.id
    
    const product = await productSchema.findById(productID).populate('category')
    res.render('admin/update',{product})
  }
  catch(err){
    console.log(err);
    
  }
}

const blockProduct = async (req, res) => {
  try {
    const productID = req.params.id;
    const product = await productSchema.findById(productID);

    if (!product) {
      return res.status(404).send("Product not found");
    }


    product.isBlocked = !product.isBlocked;
    await product.save();

    const products = await productSchema.find();
    res.render('admin/adminDash', { products });
  } catch (err) {
    console.error("Error blocking product:", err);
    res.status(500).send("Internal Server Error");
  }
};

const blockedProductPage = async(req,res)=>{
  try{
    const productId = req.params.id
    const product = await productSchema.findById(productId)

    if(product){
      product.isBlocked = !product.isBlocked
      await product.save();
    }
    const products = await productSchema.find({isBlocked:true})
    res.redirect('/admin/adminDash',{products})
  }
  catch(err){
    console.log(err);
  }
}


const unblockedProduct = async (req, res) => {
  try {
    const products = await productSchema.find({ isBlocked: false });
    res.redirect('/admin/adminDash', { products });
  } catch (err) {
    console.error("Error fetching unblocked products:", err);
    res.status(500).send("Error loading unblocked products");
  }
};



const userManagement = async(req,res)=>{
  try{
    const users = await userSchema.find()
    res.render('admin/manageUser',{users})
  }
  catch(err){
    console.log(err);
    
  }
}


const blockUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userSchema.findById(userId);

    if (user) {
      user.isBlocked = !user.isBlocked;
      await user.save();
    }

    const users = await userSchema.find();
    res.render('admin/manageUser', { users });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error blocking/unblocking user");
  }
};

const blockedUsersPage = async(req,res)=>{
  try{
    const userId = req.params.id

    const user = await userSchema.findById(userId);

    if (user) {
      user.isBlocked = !user.isBlocked;
      await user.save();
    }

    const users = await userSchema.find({isBlocked:true})
    res.render('admin/blockedUsersPage',{users})
  }
  catch(err){
    console.log(err);
    res.status(500).send('Internal Server Error');
    
  }
}


const unblockedUser = async(req,res)=>{
  try{
    const users = await userSchema.find({isBlocked:false})
    res.render('admin/unblockedUser',{users})
  }
  catch(err){
    console.log(err);
    res.status(500).send('Internal Server Error');
  }

}


const getCategory = async(req,res)=>{
  try{
    const categories = await Category.find().populate('subcategories')
    console.log(categories);
    
    res.render('admin/category',{categories})
  }
  catch(err){
    console.log(err);
    res.status(400).send('Some error occur in category page')
  }

}

  const createCategory = async (req, res) => {
    try {
      const { name,description } = req.body;
  
      const newCategory = new Category({ name ,description});
      if(!name && !description){
        return res.send('Error occur in the name or description section')
      }
      await newCategory.save();
      res.redirect('/admin/category');
    } catch (err) {
      console.error('Error creating category:', err);
      res.status(500).send('Error creating category');
    }
  }



  const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    await Category.findByIdAndDelete(categoryId);
    res.redirect('/admin/category');
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting the category");
  }
};

  const editCategory = async(req,res)=>{
    try{
      const categoryId = req.params.id
      const category = await Category.findById(categoryId)
      // console.log(category);
      
      if(!category){
        return res.status(404).send('Category not found');
      }
      res.render('admin/editCategory',{category})

    }
    catch(err){
    console.log(err)
    res.status(400).send('no Product found')
    }
  }


  const updateCategory = async(req,res)=>{
    try{
      const categoryId = req.params.id

      const updateData ={
        name:req.body.name,
        description:req.body.description
      }

      const data =await Category.findByIdAndUpdate(categoryId,updateData,{new:true});

      res.redirect(`/admin/category`)

    }
    catch(err){
      console.log(err);
    res.status(500).send("Error updating the product");
    }
  }



const createSubcategory = async (req, res) => {
  try {
    const {name , category} =req.body
    const subCategory  =  new Subcategory({name ,category})
    await subCategory.save()

    await Category.findByIdAndUpdate(
      category,
      { $push: { subcategories: subCategory._id } },
      { new: true }
    );
    res.redirect('/admin/category')
    
  } catch (err) {
    console.error("Error in createSubcategory function:", err);
    res.status(500).send('An error occurred while saving the subcategory');
  }
};




const editSubcategory = async (req, res) => {
  try {
    const subcategoryId = req.params.id;
    
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      console.log("Subcategory not found");
      return res.status(404).send("Subcategory not found");
    }
    

    const categories = await Category.find();
    
    // console.log("Subcategory fetched:", subcategory);
    // console.log("Categories fetched:", categories);

    res.render("admin/editSubcategory", { subcategory, categories });
  } catch (err) {
    console.error("Error fetching subcategory data:", err);
    res.status(500).send("Error fetching subcategory data");
  }
};


const updateSubcategory = async (req, res) => {
  try {
    const subcategoryId = req.params.id;
    const updateData = {
      name: req.body.name,
      category: req.body.category,
    };

    const data = await Subcategory.findByIdAndUpdate(subcategoryId, updateData, { new: true });
    res.redirect('/admin/category');
  } catch (err) {
    console.log(err);
    res.status(500).send('Error updating subcategory');
  }
};



const deleteSubcategory = async (req, res) => {
  try {
    const deleteId = req.params.id;
    await Subcategory.findByIdAndDelete(deleteId);

    const categories = await Category.find().populate('subcategories');

    res.render('admin/category', { categories });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting the category");
  }
};


const updateOrder = async(req,res)=>{
  try {
    const orderId = req.params.id

    const updateData = {
      orderStatus:req.body.orderStatus,
      paymentReceived:req.body.paymentReceived
    }

    const order = await Order.findByIdAndUpdate(orderId,updateData ,{new:true})
    res.redirect('/admin/orderManagement')
  } catch (error) {
    console.log(error);
    
  }
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const viewDetails = async(req,res)=>{
  try {
    const productId = req.params.id
    
    const product = await productSchema
      .findById(productId)
      .populate('category')
      .populate('rating.userId', 'fullName');
    if(!product){
      res.status(400).send('Product not found')
    }
    res.render('admin/adminProductDetails', { product });
  } catch (error) {
    console.log(error);
    
  }
}


const deleteReview = async(req,res)=>{
  try {
    const reviewId = req.params.id;

    const product = await productSchema.findOne({"rating._id":reviewId})
    if(!product){
      res.status(400).send('Review not found')
    }
    product.rating = product.rating.filter(review => review._id.toString() !== reviewId)

    await product.save()

    res.redirect(`/admin/viewDetails/${product._id}`)

  } catch (error) {
    console.log(error);
  }
}

const fetchReportData = async (req, res) => {
  try {

    const topSellingPipeline = [
      { $unwind: "$products" },
      {
        $lookup: {
          from: "productschemas",
          localField: "products.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$products.productId",
          productName: { $first: "$productDetails.productName" },
          soldUnits: { $sum: "$products.quantity" },
          totalSales: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
        },
      },
      { $sort: { soldUnits: -1 } },
      { $limit: 5 },
    ];
    
    const topSellingProductsData = await Order.aggregate(topSellingPipeline);
    
    const topSellingProducts = topSellingProductsData.map((data) => ({
      name: data.productName,
      soldUnits: data.soldUnits,
      totalSales: data.totalSales,
    }));




    const monthlyIncomePipeline = [
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%B %Y", date: "$createdAt" } },
          },
          totalIncome: { $sum: "$totalPrice" },
        },
      },
      {
        $project: {
          month: "$_id.month",
          income: "$totalIncome",
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ];

    const monthlyIncomeData = await Order.aggregate(monthlyIncomePipeline);
    const profitGraphData = monthlyIncomeData.map((item) => ({
      month: item.month,
      profit: item.income * 0.2,
    }));

    res.render("admin/report", {
      topSellingProducts,
      monthlyIncome: monthlyIncomeData,
      profitGraphData,
    });
  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).render("admin/report", {
      topSellingProducts: [],
      monthlyIncome: [],
      profitGraphData: [],
      error: "Failed to load report data. Please try again later.",
    });
  }
};







module.exports={logout,createProduct,viewProduct,editProduct,updateProduct,deleteProduct,updateSuccess,blockProduct,blockedProductPage,unblockedProduct,userManagement,blockUser,blockedUsersPage,unblockedUser,getCategory,createCategory,deleteCategory,editCategory,updateCategory,createSubcategory,editSubcategory,updateSubcategory,deleteSubcategory,updateOrder,viewDetails,deleteReview,fetchReportData}