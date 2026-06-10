import express from 'express';
import {
  getAllGetInTouchQueries,
  getGetInTouchQueryById,
  createGetInTouchQuery,
  updateGetInTouchQuery,
  deleteGetInTouchQuery
} from '../controller/getInTouchController.js';

export const getInTouchRouter = express.Router();

getInTouchRouter.get('/', getAllGetInTouchQueries);
getInTouchRouter.get('/:id', getGetInTouchQueryById);
getInTouchRouter.post('/', createGetInTouchQuery);
getInTouchRouter.put('/:id', updateGetInTouchQuery);
getInTouchRouter.delete('/:id', deleteGetInTouchQuery);

