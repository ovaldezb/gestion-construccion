import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({ region: 'us-east-1' });

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

        const key = `vehicle-photos/${Date.now()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: 'image/jpeg'
        });

        // URL expires in 5 minutes
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

        const readUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

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
