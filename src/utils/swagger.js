const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const  path  = require("path")
// تنظیمات کلی Swagger
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'My API Docs',
    version: '1.0.0',
    description: 'مستندات API برای ارتباط با فرانت',
  },
  servers: [
    {
      url: ' http://171.22.25.201:3002', // آدرس سرورت
    },
  ],
};

// تنظیمات برای گرفتن کامنت‌ها از فایل‌ها
const options = {
  swaggerDefinition,
  apis:[path.join(__dirname, '../router/*.js')], // آدرس فایل‌هایی که APIها داخلش نوشته شده
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
