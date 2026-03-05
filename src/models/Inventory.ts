import { Schema, model, Document, Types } from 'mongoose';

export interface IInventory extends Document {
    productId: Types.ObjectId;
    quantity: number;
    type: 'ENTRADA' | 'SALIDA';
    locationId?: Types.ObjectId;
    timestamp: Date;
    newStock: number;
}

const InventorySchema = new Schema<IInventory>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ['ENTRADA', 'SALIDA'], required: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: false }, // Optional
    timestamp: { type: Date, default: Date.now },
    newStock: { type: Number, required: true }
}, {
    timestamps: true
});

InventorySchema.index({ productId: 1, timestamp: -1 });

export const Inventory = model<IInventory>('Inventory', InventorySchema);
