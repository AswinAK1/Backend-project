const nodemailer=require('nodemailer');

function getRandomNumber(){
  const randomNumber= Math.floor(Math.random()*9999);
  return randomNumber;
}
async function generateOtp(email){

  const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: process.env.USERS_EMAIL,
      pass: process.env.USERS_PASSWORD
    },
  });
  
  const otp=getRandomNumber()
  
  const mailOptions={
    from: 'aswinak50561@gmail.com',
    to: email,
    subject:`Your OTP is ${otp}`,
    text:'OTP'
  }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log('Error sending email:', error);
      }
  });
    return otp;
  }


module.exports=generateOtp;