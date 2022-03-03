function getInbox(uid){
    let fetchRes = fetch(
        uid);
        console.log(uid)
                fetchRes.then(res =>
                    res.json()).then(response => {
                        console.log("oo")
                        console.log(response)
                        var myDiv = document.getElementById("dname");
                        myDiv.innerHTML = response['display_name']                  
                    })
}

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