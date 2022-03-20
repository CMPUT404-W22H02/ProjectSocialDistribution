import React from "react";

function NotFound() {
    return (
        <div style={{top: "35%", textAlign: "center", position: "absolute", width: "100%"}}>
            
            
            <div>
                <a className="link-secondary" href="/home" style={{marginRight: 10}}>
                    Go Home
                </a>
                <a className="link-secondary" href="javascript:history.back()" style={{marginLeft: 10}}>
                    Go Back
                </a>
            </div>
        </div>

    )
}

export default NotFound;