import { Schema, model, Document } from 'mongoose';

export interface IVehicle extends Document {
    placas: string;
    vin: string;
    modelo: string;
    modelyear: number;
    isActivo: boolean;
    qrUrl?: string;
}

const VehicleSchema = new Schema<IVehicle>({
    placas: { type: String, required: true, unique: true },
    vin: { type: String, required: true, unique: true },
    modelo: { type: String, required: true },
    modelyear: { type: Number, required: true },
    isActivo: { type: Boolean, default: true },
    qrUrl: { type: String }
}, {
    timestamps: true,
    collection: 'vehiculo' // explicitly named as requested "tabla vehiculo"
});

export const Vehicle = model<IVehicle>('Vehicle', VehicleSchema);
