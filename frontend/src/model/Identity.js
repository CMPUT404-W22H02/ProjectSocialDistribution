/**
 * Identity object, contain user info
 */
class Identity {
    token = "";
    refreshToken = "";
    username = "";
    id=""


    timezoneOffset = new Date().getTimezoneOffset();

    
    constructor(token = "", refreshToken = "", username = "", id=""
                ) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.username = username;
        this.id=id;
       
    }

    /**
     * Retrieve identity from localStorage
     * @returns {Identity}
     * @constructor
     */
    static GetIdentity() {
        let token = localStorage.getItem("token");
        let refreshToken = localStorage.getItem("refreshToken");

        let username = localStorage.getItem("username");
        let id = localStorage.getItem("id");
        let git=localStorage.getItem("github");

        return new Identity(token, refreshToken, username, id, git);
    }

    /**
     * Clear all identity info from localStorage
     * @constructor
     */
    static ClearIdentity() {
        localStorage.clear();
    }

    /**
     * Store identity to localStorage, return true if success
     * @returns {boolean}
     * @constructor
     */
    StoreIdentity() {
        if (this.username !== "") {
            localStorage.setItem("token", this.token);
            localStorage.setItem("refreshToken", this.refreshToken);

            localStorage.setItem("username", this.username);

            localStorage.setItem("id", this.id);
            return true;
        }
        return false;
    }

    /**
     * Check if use is authenticated
     * @returns {boolean}
     * @constructor
     */
    IsAuthenticated() {
        return this.token !== "" && this.token != null;
    }

    static UpdateIdentity(token, refreshToken, username, id) {
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken",refreshToken);

        localStorage.setItem("username", username);

        localStorage.setItem("id", id);

    }
}

export default Identity;