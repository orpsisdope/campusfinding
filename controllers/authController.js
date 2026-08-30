const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.signup = async(req,res)=>{

const {username,email,password}=req.body;


const hashedPassword =
await bcrypt.hash(password,10);


try{

const result = await pool.query(
`
INSERT INTO users(username,email,password)
VALUES($1,$2,$3)
RETURNING id,username,email
`,
[
username,
email,
hashedPassword
]
);


res.json(result.rows[0]);


}catch(error){

res.status(500).json({
message:"Signup failed"
});

}

};



exports.login = async(req,res)=>{

const {email,password}=req.body;


const result =
await pool.query(
"SELECT * FROM users WHERE email=$1",
[email]
);


if(result.rows.length===0){

return res.status(401).json({
message:"Wrong email or password"
});

}


const user=result.rows[0];


const valid =
await bcrypt.compare(
password,
user.password
);


if(!valid){

return res.status(401).json({
message:"Wrong email or password"
});

}


const token =
jwt.sign(
{
id:user.id,
username:user.username
},
process.env.JWT_SECRET
);


res.json({
token,
username:user.username
});


};