import type { AWS } from '@serverless/typescript';


const cognitoAuthorizer = {
    name: 'CognitoAuthorizer',
    type: 'COGNITO_USER_POOLS',
    arn: { 'Fn::GetAtt': ['CognitoUserPool', 'Arn'] },
};

const serverlessConfiguration: AWS = {
    service: 'gestion-construccion',

    frameworkVersion: '3',
    useDotenv: true,
    plugins: ['serverless-esbuild', 'serverless-offline'],
    provider: {
        name: 'aws',
        runtime: 'nodejs20.x',
        stage: '${opt:stage, "dev"}',
        region: '${opt:region, "us-east-1"}' as any, // "as any" cast may be needed depending on @serverless/typescript version, but let's try just the string first
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
            MONGODB_URI: '${env:MONGODB_URI}',
            // Usa una variable de entorno para local (serverless-offline) o una referencia de CF para deploy
            COGNITO_USER_POOL_ID: '${env:COGNITO_USER_POOL_ID, "Ref:CognitoUserPool"}',
            VEHICLE_PHOTOS_BUCKET_NAME: '${self:service}-${self:provider.stage}-vehicle-photos',
        },
        apiGateway: {
            binaryMediaTypes: ['*/*'],
        },
        iam: {
            role: {
                statements: [
                    {
                        Effect: 'Allow',
                        Action: [
                            's3:PutObject',
                            's3:GetObject',
                        ],
                        Resource: 'arn:aws:s3:::${self:service}-${self:provider.stage}-vehicle-photos/*',
                    },
                    {
                        Effect: 'Allow',
                        Action: [
                            'cognito-idp:AdminCreateUser',
                            'cognito-idp:ListUsers',
                            'cognito-idp:AdminDisableUser',
                            'cognito-idp:AdminEnableUser'
                        ],
                        Resource: '*' // The ideal would be the UserPool ARN, but `*` is sufficient for a first pass
                    }
                ],
            },
        },
    },
    functions: {
        createLocation: {
            handler: 'src/handlers/locations.createLocation',
            events: [{ http: { method: 'post', path: 'locations', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        listLocations: {
            handler: 'src/handlers/locations.listLocations',
            events: [{ http: { method: 'get', path: 'locations', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        getLocation: {
            handler: 'src/handlers/locations.getLocation',
            events: [{ http: { method: 'get', path: 'locations/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        updateLocation: {
            handler: 'src/handlers/locations.updateLocation',
            events: [{ http: { method: 'put', path: 'locations/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        deleteLocation: {
            handler: 'src/handlers/locations.deleteLocation',
            events: [{ http: { method: 'delete', path: 'locations/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        createEmployee: {
            handler: 'src/handlers/employees.createEmployee',
            events: [{ http: { method: 'post', path: 'employees', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        listEmployees: {
            handler: 'src/handlers/employees.listEmployees',
            events: [{ http: { method: 'get', path: 'employees', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        getEmployee: {
            handler: 'src/handlers/employees.getEmployee',
            events: [{ http: { method: 'get', path: 'employees/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        updateEmployee: {
            handler: 'src/handlers/employees.updateEmployee',
            events: [{ http: { method: 'put', path: 'employees/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        deleteEmployee: {
            handler: 'src/handlers/employees.deleteEmployee',
            events: [{ http: { method: 'delete', path: 'employees/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        createTool: {
            handler: 'src/handlers/tools.createTool',
            events: [{ http: { method: 'post', path: 'tools', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        listTools: {
            handler: 'src/handlers/tools.listTools',
            events: [{ http: { method: 'get', path: 'tools', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        getTool: {
            handler: 'src/handlers/tools.getTool',
            events: [{ http: { method: 'get', path: 'tools/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        updateTool: {
            handler: 'src/handlers/tools.updateTool',
            events: [{ http: { method: 'put', path: 'tools/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        deleteTool: {
            handler: 'src/handlers/tools.deleteTool',
            events: [{ http: { method: 'delete', path: 'tools/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        createProduct: {
            handler: 'src/handlers/products.createProduct',
            events: [{ http: { method: 'post', path: 'products', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        listProducts: {
            handler: 'src/handlers/products.listProducts',
            events: [{ http: { method: 'get', path: 'products', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        getProduct: {
            handler: 'src/handlers/products.getProduct',
            events: [{ http: { method: 'get', path: 'products/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        updateProduct: {
            handler: 'src/handlers/products.updateProduct',
            events: [{ http: { method: 'put', path: 'products/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        deleteProduct: {
            handler: 'src/handlers/products.deleteProduct',
            events: [{ http: { method: 'delete', path: 'products/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },

        registerInventoryMovement: {
            handler: 'src/handlers/inventory.registerInventoryMovement',
            events: [
                {
                    http: {
                        method: 'post',
                        path: 'inventory',
                        cors: true,
                    },
                },
            ],
        },
        getInventoryByProduct: {
            handler: 'src/handlers/inventory.getInventoryByProduct',
            events: [
                {
                    http: {
                        method: 'get',
                        path: 'inventory/{productId}',
                        cors: true,
                    },
                },
            ],
        },
        createUser: {
            handler: 'src/handlers/users.createUser',
            events: [{ http: { method: 'post', path: 'users', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        listUsers: {
            handler: 'src/handlers/users.listUsers',
            events: [{ http: { method: 'get', path: 'users', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        toggleUserStatus: {
            handler: 'src/handlers/users.toggleUserStatus',
            events: [{ http: { method: 'patch', path: 'users/{username}/status', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        registerAttendance: {
            handler: 'src/handlers/attendance.registerAttendance',
            events: [{ http: { method: 'post', path: 'attendance', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        listAttendance: {
            handler: 'src/handlers/attendance.listAttendance',
            events: [{ http: { method: 'get', path: 'attendance', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        reportAttendance: {
            handler: 'src/handlers/attendance.reportAttendance',
            events: [{ http: { method: 'get', path: 'attendance/report', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        registerToolMovement: {
            handler: 'src/handlers/toolRecord.registerToolMovement',
            events: [{ http: { method: 'post', path: 'tool-records', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        listToolRecords: {
            handler: 'src/handlers/toolRecord.listToolRecords',
            events: [{ http: { method: 'get', path: 'tool-records', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        createVehicle: {
            handler: 'src/handlers/vehicles.createVehicle',
            events: [{ http: { method: 'post', path: 'vehicles', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        listVehicles: {
            handler: 'src/handlers/vehicles.listVehicles',
            events: [{ http: { method: 'get', path: 'vehicles', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        getVehicle: {
            handler: 'src/handlers/vehicles.getVehicle',
            events: [{ http: { method: 'get', path: 'vehicles/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        updateVehicle: {
            handler: 'src/handlers/vehicles.updateVehicle',
            events: [{ http: { method: 'put', path: 'vehicles/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        deleteVehicle: {
            handler: 'src/handlers/vehicles.deleteVehicle',
            events: [{ http: { method: 'delete', path: 'vehicles/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        registerVehicleMovement: {
            handler: 'src/handlers/vehicleRecord.registerMovement',
            events: [{ http: { method: 'post', path: 'vehicle-records', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        getVehicleHistory: {
            handler: 'src/handlers/vehicleRecord.getVehicleHistory',
            events: [{ http: { method: 'get', path: 'vehicle-records/{id}', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        getAllVehicleRecords: {
            handler: 'src/handlers/vehicleRecord.getAllVehicleRecords',
            events: [{ http: { method: 'get', path: 'vehicle-records', cors: true, authorizer: cognitoAuthorizer  } }],
        },
        generateUploadUrl: {
            handler: 'src/handlers/upload.generateUploadUrl',
            events: [{ http: { method: 'get', path: 'upload-url', cors: true, authorizer: cognitoAuthorizer  } }],
        },
    },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node20',
            define: { 'require.resolve': undefined },
            platform: 'node',
            concurrency: 10,
        },
    },
    resources: {
        Resources: {
            CognitoUserPool: {
                Type: 'AWS::Cognito::UserPool',
                Properties: {
                    UserPoolName: '${self:service}-${self:provider.stage}-user-pool',
                    UsernameAttributes: ['email'],
                    AutoVerifiedAttributes: ['email'],
                    Schema: [
                        {
                            Name: 'email',
                            Required: true,
                            Mutable: true,
                        },
                        {
                            Name: 'PROFILE',
                            AttributeDataType: 'String',
                            Mutable: true,
                            Required: false,
                        },
                    ],
                    AdminCreateUserConfig: {
                        InviteMessageTemplate: {
                            EmailMessage: '¡Bienvenido a LuViRex, {username}! Tu contraseña temporal es: {####} \nPor favor, inicia sesión para cambiarla.',
                            EmailSubject: 'Tus credenciales de acceso para LuViRex',
                        },
                    },
                },
            },
            CognitoUserPoolClient: {
                Type: 'AWS::Cognito::UserPoolClient',
                Properties: {
                    ClientName: '${self:service}-${self:provider.stage}-user-pool-client',
                    UserPoolId: { Ref: 'CognitoUserPool' },
                    ExplicitAuthFlows: [
                        'ALLOW_USER_PASSWORD_AUTH',
                        'ALLOW_REFRESH_TOKEN_AUTH',
                        'ALLOW_USER_SRP_AUTH',
                    ],
                    GenerateSecret: false,
                },
            },
            VehiclePhotosBucket: {
                Type: 'AWS::S3::Bucket',
                Properties: {
                    BucketName: '${self:service}-${self:provider.stage}-vehicle-photos',
                    PublicAccessBlockConfiguration: {
                        BlockPublicAcls: false,
                        BlockPublicPolicy: false,
                        IgnorePublicAcls: false,
                        RestrictPublicBuckets: false,
                    },
                    CorsConfiguration: {
                        CorsRules: [
                            {
                                AllowedHeaders: ['*'],
                                AllowedMethods: ['PUT', 'POST', 'GET', 'HEAD'],
                                AllowedOrigins: ['*'],
                                MaxAge: 3000,
                            },
                        ],
                    },
                },
            },
            VehiclePhotosBucketPolicy: {
                Type: 'AWS::S3::BucketPolicy',
                Properties: {
                    Bucket: { Ref: 'VehiclePhotosBucket' },
                    PolicyDocument: {
                        Statement: [
                            {
                                Action: ['s3:GetObject'],
                                Effect: 'Allow',
                                Resource: 'arn:aws:s3:::${self:service}-${self:provider.stage}-vehicle-photos/*',
                                Principal: '*',
                            },
                        ],
                    },
                },
            },
        },
        Outputs: {
            UserPoolId: {
                Value: { Ref: 'CognitoUserPool' },
                Export: {
                    Name: '${self:service}-${self:provider.stage}-UserPoolId',
                },
            },
            UserPoolClientId: {
                Value: { Ref: 'CognitoUserPoolClient' },
                Export: {
                    Name: '${self:service}-${self:provider.stage}-UserPoolClientId',
                },
            },
        },
    },
};

module.exports = serverlessConfiguration;
