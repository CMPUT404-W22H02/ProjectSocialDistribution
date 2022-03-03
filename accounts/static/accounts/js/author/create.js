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
    console.log(uid)
    host=uid.split("authors")[0]
    console.log(host)

    const all_node = []
    let fetchCom = fetch(host+"authors/");
    fetchCom.then(res =>
        res.json()).then(response => {
        for(let i=0; i< response.items.length; i++){
            node=response.items[i]['id']
            all_node.push(node)
            
        }                  
    })
    .then(function(){
        console.log("all authors",all_node)
        if (formdata.unlisted===false){
            if(formdata.visibility === "PUBLIC"){
                for(let node of all_node){
                    authorID = node.split("/authors/")[1].slice(0,-1)
                    var urlToPostInboxItem = host +"authors/" + authorID +'/inbox';
                    console.log("url", urlToPostInboxItem)
                    fetch(urlToPostInboxItem,{
                        method: 'POST',
                        headers: {
                        'Content-Type' : 'application/json',
                        'X-CSRFToken' : "{{ csrf_token }}"
                        },
                        body: formdata 
                    })
                    console.log(formdata)
                
                    
                    }

                }

            }else{
                //do it when post is priavte
                console.log("private")
            }

        
    })
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
            console.log("data")
            console.log(data);

            postID = data["id"]
            authorID = data["author"]
            postID = postID.split(authorID)[1]
            postID = postID.split("posts/")[1]
            host = authorID.split("authors")[0]
            service = host.split("://")[1]
            authorID = authorID.split("/authors/")[1].slice(0,-1)
            window.location = host+"post/"+data["id"] 

        })
        
        .catch(error => {
            console.log("ERROR BOY")
        console.log(error)
        })  ;
}