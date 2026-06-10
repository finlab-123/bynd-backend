
import HomeLoanModel from '../model/loantype/homeloan.js';
import VehicleLoanModel from '../model/loantype/vehicleloan.js';
import LoanAgainstShareModel from '../model/loantype/loanagainstshare.js';
import SupplyChainModel from '../model/loantype/supplychain.js';
import educationSchema from '../model/loantype/educationloan.js';
import medicalSchema from '../model/loantype/medicalloan.js';
import LoanAgainstPropertySchema from '../model/loantype/loanagainstproperty.js';
import CreditCardModel from '../model/productAndinsurence/creditcard.js';
import EquityModel from '../model/productAndinsurence/equity.js';
import MutualFundModel from '../model/productAndinsurence/mutualfund.js';
import LifeInsuranceModel from '../model/productAndinsurence/lifeinsurence.js';
import GeneralInsuranceModel from '../model/productAndinsurence/generalInsurence.js';;
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    let user = null;

    const allModels = [
      HomeLoanModel, VehicleLoanModel,  LoanAgainstShareModel, 
      SupplyChainModel, CreditCardModel,    EquityModel, 
      MutualFundModel,  LifeInsuranceModel, GeneralInsuranceModel,
        educationSchema, medicalSchema,     LoanAgainstPropertySchema
    ];

    for (const Model of allModels) {
      user = await Model.findById(id);
      if (user) break;
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User/Lead not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details fetched successfully",
      data: user
    });

  } catch (error) {
    console.error("Error in getUserDetails:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};