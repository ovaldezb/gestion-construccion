import { Schema, model, Document, Types } from 'mongoose';

export interface IEmployee extends Document {
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaAlta: Date;
    tipoEmpleado: 'FIJO' | 'ITINERANTE';
    puesto: string;
    idLocacion?: Types.ObjectId | null; // Referencia a Location, opcional si es itinerante
    isActivo: boolean;
    qrUrl?: string; // URL del QR generado
}

const EmployeeSchema = new Schema<IEmployee>({
    nombre: { type: String, required: true },
    apellidoPaterno: { type: String, required: true },
    apellidoMaterno: { type: String, required: true },
    puesto: { type: String, required: true },
    fechaAlta: { type: Date, default: Date.now },
    tipoEmpleado: { type: String, enum: ['FIJO', 'ITINERANTE'], required: true },
    idLocacion: { type: Schema.Types.ObjectId, ref: 'Location', required: false },
    isActivo: { type: Boolean, default: true },
    qrUrl: { type: String }
}, {
    timestamps: true
});

// Index to search employees by location quickly
EmployeeSchema.index({ idLocacion: 1 });

export const Employee = model<IEmployee>('Employee', EmployeeSchema);
