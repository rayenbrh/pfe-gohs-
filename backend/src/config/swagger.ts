import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT ?? '5000';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inova Ride API',
      description:
        'Car rental management platform REST API. Current version is v1 (all routes under /api). Future v2 routes will be at /api/v2/.',
      version: '1.0.0',
      contact: {
        name: 'Inova Ride',
        email: 'support@inovaride.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Development',
      },
      {
        url: 'https://api.yourdomain.com/api',
        description: 'Production',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['fail', 'error'] },
            message: { type: 'string' },
            code: { type: 'string' },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['super_admin', 'admin', 'agent'] },
            isActive: { type: 'boolean' },
            avatar: { type: 'string', format: 'uri' },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Vehicle: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            brand: { type: 'string' },
            model: { type: 'string' },
            year: { type: 'integer' },
            licensePlate: { type: 'string' },
            category: {
              type: 'string',
              enum: ['economy', 'luxury', 'utility', 'suv', 'van'],
            },
            color: { type: 'string' },
            seats: { type: 'integer' },
            transmission: { type: 'string', enum: ['manual', 'automatic'] },
            fuelType: { type: 'string', enum: ['diesel', 'petrol', 'electric', 'hybrid'] },
            pricePerDay: { type: 'number' },
            images: { type: 'array', items: { type: 'string', format: 'uri' } },
            description: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
            isAvailable: { type: 'boolean' },
            isActive: { type: 'boolean' },
            mileage: { type: 'number' },
            nextMaintenanceDate: { type: 'string', format: 'date-time' },
            maintenanceIntervalKm: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            nationality: { type: 'string' },
            idType: { type: 'string', enum: ['cin', 'passport', 'driving_license'] },
            idNumber: { type: 'string' },
            idDocumentUrl: { type: 'string', format: 'uri' },
            driverLicenseUrl: { type: 'string', format: 'uri' },
            address: { type: 'string' },
            isBlacklisted: { type: 'boolean' },
            isActive: { type: 'boolean' },
            totalRentals: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Reservation: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            reservationNumber: { type: 'string' },
            vehicle: { type: 'string' },
            client: { type: 'string' },
            agent: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            totalDays: { type: 'integer' },
            pricePerDay: { type: 'number' },
            totalPrice: { type: 'number' },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
            },
            pickupLocation: { type: 'string' },
            returnLocation: { type: 'string' },
            paymentStatus: { type: 'string', enum: ['unpaid', 'partial', 'paid'] },
            paymentMethod: { type: 'string', enum: ['cash', 'card', 'online'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        MaintenanceLog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            vehicle: { type: 'string' },
            type: {
              type: 'string',
              enum: ['scheduled', 'repair', 'inspection', 'tire_change', 'oil_change'],
            },
            description: { type: 'string' },
            cost: { type: 'number' },
            performedAt: { type: 'string', format: 'date-time' },
            performedBy: { type: 'string' },
            receiptUrl: { type: 'string', format: 'uri' },
          },
        },
        Invoice: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoiceNumber: { type: 'string' },
            reservation: { type: 'string' },
            client: { type: 'string' },
            totalAmount: { type: 'number' },
            status: { type: 'string', enum: ['draft', 'sent', 'paid', 'void'] },
            pdfUrl: { type: 'string', format: 'uri' },
          },
        },
        Contract: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            contractNumber: { type: 'string' },
            reservation: { type: 'string' },
            pdfUrl: { type: 'string', format: 'uri' },
            isVoid: { type: 'boolean' },
          },
        },
      },
      parameters: {
        PageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        LimitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          description: 'Max 100 results per page',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
