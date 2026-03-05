import { APIGatewayProxyHandler } from 'aws-lambda';
import { executeConnection } from '../libs/db';
import { Location } from '../models/Location';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const createLocation: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const body = JSON.parse(event.body || '{}');
        const location = await Location.create(body);
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(location),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error creating location', details: error }),
        };
    }
};

export const listLocations: APIGatewayProxyHandler = async () => {
    try {
        await executeConnection();
        const locations = await Location.find({});
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(locations),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error listing locations', details: error }),
        };
    }
};

export const getLocation: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const location = await Location.findById(id);

        if (!location) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Location not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(location),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error getting location' }) };
    }
};

export const updateLocation: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const body = JSON.parse(event.body || '{}');
        const location = await Location.findByIdAndUpdate(id, body, { new: true });

        if (!location) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Location not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(location),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error updating location' }) };
    }
};

export const deleteLocation: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        // Logica soft delete
        const location = await Location.findByIdAndUpdate(id, { isActivo: false }, { new: true });

        if (!location) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Location not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Location deleted (soft)', location }),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error deleting location' }) };
    }
};
