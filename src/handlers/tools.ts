import { APIGatewayProxyHandler } from 'aws-lambda';
import { executeConnection } from '../libs/db';
import { Tool } from '../models/Tool';
import '../models/Employee'; // Ensure Employee model is registered for populate

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const createTool: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const body = JSON.parse(event.body || '{}');

        // 1. Create Tool
        const tool = await Tool.create(body);

        // 2. Generate QR content (tool/{_id})
        const qrContent = `tool/${tool._id}`;

        // 3. Update with QR content
        tool.qrUrl = qrContent;
        await tool.save();

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(tool),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error creating tool', details: error }),
        };
    }
};

export const listTools: APIGatewayProxyHandler = async () => {
    try {
        await executeConnection();
        // Populate currentHolder to see employee details if borrowed
        const tools = await Tool.find({ isActivo: true }).populate('currentHolder');
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(tools),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error listing tools', details: error }),
        };
    }
};

export const getTool: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const tool = await Tool.findById(id).populate('currentHolder');

        if (!tool) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tool not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(tool),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error getting tool' }) };
    }
};

export const updateTool: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const body = JSON.parse(event.body || '{}');
        const tool = await Tool.findByIdAndUpdate(id, body, { new: true });

        if (!tool) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tool not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(tool),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error updating tool' }) };
    }
};

export const deleteTool: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { id } = event.pathParameters || {};
        const tool = await Tool.findByIdAndUpdate(id, { isActivo: false }, { new: true });

        if (!tool) {
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Tool not found' }) };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'Tool deleted (soft)', tool }),
        };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'Error deleting tool' }) };
    }
};
