import { APIGatewayProxyHandler } from 'aws-lambda';
import { executeConnection } from '../libs/db';
import { ToolRecord } from '../models/ToolRecord';
import { Tool } from '../models/Tool';
import { Employee } from '../models/Employee';

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const registerToolMovement: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const body = JSON.parse(event.body || '{}');
        const { toolId, employeeId, type, comentario } = body;

        // Validation
        if (!toolId || !employeeId || !type) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: toolId, employeeId, type' }),
            };
        }

        if (!['ENTRADA', 'SALIDA'].includes(type)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid type. Must be ENTRADA or SALIDA' }),
            };
        }

        // Validate Tool and Employee exist
        const tool = await Tool.findById(toolId);
        if (!tool) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tool not found' }) };
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Employee not found' }) };
        }

        // Create Record
        const record = await ToolRecord.create({
            toolId,
            employeeId,
            type,
            comentario,
            comentario,
            timestamp: body.timestamp || new Date()
        });

        // Update Tool Status
        if (type === 'SALIDA') {
            tool.estado = 'PRESTADO';
            tool.currentHolder = employee._id;
        } else {
            // ENTRADA
            tool.estado = 'DISPONIBLE';
            tool.currentHolder = undefined;
        }
        await tool.save();

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ message: 'Movement registered', record, toolStatus: tool.estado }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error registering movement', details: error }),
        };
    }
};

export const listToolRecords: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { toolId, employeeId, searchType, id } = event.queryStringParameters || {};
        let query: any = {};

        // Support for generic searchType + id
        if (searchType && id) {
            if (searchType === 'tool') query.toolId = id;
            else if (searchType === 'employee') query.employeeId = id;
        }
        // Support for specific params
        else {
            if (toolId) query.toolId = toolId;
            if (employeeId) query.employeeId = employeeId;
        }

        const records = await ToolRecord.find(query)
            .populate('toolId', 'descripcion numeroSerie')
            .populate('employeeId', 'nombre apellidoPaterno')
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
            body: JSON.stringify({ error: 'Error listing records', details: error }),
        };
    }
};
