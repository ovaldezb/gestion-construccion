import { APIGatewayProxyHandler } from 'aws-lambda';
import { executeConnection } from '../libs/db';
import { Attendance } from '../models/Attendance';
import { Employee } from '../models/Employee';
import '../models/Location'; // Register Location model

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const registerAttendance: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const body = JSON.parse(event.body || '{}');

        // Validation
        if (!body.employeeId || !body.type || !body.supervisorId || !body.timestamp) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: employeeId, type, supervisorId, timestamp' }),
            };
        }

        // Validate Employee exists
        const employee = await Employee.findById(body.employeeId);
        if (!employee) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Empleado no encontrado' }),
            };
        }

        const attendance = await Attendance.create(body);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(attendance),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error registering attendance', details: error }),
        };
    }
};

export const listAttendance: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { employeeId, startDate, endDate } = event.queryStringParameters || {};

        let query: any = {};

        if (employeeId) query.employeeId = employeeId;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const records = await Attendance.find(query)
            .populate('employeeId', 'nombre apellidoPaterno apellidoMaterno puesto')
            .sort({ timestamp: -1 });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(records),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error listing attendance', details: error }),
        };
    }
};
