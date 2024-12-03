const mongoose=require('mongoose')

async function connectDB(){
  try{
    await mongoose.connect(process.env.DATABASE)
    console.log('Connected to DB');
  }
  catch{
    console.log('some error occur in the DB connection');
  }
}

module.exports=connectDB