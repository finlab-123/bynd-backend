// services/assignmentService.js
import mongoose from 'mongoose';
import TeamAssignModel from '../model/teamAssign.js';

// Models
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

export const allLeadModels = [
  HomeLoanModel, VehicleLoanModel, LoanAgainstPropertyModel, LoanAgainstShareModel,
  SupplyChainModel, MedicalLoanModel, EducationLoanModel, CreditCardModel,
  EquityModel, MutualFundModel, LifeInsuranceModel, GeneralInsuranceModel
];

/**
 * Finds a lead by ID across all lead models (Required by teamAssignController)
 */
export const findLeadById = async (projectId) => {
  if (!projectId) return null;
  const id = mongoose.Types.ObjectId.isValid(projectId) ? new mongoose.Types.ObjectId(projectId) : projectId;

  for (const Model of allLeadModels) {
    try {
      const lead = await Model.findById(id);
      if (lead) return lead;
    } catch (e) {
      console.error('Error searching model', Model.modelName, e);
    }
  }
  return null;
};

/**
 * Bridges User ID and TeamAssign ID securely to guarantee dashboard visibility
 */
export const getAssignedToValuesForEmployee = async (user) => {
  if (!user) return [];

  const values = [];
  if (user._id) values.push(user._id.toString());
  if (user.id) values.push(user.id.toString());

  try {
    const teamRecord = await TeamAssignModel.findOne({ userId: user._id });
    if (teamRecord) {
      values.push(teamRecord._id.toString());
    }
  } catch (err) {
    console.error("Error linking TeamAssign ID in helper:", err);
  }

  const uniqueStrings = [...new Set(values.filter(Boolean))];
  const finalQueryValues = [];

  for (const val of uniqueStrings) {
    finalQueryValues.push(val);
    if (mongoose.Types.ObjectId.isValid(val)) {
      finalQueryValues.push(new mongoose.Types.ObjectId(val));
    }
  }
  return finalQueryValues;
};

/**
 * Limits database overhead by only querying collections matching user specializations.
 * Handles both hyphenated and spaced category matches seamlessly.
 */
export const getModelsForEmployee = (user) => {
  if (!user || !Array.isArray(user.specialization) || user.specialization.length === 0) {
    console.log("⚠️ No user specialization found. Defaulting to all lead models.");
    return allLeadModels;
  }

  // Dual mapping dictionary configuration to match strings irrespective of spaces or hyphens
  const mapping = {
    'home-loan': HomeLoanModel,
    'home loan': HomeLoanModel,
    'vehicle-loan': VehicleLoanModel,
    'vehicle loan': VehicleLoanModel,
    'loan-against-property': LoanAgainstPropertyModel,
    'loan against property': LoanAgainstPropertyModel,
    'loan-against-share': LoanAgainstShareModel,
    'loan against share': LoanAgainstShareModel,
    'supply-chain': SupplyChainModel,
    'supply chain': SupplyChainModel,
    'supply chain finance': SupplyChainModel,
    'medical-loan': MedicalLoanModel,
    'medical loan': MedicalLoanModel,
    'education-loan': EducationLoanModel,
    'education loan': EducationLoanModel,
    'credit-card': CreditCardModel,
    'credit card': CreditCardModel,
    'equity': EquityModel,
    'mutual-fund': MutualFundModel,
    'mutual fund': MutualFundModel,
    'life-insurance': LifeInsuranceModel,
    'life insurance': LifeInsuranceModel,
    'general-insurance': GeneralInsuranceModel,
    'general insurance': GeneralInsuranceModel
  };

  console.log("🎯 Employee Specializations to match:", user.specialization);

  const selectedModels = user.specialization
    .map(spec => {
      const cleanKey = spec.toLowerCase().trim();
      let matchedModel = mapping[cleanKey];
      
      // Fallback: If hyphenated array misses space notation or vice versa
      if (!matchedModel) {
        const spaceFallback = cleanKey.replace(/-+/g, ' ');
        matchedModel = mapping[spaceFallback];
      }
      
      if (!matchedModel) {
        console.error(`❌ Mapping key '${cleanKey}' did not resolve to a valid Mongoose Model structure.`);
      }
      return matchedModel;
    })
    .filter(Boolean);

  if (selectedModels.length === 0) {
    console.log("⚠️ Specialization matching resulted in 0 models. Falling back to allLeadModels.");
    return allLeadModels;
  }

  // Dedupes unique models arrays if variations resolve to the same schema file
  return [...new Set(selectedModels)];
};

/**
 * Automated assignment routing processor based on the round-robin
 * //TODO: Implement the round-robin assignment logic
 */
// export const assignLeadByCategory = async (lead) => {
//   console.log("\n=============================================");
//   console.log("🚀 [AUTO-ASSIGN SYSTEM] Function triggered!");

//   if (!lead.productCategory && lead.schema && lead.schema.paths.productCategory) {
//     lead.productCategory = lead.schema.paths.productCategory.options.default;
//     console.log("ℹ️ productCategory was missing. Fetched schema default:", lead.productCategory);
//   }

//   if (!lead || !lead.productCategory) {
//     console.log("❌ CRITICAL: Exiting assignment immediately because productCategory is completely missing!");
//     console.log("=============================================\n");
//     return lead;
//   }

//   const cleanCategory = lead.productCategory.toLowerCase().trim();
//   const hyphenated = cleanCategory.replace(/\s+/g, '-');
//   const spaced = cleanCategory.replace(/-+/g, ' ');
  
//   console.log(`🔍 Searching teamAssign collection matching parameters: ["${hyphenated}", "${spaced}", "${cleanCategory}"]`);

//   try {
//     // 1. Precise check mapping across Array storage fields 
//     let candidates = await TeamAssignModel.find({
//       status: 'Active',
//       $or: [
//         { specialization: { $in: [hyphenated, spaced, cleanCategory] } },
//         { specialization: hyphenated },
//         { specialization: spaced }
//       ]
//     }).sort({ leadCount: 1 });

//     console.log(`📊 Query Result: Found ${candidates.length} specialized agent(s).`);

//     // 2. Loose Regex search fallback
//     if (!candidates.length) {
//       console.log("⚠️ No direct match found. Running case-insensitive loose regex fallback search...");
//       candidates = await TeamAssignModel.find({
//         specialization: { $regex: new RegExp(lead.productCategory.trim(), 'i') },
//         status: 'Active'
//       }).sort({ leadCount: 1 });
//       console.log(`📊 Regex Fallback Result: Found ${candidates.length} agent(s).`);
//     }

//     // 3. Round-robin Fallback (any active team member)
//     let assignee = candidates[0];
//     if (!assignee) {
//       console.log("⚠️ No matching specialized agents. Falling back to fetching ANY active team assignment profile...");
//       assignee = await TeamAssignModel.findOne({ status: 'Active' }).sort({ leadCount: 1 });
//     }

//     if (assignee) {
//       console.log("🎯 SUCCESS! Assigned lead to Employee:", assignee.fullname);
//       console.log("🆔 Target Employee Team Record ID (_id):", assignee._id.toString());
//       console.log("🆔 Target Employee Auth Link ID (userId):", assignee.userId ? assignee.userId.toString() : "MISSING");

//       // Increment lead count tracker inside team database record
//       await TeamAssignModel.findByIdAndUpdate(assignee._id, { $inc: { leadCount: 1 } });
//       console.log(`📈 Incremented leadCount counter for ${assignee.fullname}`);

//       // Apply unified string stamps to preserve dashboard querying compatibility
//       lead.assignedTo = assignee.userId ? assignee.userId.toString() : assignee._id.toString();
//       lead.assignmentStatus = 'Assigned';
      
//       console.log("📝 Stamped lead.assignedTo with:", lead.assignedTo);
//     } else {
//       console.log("❌ ALL SELECTION METHODS FAILED: The teamAssign collection contains 0 active documents!");
//       lead.assignmentStatus = 'Unassigned';
//     }

//     console.log("=============================================\n");
//     return lead;
//   } catch (err) {
//     console.error('❌ EXCEPTION ERROR inside assignLeadByCategory:', err);
//     console.log("=============================================\n");
//     return lead;
//   }
// };

// for broadcart level assign the lead to all the employee with the same catgeory

export const assignLeadByCategory = async (lead) => {
  console.log("\n=============================================");
  console.log("🚀 [ARRAY BROADCAST SYSTEM] Function triggered!");

  if (!lead.productCategory && lead.schema && lead.schema.paths.productCategory) {
    lead.productCategory = lead.schema.paths.productCategory.options.default;
  }

  if (!lead || !lead.productCategory) {
    console.log("❌ CRITICAL: productCategory is missing!");
    return lead;
  }

  const cleanCategory = lead.productCategory.toLowerCase().trim();
  const hyphenated = cleanCategory.replace(/\s+/g, '-');
  const spaced = cleanCategory.replace(/-+/g, ' ');

  try {
    // Find ALL active employees qualified for this specialization
    const candidates = await TeamAssignModel.find({
      status: 'Active',
      $or: [
        { specialization: { $in: [hyphenated, spaced, cleanCategory] } },
        { specialization: hyphenated },
        { specialization: spaced }
      ]
    });

    console.log(`📊 Found ${candidates.length} specialized agent(s) for broadcast mapping.`);

    if (candidates.length > 0) {
      // Collect target identification strings from all matching candidates
      const assigneeIds = candidates.map(emp => 
        emp.userId ? emp.userId.toString() : emp._id.toString()
      );

      // 🌟 STEP 1: Store the entire collection of IDs as an array on the single document
      lead.assignedTo = assigneeIds; 
      lead.assignmentStatus = 'Assigned';

      // 🌟 STEP 2: Increment leadCount for all matching employees simultaneously in one database hit
      const candidateRecordIds = candidates.map(emp => emp._id);
      await TeamAssignModel.updateMany(
        { _id: { $in: candidateRecordIds } },
        { $inc: { leadCount: 1 } }
      );

      console.log(`🎯 SUCCESS! Single lead mapped to array of ${candidates.length} agents safely.`);
    } else {
      console.log("⚠️ No matching specialized agents found.");
      lead.assignedTo = [];
      lead.assignmentStatus = 'Unassigned';
    }

    return lead;
  } catch (err) {
    console.error('❌ EXCEPTION ERROR inside assignLeadByCategory:', err);
    return lead;
  }
};
/**
 * Safe single employee resolver
 */
export const resolveAssignedEmployee = async (assignedToField) => {
  if (!assignedToField) return null;
  try {
    if (typeof assignedToField === 'object') return assignedToField;
    const agent = await TeamAssignModel.findOne({
      $or: [
        { userId: mongoose.Types.ObjectId.isValid(assignedToField) ? new mongoose.Types.ObjectId(assignedToField) : null },
        { _id: mongoose.Types.ObjectId.isValid(assignedToField) ? new mongoose.Types.ObjectId(assignedToField) : null }
      ]
    });
    return agent || { fullname: "Assigned Agent", email: "agent@platform.com" };
  } catch (err) {
    return null;
  }
};

/**
 * Auto-syncs registered Auth Users with the TeamAssign collection on startup
 */
export const syncUsersToTeamAssign = async () => {
  try {
    const UserModel = mongoose.model('user');
    const employees = await UserModel.find({ role: 'employee' });

    console.log(`\n🔄 [DATABASE SYNC] Found ${employees.length} employees in the system.`);

    for (const employee of employees) {
      const exists = await TeamAssignModel.findOne({ email: employee.email.toLowerCase().trim() });

      // Ensure we preserve the full clean array structure safely
      const specsArray = Array.isArray(employee.specialization) 
        ? employee.specialization.map(s => s.toLowerCase().trim()) 
        : [String(employee.specialization).toLowerCase().trim()];

      if (!exists) {
        console.log(`➕ [SYNC] Creating teamAssign record for: ${employee.fullname} (${employee.email})`);
        
        await TeamAssignModel.create({
          fullname: employee.fullname,
          email: employee.email.toLowerCase().trim(),
          phone: employee.phone || '0000000000',
          specialization: specsArray,
          status: 'Active',
          userId: employee._id,
          leadCount: 0
        });
      } else {
        // Update specs array and link references reactively on boot restart
        exists.specialization = specsArray;
        exists.userId = employee._id;
        await exists.save();
        console.log(`🔗 [SYNC] Synchronized profile arrays and references for: ${employee.fullname}`);
      }
    }
    console.log("✅ [DATABASE SYNC] Team assignment records are fully up to date!\n");
  } catch (err) {
    console.error("❌ Error running database auto-sync:", err.message);
  }
};