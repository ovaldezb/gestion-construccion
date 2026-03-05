import { APIGatewayProxyHandler } from 'aws-lambda';
import mongoose from 'mongoose';
import { executeConnection } from '../libs/db';
import { Inventory } from '../models/Inventory';
import { Product } from '../models/Product';
import '../models/Location'; // Ensure Location model is registered

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const registerInventoryMovement: APIGatewayProxyHandler = async (event) => {
    let session;
    try {
        await executeConnection();
        const body = JSON.parse(event.body || '{}');
        const { productId, quantity, type, locationId } = body;

        // 1. Basic Validation
        if (!productId || !quantity || !type) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: productId, quantity, type' }),
            };
        }

        if (quantity <= 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Quantity must be positive' }),
            };
        }

        if (!['ENTRADA', 'SALIDA'].includes(type)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid type. Must be ENTRADA or SALIDA' }),
            };
        }

        // 2. Ensure Collection Exists (Fix for "catalog changes" error in Transaction)
        await Inventory.createCollection().catch(() => { });

        // 3. Start Transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // 3. Get Product (Locking logic via findById is not implicit in Mongo but Transaction ensures atomicity)
        const product = await Product.findById(productId).session(session);
        if (!product) {
            await session.abortTransaction();
            return { statusCode: 404, headers, body: JSON.stringify({ message: 'Product not found' }) };
        }

        // 4. Update Logic
        if (type === 'ENTRADA') {
            product.cantidad += quantity;
        } else {
            // SALIDA
            if (product.cantidad < quantity) {
                await session.abortTransaction();
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Insufficient stock', currentStock: product.cantidad }),
                };
            }
            product.cantidad -= quantity;
        }

        await product.save({ session });

        // 5. Create Inventory Record
        const inventoryRecord = await Inventory.create([{
            productId,
            quantity,
            type,
            locationId,
            timestamp: new Date(),
            newStock: product.cantidad
        }], { session });

        // 6. Commit Transaction
        await session.commitTransaction();

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                message: 'Movement registered successfully',
                record: inventoryRecord[0],
                newStock: product.cantidad
            }),
        };

    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error registering inventory movement', details: error }),
        };
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

export const getInventoryByProduct: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { productId } = event.pathParameters || {};

        if (!productId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required field: productId' }),
            };
        }

        const history = await Inventory.find({ productId })
            .sort({ timestamp: -1 })
            .populate('locationId', 'nombre') // Optional: populate location name if needed
            .exec();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(history),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error fetching inventory history', details: error }),
        };
    }
};
