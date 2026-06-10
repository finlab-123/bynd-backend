import CreditCardModel from '../model/productAndinsurence/creditcard.js';
import EquityModel from '../model/productAndinsurence/equity.js';
import MutualFundModel from '../model/productAndinsurence/mutualfund.js';
import LifeInsuranceModel from '../model/productAndinsurence/lifeinsurence.js';
import GeneralInsuranceModel from '../model/productAndinsurence/generalInsurence.js';
import { assignLeadByCategory } from '../services/assignmentService.js';

const createCrudOperations = (Model, modelName) => ({
  getAll: async (req, res) => {
    try {
      const data = await Model.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: `All ${modelName} fetched successfully`,
        data
      });
    } catch (error) {
      console.error(`Error fetching ${modelName}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Model.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${modelName} not found`
        });
      }
      return res.status(200).json({
        success: true,
        message: `${modelName} fetched successfully`,
        data: item
      });
    } catch (error) {
      console.error(`Error fetching ${modelName}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  create: async (req, res) => {
    try {
      const newItem = new Model(req.body);

      // FIX: Added auto assignment trigger for insurance and asset options
      if (newItem.productCategory) {
        await assignLeadByCategory(newItem);
      }

      if (newItem.email) {
        const existingItem = await Model.findOne({ email: newItem.email }).select('_id email');
        if (existingItem) {
          return res.status(409).json({
            success: false,
            message: 'Email already exists'
          });
        }
      }
      await newItem.save();
      return res.status(201).json({
        success: true,
        message: `${modelName} created successfully`,
        data: newItem
      });
    } catch (error) {
      console.error(`Error creating ${modelName}:`, error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updatedItem = await Model.findByIdAndUpdate(
        id,
        { $set: req.body },
        { returnDocument: 'after', runValidators: true }
      );
      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: `${modelName} not found`
        });
      }
      return res.status(200).json({
        success: true,
        message: `${modelName} updated successfully`,
        data: updatedItem
      });
    } catch (error) {
      console.error(`Error updating ${modelName}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedItem = await Model.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({
          success: false,
          message: `${modelName} not found`
        });
      }
      return res.status(200).json({
        success: true,
        message: `${modelName} deleted successfully`,
        data: deletedItem
      });
    } catch (error) {
      console.error(`Error deleting ${modelName}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});


export const creditCardControllers = createCrudOperations(CreditCardModel, 'Credit Card');


export const equityControllers = createCrudOperations(EquityModel, 'Equity');


export const mutualFundControllers = createCrudOperations(MutualFundModel, 'Mutual Fund');


export const lifeInsuranceControllers = createCrudOperations(LifeInsuranceModel, 'Life Insurance');


export const generalInsuranceControllers = createCrudOperations(GeneralInsuranceModel, 'General Insurance');

