import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Lambda define AWS_REGION con la región donde se despliega el stack (y por lo tanto el bucket).
// Fallback a us-east-1 para ejecución local.
const region = process.env.AWS_REGION || 'us-east-1';
const s3 = new S3Client({ region });

export const generateUploadUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const fileName = event.queryStringParameters?.filename;
        if (!fileName) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'filename query parameter is required' })
            };
        }

        const bucketName = process.env.VEHICLE_PHOTOS_BUCKET_NAME;
        if (!bucketName) {
            console.error('VEHICLE_PHOTOS_BUCKET_NAME is not set');
            return {
                statusCode: 500,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Server incorrectly configured for S3' })
            };
        }

        const folder = event.queryStringParameters?.folder || 'vehicle-photos';
        // Basic validation to prevent arbitrary paths
        const validFolders = ['vehicle-photos', 'employee-photos', 'tool-photos'];
        const targetFolder = validFolders.includes(folder) ? folder : 'vehicle-photos';

        const key = `${targetFolder}/${Date.now()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: 'image/jpeg'
        });

        // URL expires in 5 minutes
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

        const readUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ uploadUrl, readUrl })
        };
    } catch (e) {
        console.error('Error generating presigned URL:', e);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    }
};
