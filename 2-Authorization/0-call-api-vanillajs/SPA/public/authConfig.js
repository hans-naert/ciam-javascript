/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL.js configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
const msalConfig = {
    auth: {
        clientId: '3e68d9d1-19e2-4db8-a377-4f79d62e0e54', // This is the ONLY mandatory field that you need to supply.
        redirectUri: '/', // You must register this URI on Microsoft Entra admin center/App Registration. Defaults to window.location.href e.g. http://localhost:3000/,
        postLogoutRedirectUri: '/', // Indicates the page to navigate after logout.
        userFlow: 'userflow-quickstart-angular', // The name of the user flow to use for authentication. This is the name of the user flow you created in the Azure portal.
        authority: 'https://exthn2025.ciamlogin.com', // Replace the placeholder with your tenant subdomain       
    },
    cache: {
        cacheLocation: 'sessionStorage', // Configures cache location. "sessionStorage" is more secure, but "localStorage" gives you SSO.
        storeAuthStateInCookie: false, // set this to true if you have to support IE
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case msal.LogLevel.Error:
                        console.error(message);
                        return;
                    case msal.LogLevel.Info:
                        console.info(message);
                        return;
                    case msal.LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case msal.LogLevel.Warning:
                        console.warn(message);
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

/**
 * Add here the endpoints and scopes when obtaining an access token for protected web APIs. For more information, see:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/resources-and-scopes.md
 */
const protectedResources = {
    toDoListAPI: {
        endpoint: 'https://localhost:44351/api/todolist',
        scopes: {
            read: ['api://606234e3-a749-4618-8831-224aec13cff4/ToDolist.Read'],
            write: ['api://606234e3-a749-4618-8831-224aec13cff4/ToDolist.ReadWrite'],
        },
    },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 * For more information about OIDC scopes, visit:
 * https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-permissions-and-consent#openid-connect-scopes
 */
const loginRequest = {
    scopes: [...protectedResources.toDoListAPI.scopes.read, ...protectedResources.toDoListAPI.scopes.write],
};

/**
 * An optional silentRequest object can be used to achieve silent SSO
 * between applications by providing a "login_hint" property.
 */

// const silentRequest = {
//   scopes: ["openid", "profile"],
//   loginHint: "example@domain.net"
// };

// exporting config object for jest
if (typeof exports !== 'undefined') {
    module.exports = {
        msalConfig,
        loginRequest,
        protectedResources,
    };
}
