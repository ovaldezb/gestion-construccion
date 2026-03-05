import { Schema, model, Document } from 'mongoose';

export interface ILocation {
    nombre: string;
    ubicacion: string;
    isActivo: boolean;
}

const LocationSchema = new Schema<ILocation>({
    nombre: { type: String, required: true },
    ubicacion: { type: String, required: true },
    isActivo: { type: Boolean, default: true },
}, {
    timestamps: true
});

export const Location = model<ILocation>('Location', LocationSchema);
