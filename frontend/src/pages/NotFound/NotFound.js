import React from "react";

function NotFound() {
    return (
        <div style={{top: "35%", textAlign: "center", position: "absolute", width: "50%"}}>
            <img style={{top: "35%", position: "relative", width: "100%"}}
            src="https://weeblytutorials.com/wp-content/uploads/2017/05/Weebly-404-Page-Not-Found-Error1.png" />
            
                <a className="link-secondary" href="/home" style={{marginRight: 20, fontSize :"200%", backgroundColor:'aqua'}}>
                    Go Home
                </a>
                <a className="link-secondary" href="/login" style={{marginLeft: 20, fontSize :"200%", backgroundColor:'azure'}}>
                    Log in
                </a>
                <a className="link-secondary" href="/register" style={{marginLeft: 20, fontSize :"200%", backgroundColor:'azure'}}>
                    Register
                </a>
                <a className="link-secondary" href="javascript:history.back()" style={{marginLeft: 20, fontSize :"200%", backgroundColor:'azure'}}>
                    Go Back
                </a>
            
        </div>

    )
}

export default NotFound;