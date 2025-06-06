// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
msal.PublicClientApplication.createPublicClientApplication(msalConfig)
    .then((obj) => {
        myMSALObj = obj;
        /**
         * A promise handler needs to be registered for handling the
         * response returned from redirect flow. For more information, visit:
         * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/initialization.md#redirect-apis
         */
        myMSALObj.handleRedirectPromise()
        .then(handleResponse)
        .catch((error) => {
            console.error(error);
        });
    })
    .catch((error) => {
        console.error("Error creating MSAL PublicClientApplication:", error);
    });

let username = "";


function selectAccount() {

    /**
     * See here for more info on account retrieval: 
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

    const currentAccounts = myMSALObj.getAllAccounts();

    if (!currentAccounts) {
        return;
    } else if (currentAccounts.length > 1) {
        // Add your account choosing logic here
        console.warn("Multiple accounts detected.");
    } else if (currentAccounts.length === 1) {
        myMSALObj.acquireTokenSilent({account:currentAccounts[0]}).then(handleResponse).catch((error) => {
            console.error("Silent token acquisition failed. Error: ", error);        
        })
    }
}
    
function handleResponse(response) {

    /**
     * To see the full list of response object properties, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#response
     */

    if (response !== null) {
        username = response?.account?.username || response?.account?.email || response?.account?.name || "Unknown";
        welcomeUser(username);
        updateTable(response.account); 

    const accessTokenRequest = {
        account: response.account,
        scopes: ["User.Read"], // Add the scopes you need for your API"]
    };

    myMSALObj.acquireTokenSilent(accessTokenRequest)
        .then((response) => {
            console.log("Access Token:", response.accessToken);
            // Use the access token to call your API

            fetch("https://graph.microsoft.com/v1.0/me", {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${response.accessToken}`, // Use the access token you got
                  "Content-Type": "application/json"
                }
              })
              .then(response => response.json())
              .then(data => {
                console.log("Graph API response:", data);
                alert("Your email address is: " + (data.mail || data.userPrincipalName));
              })
              .catch(error => {
                console.error("Error calling Microsoft Graph:", error);
              });


        })
        .catch((error) => {
            console.error("Silent token acquisition failed:", error);
            // Possibly fallback to loginRedirect() or loginPopup()
        });

    } else {
        selectAccount();

        /**
         * If you already have a session that exists with the authentication server, you can use the ssoSilent() API
         * to make request for tokens without interaction, by providing a "login_hint" property. To try this, comment the 
         * line above and uncomment the section below.
         */

        // myMSALObj.ssoSilent(silentRequest).
        //     then((response) => {
        //         welcomeUser(response.account.username);
        //         updateTable(response.account);
        //     }).catch(error => {
        //         console.error("Silent Error: " + error);
        //         if (error instanceof msal.InteractionRequiredAuthError) {
        //             signIn();
        //         }
        //     });
    }
}

function signIn() {

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */
    loginRequest.redirectUri = "/";
    myMSALObj.loginRedirect(loginRequest);
}

function signOut() {

    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    // Choose which account to logout from by passing a username.
    const logoutRequest = {
        account: myMSALObj.getAccount({ username: username }),
        postLogoutRedirectUri: '/signout', // remove this line if you would like navigate to index page after logout.

    };

    myMSALObj.logoutRedirect(logoutRequest);
}
