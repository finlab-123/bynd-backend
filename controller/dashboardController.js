import HomeLoanModel from '../model/loantype/homeloan.js';
import VehicleLoanModel from '../model/loantype/vehicleloan.js';
import LoanAgainstPropertyModel from '../model/loantype/loanagainstproperty.js';
import LoanAgainstShareModel from '../model/loantype/loanagainstshare.js';
import SupplyChainModel from '../model/loantype/supplychain.js';
import MedicalLoanModel from '../model/loantype/medicalloan.js';
import EducationLoanModel from '../model/loantype/educationloan.js';
import CreditCardModel from '../model/productAndinsurence/creditcard.js';
import EquityModel from '../model/productAndinsurence/equity.js';
import MutualFundModel from '../model/productAndinsurence/mutualfund.js';
import LifeInsuranceModel from '../model/productAndinsurence/lifeinsurence.js';
import GeneralInsuranceModel from '../model/productAndinsurence/generalInsurence.js';

const allModels = [
  HomeLoanModel,
  VehicleLoanModel,
  LoanAgainstPropertyModel,
  LoanAgainstShareModel,
  SupplyChainModel,
  MedicalLoanModel,
  EducationLoanModel,
  CreditCardModel,
  EquityModel,
  MutualFundModel,
  LifeInsuranceModel,
  GeneralInsuranceModel
];

export const dashboardController = async (req, res) => {
  try {
    const allData = await Promise.all(
      allModels.map(model => model.find().sort({ createdAt: -1 }).lean())
    );

    const allLeads = allData
      .flat()
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({
      message: "All leads fetched successfully",
      total: allLeads.length,
      data: allLeads
    });
  } catch (error) {
    console.error("Error in dashboardController:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const statsController = async (req, res) => {
  try {
    const counts = await Promise.all(allModels.map(model => model.countDocuments().catch(() => 0)));
    const totalLeads = counts.reduce((sum, count) => sum + count, 0);

    const statusCounts = await Promise.all(
      allModels.map(model =>
        Promise.all([
          model.countDocuments({ status: 'Pending' }).catch(() => 0),
          model.countDocuments({ status: 'Approved' }).catch(() => 0),
          model.countDocuments({ status: 'In Progress' }).catch(() => 0),
          model.countDocuments({ status: 'Rejected' }).catch(() => 0)
        ])
      )
    );

    let pending = 0, approved = 0, inProgress = 0, rejected = 0;
    statusCounts.forEach(([p, a, i, r]) => {
      pending += p;
      approved += a;
      inProgress += i;
      rejected += r;
    });

    const distributionMap = {};
    const leadDocuments = await Promise.all(
      allModels.map(model => model.find({}, 'productCategory').lean().catch(() => []))
    );

    leadDocuments.flat().filter(Boolean).forEach(doc => {
      const categoryName = doc.productCategory || "Uncategorized";
      distributionMap[categoryName] = (distributionMap[categoryName] || 0) + 1;
    });

    const distributionData = Object.keys(distributionMap).map(key => ({
      name: key,
      value: distributionMap[key]
    }));

    return res.status(200).json({
      total: totalLeads,
      pending,
      approved,
      inProgress,
      rejected,
      distribution: distributionData
    });
  } catch (error) {
    console.error("Error in statsController:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const seedController = async (req, res) => {
  try {
    const { force } = req.query;
    if (force === '1') {
      await Promise.all(allModels.map(model => model.deleteMany({})));
      return res.status(200).json({ message: "All product collections dropped cleanly" });
    }
    return res.status(200).json({ message: "No actions applied" });
  } catch (error) {
    console.error("Error in seedController:", error);
    return res.status(500).json({ message: "Seeding error" });
  }
};

export const getLeadsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const allData = await Promise.all(
      allModels.map(model => model.find({ status }).sort({ createdAt: -1 }).lean().catch(() => []))
    );
    const leads = allData.flat().filter(Boolean).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({ 
      message: `Leads with status ${status} fetched`, 
      data: leads 
    });
  } catch (error) {
    console.error("Error in getLeadsByStatus:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getLeadsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const allData = await Promise.all(
      allModels.map(model => model.find({ productCategory: category }).sort({ createdAt: -1 }).lean().catch(() => []))
    );
    const leads = allData.flat().filter(Boolean).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({ 
      message: `Leads with category ${category} fetched`, 
      data: leads 
    });
  } catch (error) {
    console.error("Error in getLeadsByCategory:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getLeadsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Missing required query parameters: startDate and endDate" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const allData = await Promise.all(
      allModels.map(model => 
        model.find({
          createdAt: { $gte: start, $lte: end }
        }).sort({ createdAt: -1 }).lean().catch(() => [])
      )
    );
    const leads = allData.flat().filter(Boolean).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return res.status(200).json({ 
      message: "Leads within date range fetched", 
      data: leads
    });
  } catch (error) {
    console.error("Error in getLeadsByDateRange:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};