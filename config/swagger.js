import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger configuration options for generating API documentation.
 *
 * @typedef {Object} SwaggerOptions
 * @property {Object} definition - OpenAPI specification.
 * @property {string} definition.openapi - The OpenAPI version.
 * @property {Object} definition.info - API information (title, version, description).
 * @property {Object[]} definition.servers - List of servers for the API.
 * @property {string} definition.servers.url - URL of the server.
 * @property {string} definition.servers.description - Description of the server.
 * @property {Object} definition.components - Components such as security schemes.
 * @property {Object} definition.components.securitySchemes - Security schemes for the API.
 * @property {string} definition.components.securitySchemes.BearerAuth.type - The type of security scheme (Bearer).
 * @property {string} definition.components.securitySchemes.BearerAuth.scheme - The scheme for the security (HTTP Bearer).
 * @property {string} definition.components.securitySchemes.BearerAuth.bearerFormat - The bearer format (JWT).
 * @property {Object[]} definition.security - Global security settings applied to all routes.
 * @property {Object} apis - Path to API files where documentation is extracted from.
 */

/**
 * Swagger setup and configuration.
 *
 * @type {SwaggerOptions}
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0', // OpenAPI version
        info: {
            title: 'Template API',    // API title
            version: '1.0.0',         // API version
            description: 'API documentation automatically generated.', // Description of the API
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}/api/v1`, // v1 server URL
                description: 'Development server (v1)', // Description for v1
            },
            {
                url: `http://localhost:${process.env.PORT || 3000}/api/v2`, // v2 server URL
                description: 'Development server (v2)', // Description for v2
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',  // Type of security scheme
                    scheme: 'bearer', // The authentication scheme
                    bearerFormat: 'JWT', // The format of the bearer token (JWT)
                },
            },
        },
        security: [
            {
                BearerAuth: [],  // Apply BearerAuth security globally to all routes
            },
        ],
    },
    apis: ['./controllers/**/*.controller.js'], // Files to scan for API definitions
};

/**
 * Generate the Swagger specification using the provided configuration options.
 *
 * @type {Object}
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
