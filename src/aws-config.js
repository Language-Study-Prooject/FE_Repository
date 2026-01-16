const awsConfig = {
    Auth: {
        Cognito: {
            userPoolId: 'ap-northeast-2_ezDwzFCzR',
            userPoolClientId: '4ns077jcr1pkue2vvisr6qdpu5',

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