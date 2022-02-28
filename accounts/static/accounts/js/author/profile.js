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
                        var myDiv = document.getElementById("dtype");
                        myDiv.innerHTML = response['type'];                      
                        var myDiv = document.getElementById("dgh");
                        myDiv.innerHTML = response['github'];                      
                    })
}