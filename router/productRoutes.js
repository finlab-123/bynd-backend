import express from 'express';
import {
  creditCardControllers,
  equityControllers,
  mutualFundControllers,
  lifeInsuranceControllers,
  generalInsuranceControllers
} from '../controller/productControllers.js';

export const productRouter = express.Router();


productRouter.get('/credit-card', creditCardControllers.getAll);
productRouter.get('/credit-card/:id', creditCardControllers.getById);
productRouter.post('/credit-card', creditCardControllers.create);
productRouter.put('/credit-card/:id', creditCardControllers.update);
productRouter.delete('/credit-card/:id', creditCardControllers.delete);


productRouter.get('/equity', equityControllers.getAll);
productRouter.get('/equity/:id', equityControllers.getById);
productRouter.post('/equity', equityControllers.create);
productRouter.put('/equity/:id', equityControllers.update);
productRouter.delete('/equity/:id', equityControllers.delete);


productRouter.get('/mutual-fund', mutualFundControllers.getAll);
productRouter.get('/mutual-fund/:id', mutualFundControllers.getById);
productRouter.post('/mutual-fund', mutualFundControllers.create);
productRouter.put('/mutual-fund/:id', mutualFundControllers.update);
productRouter.delete('/mutual-fund/:id', mutualFundControllers.delete);


productRouter.get('/life-insurance', lifeInsuranceControllers.getAll);
productRouter.get('/life-insurance/:id', lifeInsuranceControllers.getById);
productRouter.post('/life-insurance', lifeInsuranceControllers.create);
productRouter.put('/life-insurance/:id', lifeInsuranceControllers.update);
productRouter.delete('/life-insurance/:id', lifeInsuranceControllers.delete);


productRouter.get('/general-insurance', generalInsuranceControllers.getAll);
productRouter.get('/general-insurance/:id', generalInsuranceControllers.getById);
productRouter.post('/general-insurance', generalInsuranceControllers.create);
productRouter.put('/general-insurance/:id', generalInsuranceControllers.update);
productRouter.delete('/general-insurance/:id', generalInsuranceControllers.delete);

