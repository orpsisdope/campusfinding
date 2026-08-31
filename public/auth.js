async function signup(){

const response =
await fetch("/api/auth/signup",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

username:
username.value,

email:
email.value,

password:
password.value

})

});


alert("Account created");

}



async function login(){


const response =
await fetch("/api/auth/login",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

email:
email.value,

password:
password.value

})

});


const data =
await response.json();
console.log(data);

localStorage.setItem(
"token",
data.token
);


localStorage.setItem(
"username",
data.username
);


window.location="index.html";


}