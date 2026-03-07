import { APIGatewayProxyHandler } from 'aws-lambda';
import {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    ListUsersCommand,
    AdminDisableUserCommand,
    AdminEnableUserCommand
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

export const listUsers: APIGatewayProxyHandler = async (event) => {
    try {
        const userPoolId = process.env.COGNITO_USER_POOL_ID;

        if (!userPoolId) {
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Server configuration error' }),
            };
        }

        const command = new ListUsersCommand({
            UserPoolId: userPoolId,
        });

        const response = await cognitoClient.send(command);

        const users = response.Users?.map((u: any) => {
            const attrs: any = {};
            u.Attributes?.forEach((attr: any) => { if (attr.Name) attrs[attr.Name] = attr.Value; });
            return {
                username: u.Username,
                status: u.UserStatus,
                enabled: u.Enabled,
                email: attrs['email'],
                given_name: attrs['given_name'],
                family_name: attrs['family_name'],
                middle_name: attrs['middle_name'],
                profile: attrs['custom:PROFILE'],
                created_at: u.UserCreateDate,
                updated_at: u.UserLastModifiedDate,
            };
        });

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(users || []),
        };
    } catch (error: any) {
        console.error('Error in listUsers:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: error.message || 'Internal server error' }),
        };
    }
};

export const toggleUserStatus: APIGatewayProxyHandler = async (event) => {
    try {
        const username = event.pathParameters?.username;
        let bodyStr = event.body || '{}';
        if (event.isBase64Encoded) {
            bodyStr = Buffer.from(bodyStr, 'base64').toString('utf8');
        }
        const { enabled } = JSON.parse(bodyStr);

        if (!username || typeof enabled !== 'boolean') {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Missing username or valid enabled boolean status' }),
            };
        }

        const userPoolId = process.env.COGNITO_USER_POOL_ID;

        if (!userPoolId) {
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ message: 'Server configuration error' }),
            };
        }

        if (enabled) {
            await cognitoClient.send(new AdminEnableUserCommand({
                UserPoolId: userPoolId,
                Username: username
            }));
        } else {
            await cognitoClient.send(new AdminDisableUserCommand({
                UserPoolId: userPoolId,
                Username: username
            }));
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                message: `User ${enabled ? 'enabled' : 'disabled'} successfully`,
            }),
        };

    } catch (error: any) {
        console.error('Error in toggleUserStatus:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ message: error.message || 'Internal server error' }),
        };
    }
};
