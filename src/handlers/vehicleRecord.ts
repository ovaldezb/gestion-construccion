import { APIGatewayProxyHandler } from 'aws-lambda';
import { executeConnection } from '../libs/db';
import { VehicleRecord } from '../models/VehicleRecord';
import { Vehicle } from '../models/Vehicle';
import { Employee } from '../models/Employee';
import '../models/Vehicle';
import '../models/Employee';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const registerMovement: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { vehicleId, employeeId, type, comentario, photoUrls } = JSON.parse(event.body || '{}');

        // Validation
        if (!vehicleId || !employeeId || !type) {
            return {
                statusCode: 400,
                headers, // Using existing headers constant
                body: JSON.stringify({ error: 'Faltan campos (vehicleId, employeeId, type)' }),
            };
        }

        // Validate items using exact IDs
        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return {
                statusCode: 404,
                headers, // Using existing headers constant
                body: JSON.stringify({ error: 'Vehículo no encontrado. Escanea el código del vehículo válido.' }),
            };
        }

        if (type !== 'ENTRADA' && type !== 'SALIDA') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Tipo debe ser ENTRADA o SALIDA' }),
            };
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return {
                statusCode: 404,
                headers, // Using existing headers constant
                body: JSON.stringify({ error: 'Empleado no encontrado. Escanea el código del empleado válido.' }),
            };
        }

        const record = new VehicleRecord({
            vehicleId,
            employeeId,
            type,
            comentario,
            photoUrls,
            timestamp: new Date() // Simplified timestamp
        });

        await record.save(); // Save the new record

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
