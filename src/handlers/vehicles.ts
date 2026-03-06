import { APIGatewayProxyHandler } from 'aws-lambda';
import { executeConnection } from '../libs/db';
import { Vehicle } from '../models/Vehicle';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const createVehicle: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const body = JSON.parse(event.body || '{}');

        // 1. Create Vehicle
        const vehicle = await Vehicle.create(body);

        // 2. Generate QR content
        const qrContent = `vehiculo/${vehicle._id}`;

        // 3. Update with QR content
        vehicle.qrUrl = qrContent;
        await vehicle.save();

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(vehicle),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error creating vehicle', details: error }),
        };
    }
};

export const listVehicles: APIGatewayProxyHandler = async () => {
    try {
        await executeConnection();
        const vehicles = await Vehicle.find({ isActivo: true });
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(vehicles),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error listing vehicles', details: error }),
        };
    }
};

export const getVehicle: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Vehicle not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(vehicle),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error getting vehicle' }) };
    }
};

export const updateVehicle: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const body = JSON.parse(event.body || '{}');
        const vehicle = await Vehicle.findByIdAndUpdate(id, body, { new: true });

        if (!vehicle) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Vehicle not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(vehicle),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error updating vehicle' }) };
    }
};

export const deleteVehicle: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const vehicle = await Vehicle.findByIdAndUpdate(id, { isActivo: false }, { new: true });

        if (!vehicle) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Vehicle not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Vehicle deleted (soft)', vehicle }),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error deleting vehicle' }) };
    }
};
