function getProfile(uid){
    let fetchRes = fetch(
        uid);
                fetchRes.then(res =>
                    res.json()).then(response => {
                        console.log(response)
                        var myDiv = document.getElementById("dname");
                        myDiv.innerHTML = response['display_name']
                        var myDiv = document.getElementById("did");
                        myDiv.innerHTML = response['id'];
                        var myDiv = document.getElementById("durl");
                        myDiv.innerHTML = response['url'];                  
                        var myDiv = document.getElementById("dgh");
                        myDiv.innerHTML = response['github'];                      
                    })
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function postProfile(uid){
    const csrftoken = getCookie('csrftoken');
    console.log(csrftoken)
    var myDiv = document.getElementById("newname");
    var name = myDiv.value
    var myDiv = document.getElementById("newgh");
    var gh = myDiv.value
    let fetchRes = fetch(
        uid, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({
                display_name: name,
                github: gh
            })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data)
        })
        .catch(error => {
        console.log(error)
        })  ;
    edited();
}

function edited(){
    var myDiv = document.getElementById("newname");
    var name = myDiv.value
    myDiv.style.display = "none";
    var myDiv = document.getElementById("newgh");
    var gh = myDiv.value
    myDiv.style.display = "none";
    var myDiv = document.getElementById("dname");
    myDiv.innerHTML = name;
    myDiv.style.visibility = "visible";
    var myDiv = document.getElementById("dgh");
    myDiv.innerHTML = gh;
    myDiv.style.visibility = "visible";
    var myDiv = document.getElementById("eBtn");
    myDiv.style.visibility = "visible";
    var myDiv = document.getElementById("sBtn");
    myDiv.style.display = "none";
}

function editProfile(){
    var myDiv = document.getElementById("dname");
    var name = myDiv.innerText;
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("newname");
    myDiv.style.display = "initial";
    myDiv.setAttribute('value', name);
    var myDiv = document.getElementById("dgh");
    var gh = myDiv.innerText;
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("newgh");
    myDiv.style.display = "initial";
    myDiv.setAttribute('value', gh);
    var myDiv = document.getElementById("eBtn");
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("sBtn");
    myDiv.style.display = "initial";
}