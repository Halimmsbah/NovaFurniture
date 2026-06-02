import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Commerce API',
      version: '1.0.0',
      description:
        'A comprehensive e-commerce API with authentication, product management, shopping cart, and order processing',
      contact: {
        name: 'Halim',
        email: 'halim@example.com'
      }
    },
    servers: [
      {
        url:
          process.env.baseURL ||
          process.env.BASE_URL ||
          'http://localhost:3000',
        description: 'API Server'
      }
    ],// ← الفاصلة دي كانت ناقصة

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: [
    './src/modules/**/*.routes.js',
    './src/modules/**/*.controller.js',
    './database/models/*.js',
    './swagger.schemas.js'
  ]
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };