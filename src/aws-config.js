const awsConfig = {
    Auth: {
        Cognito: {
            userPoolId: import.meta.env.VITE_COGNITO_POOL_ID,
            userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,

            loginWith: {
                email: true,
            },

            signUpVerificationMethod: 'code',

            userAttributes: {
                email: {
                    required: true,
                },
            },
        }
    }
};

export default awsConfig;