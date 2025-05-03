// Create the main myMSALObj instance
// configuration parameters are located at authConfig.js
let myMSALObj;

msal.PublicClientApplication.createPublicClientApplication(msalConfig)
    .then((obj) => {
        myMSALObj = obj;
        selectAccount();
    })
    .catch((error) => {
        console.error("Error creating MSAL PublicClientApplication:", error);
    });

let username = '';

function selectAccount() {
    /**
     * See here for more info on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */

    const currentAccounts = myMSALObj.getAllAccounts();
    if (!currentAccounts || currentAccounts.length < 1) {
        return;
    } else if (currentAccounts.length > 1) {
        // Add your account choosing logic here
        console.warn('Multiple accounts detected.');
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
    }
}

function signIn() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    myMSALObj
        .loginPopup({
            ...loginRequest,
            redirectUri: '/redirect',
        })
        .then(handleResponse)
        .catch((error) => {
            console.log(error);
        });
}


function getTokenPopup(request) {
    /**
     * See here for more information on account retrieval:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/docs/Accounts.md
     */
    request.account = myMSALObj.getAccountByUsername(username);
    return myMSALObj.acquireTokenSilent(request).catch((error) => {
        console.warn(error);
        console.warn('silent token acquisition fails. acquiring token using popup');
        if (error instanceof msal.InteractionRequiredAuthError) {
            // fallback to interaction when silent call fails
            return myMSALObj
                .acquireTokenPopup(request)
                .then((response) => {
                    return response;
                })
                .catch((error) => {
                    console.error(error);
                });
        } else {
            console.warn(error);
        }
    });
}

function signOut() {
    /**
     * You can pass a custom request object below. This will override the initial configuration. For more information, visit:
     * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/request-response-object.md#request
     */

    // Choose which account to logout from by passing a username.
    const logoutRequest = {
        account: myMSALObj.getAccountByUsername(username),
    };
    myMSALObj.logoutPopup(logoutRequest).then(() => {
        window.location.reload();
    });
}

//selectAccount();
