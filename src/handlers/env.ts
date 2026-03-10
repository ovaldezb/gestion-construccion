import { APIGatewayProxyHandler } from 'aws-lambda';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const getEnv: APIGatewayProxyHandler = async () => {
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            env: process.env.ENV || 'D'
        }),
    };
};
