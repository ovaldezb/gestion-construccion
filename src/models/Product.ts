import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
    nombre: string;
    descripcion: string;
    unidad: string; // e.g. 'kg', 'm2', 'pieza', 'litro'
    cantidad: number; // Global Stock
}

const ProductSchema = new Schema<IProduct>({
    nombre: { type: String, required: true },
    descripcion: { type: String },
    unidad: { type: String, required: true },
    cantidad: { type: Number, default: 0, min: 0 }
}, {
    timestamps: true
});

export const Product = model<IProduct>('Product', ProductSchema);
