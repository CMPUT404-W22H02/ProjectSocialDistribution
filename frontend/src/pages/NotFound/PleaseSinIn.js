import React from "react";

function NotFound() {
    return (
        <div style={{top: "35%", textAlign: "center", position: "absolute", width: "60%"}}>
            <img style={{top: "35%", position: "relative", width: "100%"}}
            src="https://images.mydoorsign.com/img/lg/S/visitors-please-sign-in-sign-se-2926_showcase-burrev.png" />
            
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