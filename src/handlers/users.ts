import { APIGatewayProxyHandler } from 'aws-lambda';
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

// Hardcoded region or process.env.REGION could be used. 
// However, since Lambdas run in the same region as the Cognito pool by default,
// omitting region or using process.env.AWS_REGION is standard.
const cognitoClient = new CognitoIdentityProviderClient({});

export const createUser: APIGatewayProxyHandler = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'No body provided' }),
            };
        }

        let bodyStr = event.body;
        if (event.isBase64Encoded) {
            bodyStr = Buffer.from(bodyStr, 'base64').toString('utf8');
        }
        const body = JSON.parse(bodyStr);
        const { email, given_name, family_name, middle_name, profile } = body;

        if (!email || !given_name || !family_name || !profile) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Missing required fields' }),
            };
        }

        const userPoolId = process.env.COGNITO_USER_POOL_ID;

        if (!userPoolId) {
            console.error('Environment variable COGNITO_USER_POOL_ID is missing');
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Server configuration error' }),
            };
        }

        const userAttributes = [
            { Name: 'email', Value: email },
            { Name: 'given_name', Value: given_name },
            { Name: 'family_name', Value: family_name },
            { Name: 'custom:PROFILE', Value: profile },
            { Name: 'email_verified', Value: 'true' },
        ];

        if (middle_name) {
            userAttributes.push({ Name: 'middle_name', Value: middle_name });
        }

        const command = new AdminCreateUserCommand({
            UserPoolId: userPoolId,
            Username: email,
            UserAttributes: userAttributes,
            // We want Cognito to automatically send the invitation email 
            // with a temporary password (default behavior).
        });

        const response = await cognitoClient.send(command);

        return {
            statusCode: 201,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                message: 'User created successfully',
                user: response.User,
            }),
        };

    } catch (error: any) {
        console.error('Error in createUser:', error);

        let statusCode = 500;
        if (error.name === 'UsernameExistsException') {
            statusCode = 409;
        }

        return {
            statusCode,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                message: error.message || 'Internal server error',
            }),
        };
    }
};
