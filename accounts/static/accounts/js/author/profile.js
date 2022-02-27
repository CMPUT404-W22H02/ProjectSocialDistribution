const request = new Request(`/authors/${user.id}`, 
    {
        method: 'GET',
        headers: new headers({'Content-Type':'application/json'})
    });

fetch(request)
    .then((response) => {
        if (!response.ok) {
            throw new Error(`error: ${response.status}`);
        }
        return response.json();
    })