import { APIGatewayProxyHandler } from 'aws-lambda';
import { executeConnection } from '../libs/db';
import { Employee } from '../models/Employee';
import '../models/Location'; // Ensure Location model is registered for populate

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const createEmployee: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const body = JSON.parse(event.body || '{}');

        // Sanitize idLocacion: if empty string, remove it so Mongoose validation doesn't fail
        if (body.idLocacion === '') {
            delete body.idLocacion;
        }

        // 1. Create Employee to get the _id
        const employee = await Employee.create(body);

        // 2. Generate QR content string
        const qrContent = `employee/${employee._id}`;

        // 3. Update with QR content (For now simple string, later can await S3 upload)
        employee.qrUrl = qrContent;
        await employee.save();

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(employee),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error creating employee', details: error }),
        };
    }
};

export const listEmployees: APIGatewayProxyHandler = async () => {
    try {
        await executeConnection();
        // Populate location
        const employees = await Employee.find({}).populate('idLocacion');
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(employees),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error listing employees', details: error }),
        };
    }
};

export const getEmployee: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const employee = await Employee.findById(id).populate('idLocacion');

        if (!employee) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Employee not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(employee),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error getting employee' }) };
    }
};

export const updateEmployee: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const body = JSON.parse(event.body || '{}');

        // Sanitize idLocacion
        if (body.idLocacion === '') {
            delete body.idLocacion;
        }

        const employee = await Employee.findByIdAndUpdate(id, body, { new: true });

        if (!employee) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Employee not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(employee),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error updating employee' }) };
    }
};

export const deleteEmployee: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const employee = await Employee.findByIdAndUpdate(id, { isActivo: false }, { new: true });

        if (!employee) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Employee not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Employee deleted (soft)', employee }),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error deleting employee' }) };
    }
};
