import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
    service: 'gestion-construccion',

    frameworkVersion: '3',
    useDotenv: true,
    plugins: ['serverless-esbuild', 'serverless-offline'],
    provider: {
        name: 'aws',
        runtime: 'nodejs20.x',
        stage: '${opt:stage, "dev"}',
        region: 'us-east-1',
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
            MONGODB_URI: '${env:MONGODB_URI}',
            // Usa una variable de entorno para local (serverless-offline) o una referencia de CF para deploy
            COGNITO_USER_POOL_ID: '${env:COGNITO_USER_POOL_ID, "Ref:CognitoUserPool"}',
        },
    },
    functions: {
        createLocation: {
            handler: 'src/handlers/locations.createLocation',
            events: [{ http: { method: 'post', path: 'locations', cors: true } }],
        },
        listLocations: {
            handler: 'src/handlers/locations.listLocations',
            events: [{ http: { method: 'get', path: 'locations', cors: true } }],
        },
        getLocation: {
            handler: 'src/handlers/locations.getLocation',
            events: [{ http: { method: 'get', path: 'locations/{id}', cors: true } }],
        },
        updateLocation: {
            handler: 'src/handlers/locations.updateLocation',
            events: [{ http: { method: 'put', path: 'locations/{id}', cors: true } }],
        },
        deleteLocation: {
            handler: 'src/handlers/locations.deleteLocation',
            events: [{ http: { method: 'delete', path: 'locations/{id}', cors: true } }],
        },
        createEmployee: {
            handler: 'src/handlers/employees.createEmployee',
            events: [{ http: { method: 'post', path: 'employees', cors: true } }],
        },
        listEmployees: {
            handler: 'src/handlers/employees.listEmployees',
            events: [{ http: { method: 'get', path: 'employees', cors: true } }],
        },
        getEmployee: {
            handler: 'src/handlers/employees.getEmployee',
            events: [{ http: { method: 'get', path: 'employees/{id}', cors: true } }],
        },
        updateEmployee: {
            handler: 'src/handlers/employees.updateEmployee',
            events: [{ http: { method: 'put', path: 'employees/{id}', cors: true } }],
        },
        deleteEmployee: {
            handler: 'src/handlers/employees.deleteEmployee',
            events: [{ http: { method: 'delete', path: 'employees/{id}', cors: true } }],
        },
        createTool: {
            handler: 'src/handlers/tools.createTool',
            events: [{ http: { method: 'post', path: 'tools', cors: true } }],
        },
        listTools: {
            handler: 'src/handlers/tools.listTools',
            events: [{ http: { method: 'get', path: 'tools', cors: true } }],
        },
        getTool: {
            handler: 'src/handlers/tools.getTool',
            events: [{ http: { method: 'get', path: 'tools/{id}', cors: true } }],
        },
        updateTool: {
            handler: 'src/handlers/tools.updateTool',
            events: [{ http: { method: 'put', path: 'tools/{id}', cors: true } }],
        },
        deleteTool: {
            handler: 'src/handlers/tools.deleteTool',
            events: [{ http: { method: 'delete', path: 'tools/{id}', cors: true } }],
        },
        createProduct: {
            handler: 'src/handlers/products.createProduct',
            events: [{ http: { method: 'post', path: 'products', cors: true } }],
        },
        listProducts: {
            handler: 'src/handlers/products.listProducts',
            events: [{ http: { method: 'get', path: 'products', cors: true } }],
        },
        getProduct: {
            handler: 'src/handlers/products.getProduct',
            events: [{ http: { method: 'get', path: 'products/{id}', cors: true } }],
        },
        updateProduct: {
            handler: 'src/handlers/products.updateProduct',
            events: [{ http: { method: 'put', path: 'products/{id}', cors: true } }],
        },
        deleteProduct: {
            handler: 'src/handlers/products.deleteProduct',
            events: [{ http: { method: 'delete', path: 'products/{id}', cors: true } }],
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
        }, registerAttendance: {
            handler: 'src/handlers/attendance.registerAttendance',
            events: [{ http: { method: 'post', path: 'attendance', cors: true } }],
        },
        listAttendance: {
            handler: 'src/handlers/attendance.listAttendance',
            events: [{ http: { method: 'get', path: 'attendance', cors: true } }],
        },
        registerToolMovement: {
            handler: 'src/handlers/toolRecord.registerToolMovement',
            events: [{ http: { method: 'post', path: 'tool-records', cors: true } }],
        },
        listToolRecords: {
            handler: 'src/handlers/toolRecord.listToolRecords',
            events: [{ http: { method: 'get', path: 'tool-records', cors: true } }],
        },
        createVehicle: {
            handler: 'src/handlers/vehicles.createVehicle',
            events: [{ http: { method: 'post', path: 'vehicles', cors: true } }],
        },
        listVehicles: {
            handler: 'src/handlers/vehicles.listVehicles',
            events: [{ http: { method: 'get', path: 'vehicles', cors: true } }],
        },
        getVehicle: {
            handler: 'src/handlers/vehicles.getVehicle',
            events: [{ http: { method: 'get', path: 'vehicles/{id}', cors: true } }],
        },
        updateVehicle: {
            handler: 'src/handlers/vehicles.updateVehicle',
            events: [{ http: { method: 'put', path: 'vehicles/{id}', cors: true } }],
        },
        deleteVehicle: {
            handler: 'src/handlers/vehicles.deleteVehicle',
            events: [{ http: { method: 'delete', path: 'vehicles/{id}', cors: true } }],
        },
        registerVehicleMovement: {
            handler: 'src/handlers/vehicleRecord.registerMovement',
            events: [{ http: { method: 'post', path: 'vehicle-records', cors: true } }],
        },
        getVehicleHistory: {
            handler: 'src/handlers/vehicleRecord.getVehicleHistory',
            events: [{ http: { method: 'get', path: 'vehicle-records/{id}', cors: true } }],
        },
        getAllVehicleRecords: {
            handler: 'src/handlers/vehicleRecord.getAllVehicleRecords',
            events: [{ http: { method: 'get', path: 'vehicle-records', cors: true } }],
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
