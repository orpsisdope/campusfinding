async function login(){

    const response = await fetch("/api/auth/login", {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            email: document.getElementById("email").value,

            password: document.getElementById("password").value

        })

    });


    const data = await response.json();


    if(!response.ok){

        alert(data.message);
        return;

    }


    if(!data.token || !data.username){

        alert("Login response is missing token or username");
        console.log(data);
        return;

    }


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