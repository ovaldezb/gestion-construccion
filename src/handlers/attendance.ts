import { APIGatewayProxyHandler } from 'aws-lambda';
import { executeConnection } from '../libs/db';
import { Attendance } from '../models/Attendance';
import { Employee } from '../models/Employee';
import '../models/Location'; // Register Location model

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

export const registerAttendance: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const body = JSON.parse(event.body || '{}');

        // Validation
        if (!body.employeeId || !body.type || !body.supervisorId || !body.timestamp) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: employeeId, type, supervisorId, timestamp' }),
            };
        }

        // Validate Employee exists
        const employee = await Employee.findById(body.employeeId);
        if (!employee) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Empleado no encontrado' }),
            };
        }

        const attendance = await Attendance.create(body);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(attendance),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error registering attendance', details: error }),
        };
    }
};

export const listAttendance: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { employeeId, startDate, endDate, limit } = event.queryStringParameters || {};

        let query: any = {};

        if (employeeId) query.employeeId = employeeId;

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        let dbQuery = Attendance.find(query)
            .populate('employeeId', 'nombre apellidoPaterno apellidoMaterno puesto')
            .sort({ timestamp: -1 });

        if (limit) {
            dbQuery = dbQuery.limit(parseInt(limit, 10));
        }

        const records = await dbQuery;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(records),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error listing attendance', details: error }),
        };
    }
};

export const reportAttendance: APIGatewayProxyHandler = async (event) => {
    try {
        await executeConnection();
        const { startDate, endDate } = event.queryStringParameters || {};

        if (!startDate || !endDate) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'startDate and endDate are required' }),
            };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Formatear fechas para asegurar que abarquen el día completo en UTC
        start.setUTCHours(0, 0, 0, 0);
        end.setUTCHours(23, 59, 59, 999);

        // Generar lista de días en el rango (L M M J V...)
        const days = [];
        let currentDay = new Date(start);
        while (currentDay <= end) {
            days.push(new Date(currentDay));
            currentDay.setUTCDate(currentDay.getUTCDate() + 1);
        }

        // Obtener todos los empleados
        const employees = await Employee.find({ isActivo: true }).sort({ apellidoPaterno: 1, apellidoMaterno: 1, nombre: 1 });

        // Obtener asistencias de ENTRADA en el rango
        const attendances = await Attendance.find({
            type: 'ENTRADA',
            timestamp: { $gte: start, $lte: end }
        });

        // Map para la búsqueda rápida de asistencias: { "employeeId_YYYY-MM-DD": true }
        const attendanceMap = new Set<string>();
        attendances.forEach(att => {
            const empId = att.employeeId.toString();
            const dateStr = att.timestamp.toISOString().split('T')[0];
            attendanceMap.add(`${empId}_${dateStr}`);
        });

        // Construir CSV
        const headersCsv = ['Empleado', ...days.map(d => {
            const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
            const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            return `${diasSemana[d.getUTCDay()]} ${d.getUTCDate()} ${meses[d.getUTCMonth()]}`;
        })];

        let csvString = headersCsv.join(',') + '\n';

        for (const emp of employees) {
            const empName = `${emp.nombre} ${emp.apellidoPaterno} ${emp.apellidoMaterno ?? ''}`.trim();
            const rowData = [empName.replace(/,/g, '')]; // Avoid commas in names

            for (const day of days) {
                const dayStr = day.toISOString().split('T')[0];
                const key = `${emp._id}_${dayStr}`;
                rowData.push(attendanceMap.has(key) ? 'x' : '-');
            }

            csvString += rowData.join(',') + '\n';
        }

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="reporte_asistencia.csv"'
            },
            body: csvString,
        };
    } catch (error) {
        console.error("Error generating report:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Error generating report', details: error }),
        };
    }
};
