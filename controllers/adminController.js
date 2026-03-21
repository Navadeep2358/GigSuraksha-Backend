const db = require("../config/db");
const bcrypt = require("bcrypt");
const generateOTP = require("../utils/otpGenerator");
const sendEmailOTP = require("../services/emailService");

/*
=============================
ADMIN LOGIN
=============================
*/

exports.adminLogin = (req,res)=>{

const {adminId,password} = req.body;

db.query(
"SELECT * FROM admins WHERE admin_id=?",
[adminId],
async (err,result)=>{

if(err){
console.log(err);
return res.status(500).json({message:"Database error"});
}

if(result.length === 0){
return res.json({message:"Invalid Admin ID"});
}

const admin = result[0];

const match = await bcrypt.compare(password,admin.password_hash);

if(!match){
return res.json({message:"Wrong password"});
}

const otp = generateOTP();

/* Save OTP in session */

req.session.adminOTP = otp;
req.session.adminID = admin.id;

console.log("ADMIN OTP:",otp);

/* 🔥 FIXED EMAIL HANDLING */

try {
  await sendEmailOTP(admin.email, otp, "ADMIN_LOGIN");
} catch (error) {
  console.log("Email failed but continuing:", error.message);
}

return res.json({
  message:"Admin OTP sent",
  role:"admin"
});

});

};


/*
=============================
VERIFY ADMIN OTP
=============================
*/

exports.verifyAdminOTP = (req,res)=>{

const {otp} = req.body;

if(!req.session.adminOTP){
return res.json({
message:"Session expired. Login again."
});
}

if(otp == req.session.adminOTP){

req.session.isAdmin = true;

delete req.session.adminOTP;

return res.json({
message:"Admin login successful"
});

}

res.json({
message:"Invalid OTP"
});

};


/*
=============================
ADMIN LOGOUT
=============================
*/

exports.adminLogout = (req,res)=>{

req.session.destroy(()=>{
res.json({
message:"Admin logged out"
});
});

};