import { Schema, model, Document, Types } from 'mongoose';

export interface IToolRecord extends Document {
    toolId: Types.ObjectId;
    employeeId: Types.ObjectId;
    type: 'ENTRADA' | 'SALIDA';
    comentario?: string;
    timestamp: Date;
}

const ToolRecordSchema = new Schema<IToolRecord>({
    toolId: { type: Schema.Types.ObjectId, ref: 'Tool', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    type: { type: String, enum: ['ENTRADA', 'SALIDA'], required: true },
    comentario: { type: String },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Index for quick history lookup
ToolRecordSchema.index({ toolId: 1, timestamp: -1 });
ToolRecordSchema.index({ employeeId: 1, timestamp: -1 });

export const ToolRecord = model<IToolRecord>('ToolRecord', ToolRecordSchema);
