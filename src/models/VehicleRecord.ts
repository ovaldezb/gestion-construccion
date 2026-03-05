import { Schema, model, Document, Types } from 'mongoose';

export interface IVehicleRecord extends Document {
    vehicleId: Types.ObjectId;
    employeeId: Types.ObjectId; // Who is driving / registered the movement
    type: 'ENTRADA' | 'SALIDA';
    comentario?: string;
    timestamp: Date;
}

const VehicleRecordSchema = new Schema<IVehicleRecord>({
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['ENTRADA', 'SALIDA'], required: true },
    comentario: { type: String },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for quick history lookup
VehicleRecordSchema.index({ vehicleId: 1, timestamp: -1 });

export const VehicleRecord = model<IVehicleRecord>('VehicleRecord', VehicleRecordSchema);
