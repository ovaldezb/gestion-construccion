import { APIGatewayProxyHandler } from 'aws-lambda';
import { executeConnection } from '../libs/db';
import { VehicleRecord } from '../models/VehicleRecord';
import '../models/Vehicle';
import '../models/Employee';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const registerMovement: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const body = JSON.parse(event.body || '{}');

        // Validation
        if (!body.vehicleId || !body.employeeId || !body.type) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: vehicleId, employeeId, type' }),
            };
        }

        if (body.type !== 'ENTRADA' && body.type !== 'SALIDA') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid type, must be ENTRADA or SALIDA' }),
            };
        }

        // We can add logic to check if previous status makes sense, etc, but keeping it simple for now
        const record = await VehicleRecord.create({
            vehicleId: body.vehicleId,
            employeeId: body.employeeId,
            type: body.type,
            comentario: body.comentario,
            timestamp: body.timestamp ? new Date(body.timestamp) : new Date()
        });

        // Optionally update Vehicle with current status or who has it here, similar to Tool logic.
        // E.g., if we added a `currentHolder` or `status` to Vehicle.

        const populatedRecord = await record.populate(['vehicleId', 'employeeId']);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(populatedRecord),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error registering vehicle movement', details: error }),
        };
    }
};

export const getVehicleHistory: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};

        const records = await VehicleRecord.find({ vehicleId: id })
            .populate('employeeId')
            .sort({ timestamp: -1 });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(records),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error getting vehicle history' }) };
    }
};

export const getAllVehicleRecords: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();

        const records = await VehicleRecord.find()
            .populate(['vehicleId', 'employeeId'])
            .sort({ timestamp: -1 })
            .limit(100); // Pagination could be added later

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(records),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error getting vehicle records' }) };
    }
};
