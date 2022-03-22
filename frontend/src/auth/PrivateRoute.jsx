import {Navigate, Outlet} from "react-router-dom";
import React, {useState} from "react";
import Identity from "../model/Identity";

/**
 * Private Route
 * @returns {JSX.Element}
 * @constructor
 */
const PrivateRoute = () => {
    let UserIdentity = Identity.GetIdentity();
    const [auth, setAuth] = useState(UserIdentity.IsAuthenticated()); // determine if authorized, from context or however you're doing it

    // listen for change in auth state
    window.addEventListener("storage", () => {
        UserIdentity = Identity.GetIdentity(); // Get new updated identity

        if (auth !== UserIdentity.IsAuthenticated()) {
            setAuth(UserIdentity.IsAuthenticated());
        }
    });

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return auth ? <Outlet/> : <Navigate to="/login"/>;
}

export default PrivateRoute;