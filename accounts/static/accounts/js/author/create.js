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

function newPost(uid){
    const csrftoken = getCookie('csrftoken');
    console.log(csrftoken)
    formdata = {}
    var myDiv = document.getElementById("postTitle");
    formdata["title"] = myDiv.value
    var myDiv = document.getElementById("postSource");
    formdata["source"] = myDiv.value;
    var myDiv = document.getElementById("postOrigin");
    formdata["origin"] = myDiv.value;
    var myDiv = document.getElementById("postDesc");
    formdata["description"] = myDiv.value;
    var myDiv = document.getElementById("visibility");
    formdata["visibility"] = myDiv.value;
    var myDiv = document.getElementById("unlisted");
    formdata["unlisted"] = myDiv.checked;
    formdata["author"] = uid;
    formdata["content_type"] = "text/plain";
    fetch(
        uid+'posts/', {
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
        })
        .catch(error => {
            console.log("ERROR BOY")
        console.log(error)
        })  ;
}