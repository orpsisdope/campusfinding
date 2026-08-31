const jwt=require("jsonwebtoken");


function authenticate(req,res,next){

const token =
req.headers.authorization;


if(!token){

return res.status(401).json({
message:"Login required"
});

}


try{

const decoded =
jwt.verify(
token.replace("Bearer ",""),
process.env.JWT_SECRET
);


req.user=decoded;

next();


}catch(error){

res.status(401).json({
message:"Invalid token"
});

}

}


module.exports=authenticate;