import { Schema, model, Document, Types } from 'mongoose';

export interface ITool extends Document {
    numeroSerie?: string; // Serial number, optional
    descripcion: string;
    comentario?: string; // Optional comment
    tipo: string;
    isActivo: boolean;
    qrUrl?: string;
    estado: 'DISPONIBLE' | 'PRESTADO' | 'EN_REPARACION' | 'BAJA';
    currentHolder?: Types.ObjectId; // Reference to Employee if borrowed
}

const ToolSchema = new Schema<ITool>({
    numeroSerie: { type: String, required: false },
    descripcion: { type: String, required: true },
    comentario: { type: String, required: false },
    tipo: { type: String, required: true },
    isActivo: { type: Boolean, default: true },
    qrUrl: { type: String },
    estado: {
        type: String,
        enum: ['DISPONIBLE', 'PRESTADO', 'EN_REPARACION', 'BAJA'],
        default: 'DISPONIBLE'
    },
    currentHolder: { type: Schema.Types.ObjectId, ref: 'Employee' }
}, {
    timestamps: true
});

export const Tool = model<ITool>('Tool', ToolSchema);
