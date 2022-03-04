function getInbox(uid){
    fetch(
        uid+"inbox"
    )
        .then(res => res.json())
        .then(data => {
            for(i in data["items"]){
                item = data["items"][i]
                document.getElementById("inboxList").innerHTML += '<li>' + "<a href=/post/" + item["id"] + ">" + "Title - " + item["title"] + "</a> <br> Description - "+item["description"]+"<br>Author - "+item["author"]+"<br><br>"//Post - " + newCom["comment"] + '<br>' + "Author - " + newCom["author"]["display_name"] + '</li>';
            }
        }
    )}

function delete_all(template_items){
    const csrftoken = getCookie('csrftoken');
    fetch(template_items,
        {method: 'DELETE',
        headers: {
            'X-CSRFToken': csrftoken
        }})
        .then(console.log(res))
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