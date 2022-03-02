function getPost(url, uid, author){
    if(uid==author){
        var myDiv = document.getElementById("eBtn");
        myDiv.style.display = "initial";
        var myDiv = document.getElementById("dBtn");
        myDiv.style.display = "initial";
    }
    let fetchRes = fetch(
        url);
                fetchRes.then(res =>
                    res.json()).then(response => {
                        console.log(response)
                        var myDiv = document.getElementById("title");
                        myDiv.innerHTML = response['title']
                        var myDiv = document.getElementById("desc");
                        myDiv.innerHTML = response['description'];
                        var myDiv = document.getElementById("vis");
                        myDiv.innerHTML = response['visibility'];                  
                        var myDiv = document.getElementById("lis");
                        myDiv.innerHTML = response['unlisted'];  
                        var myDiv = document.getElementById("source");
                        myDiv.innerHTML = response['source'];  
                        var myDiv = document.getElementById("origin");
                        myDiv.innerHTML = response['origin'];                      
                    })
}

function reset(formdata){
    var myDiv = document.getElementById("title");
    myDiv.style.visibility = "visible";
    myDiv.innerHTML = formdata['title']
    var myDiv = document.getElementById("newTitle");
    myDiv.style.display = "none";
    var myDiv = document.getElementById("desc");
    myDiv.style.visibility = "visible";
    myDiv.innerHTML = formdata['description']
    var myDiv = document.getElementById("newDesc");
    myDiv.style.display = "none";
    var myDiv = document.getElementById("vis");
    myDiv.style.visibility = "visible";
    myDiv.innerHTML = formdata['visibility']
    var myDiv = document.getElementById("newVis");
    myDiv.style.display = "none";
    var myDiv = document.getElementById("lis");
    myDiv.style.visibility = "visible";
    var myDiv = document.getElementById("newLis");
    myDiv.style.display = "none";
    var myDiv = document.getElementById("origin");
    myDiv.style.visibility = "visible";
    myDiv.innerHTML = formdata['origin']
    var myDiv = document.getElementById("newOrigin");
    myDiv.style.display = "none";
    var myDiv = document.getElementById("source");
    myDiv.style.visibility = "visible";
    myDiv.innerHTML = formdata['source']
    var myDiv = document.getElementById("newSource");
    myDiv.style.display = "none";
    var myDiv = document.getElementById("eBtn");
    myDiv.style.visibility = "visible";
    var myDiv = document.getElementById("sBtn");
    myDiv.style.display = "none";
}

function editPost(formdata){
    var myDiv = document.getElementById("title");
    var title = myDiv.innerText;
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("newTitle");
    myDiv.style.display = "initial";
    myDiv.setAttribute('value', title);
    var myDiv = document.getElementById("desc");
    var name = myDiv.innerText;
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("newDesc");
    myDiv.style.display = "initial";
    myDiv.setAttribute('value', name);
    var myDiv = document.getElementById("vis");
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("newVis");
    myDiv.style.display = "initial";
    var myDiv = document.getElementById("lis");
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("newLis");
    myDiv.style.display = "initial";
    var myDiv = document.getElementById("origin");
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("newOrigin");
    myDiv.style.display = "initial";
    var myDiv = document.getElementById("source");
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("newSource");
    myDiv.style.display = "initial";
    var myDiv = document.getElementById("eBtn");
    myDiv.style.visibility = "collapse";
    var myDiv = document.getElementById("sBtn");
    myDiv.style.display = "initial";
}

function postPost(url){
    const csrftoken = getCookie('csrftoken');
    formdata = {}
    var myDiv = document.getElementById("newTitle");
    formdata["title"] = myDiv.value
    var myDiv = document.getElementById("newSource");
    formdata["source"] = myDiv.value;
    var myDiv = document.getElementById("newOrigin");
    formdata["origin"] = myDiv.value;
    var myDiv = document.getElementById("newDesc");
    formdata["description"] = myDiv.value;
    var myDiv = document.getElementById("valVis");
    formdata["visibility"] = myDiv.value;
    var myDiv = document.getElementById("newLis");
    formdata["unlisted"] = myDiv.checked;
    fetch(
        url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(formdata)
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            reset(formdata);
        })
        .catch(error => {
            console.log("ERROR BOY")
            console.log(error)
        })  ;
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

function delPost(url){
    const csrftoken = getCookie('csrftoken');
    fetch(url,
        {method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        }})
        .then(console.log(res))
    }
