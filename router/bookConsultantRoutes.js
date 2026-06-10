import express from 'express';
import {
  getAllBookConsultants,
  getBookConsultantById,
  createBookConsultant,
  updateBookConsultant,
  deleteBookConsultant
} from '../controller/bookConsultantController.js';

export const bookConsultantRouter = express.Router();

bookConsultantRouter.get('/', getAllBookConsultants);
bookConsultantRouter.get('/:id', getBookConsultantById);
bookConsultantRouter.post('/', createBookConsultant);
bookConsultantRouter.put('/:id', updateBookConsultant);
bookConsultantRouter.delete('/:id', deleteBookConsultant);

