import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
    employeeId: Types.ObjectId;
    supervisorId: string; // Cognito Sub or User ID identifying who scanned the QR
    type: 'ENTRADA' | 'SALIDA';
    timestamp: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    supervisorId: { type: String, required: true },
    type: { type: String, enum: ['ENTRADA', 'SALIDA'], required: true },
    timestamp: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Indexes for common queries
AttendanceSchema.index({ locationId: 1, timestamp: -1 });
AttendanceSchema.index({ employeeId: 1, timestamp: -1 });

export const Attendance = model<IAttendance>('Attendance', AttendanceSchema);
