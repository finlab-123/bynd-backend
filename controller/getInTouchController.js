import GetInTouchModel from '../model/getInTouch.js';


export const getAllGetInTouchQueries = async (req, res) => {
  try {
    const queries = await GetInTouchModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ 
      success: true,
      message: 'Get in touch queries fetched successfully', 
      data: queries 
    });
  } catch (error) {
    console.error('Error fetching get in touch queries:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};


export const getGetInTouchQueryById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = await GetInTouchModel.findById(id);
    if (!query) {
      return res.status(404).json({ 
        success: false,
        message: 'Get in touch query not found' 
      });
    }
    return res.status(200).json({ 
      success: true,
      message: 'Get in touch query fetched successfully', 
      data: query 
    });
  } catch (error) {
    console.error('Error fetching get in touch query:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};


export const createGetInTouchQuery = async (req, res) => {
  try {
    const { fullname, email, phone, city, message } = req.body;
    
    if (!fullname || !email || !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'fullname, email, and phone are required' 
      });
    }

    const newQuery = new GetInTouchModel({
      fullname,
      email,
      phone,
      city,
      message
    });
    
    const existingQuery = await GetInTouchModel.findOne({ email });
    if (existingQuery) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    await newQuery.save();
    return res.status(201).json({ 
      success: true,
      message: 'Get in touch query created successfully', 
      data: newQuery 
    });
  } catch (error) {
    console.error('Error creating get in touch query:', error);
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
};


export const updateGetInTouchQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuery = await GetInTouchModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedQuery) {
      return res.status(404).json({ 
        success: false,
        message: 'Get in touch query not found' 
      });
    }
    return res.status(200).json({ 
      success: true,
      message: 'Get in touch query updated successfully', 
      data: updatedQuery 
    });
  } catch (error) {
    console.error('Error updating get in touch query:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};


export const deleteGetInTouchQuery = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuery = await GetInTouchModel.findByIdAndDelete(id);
    if (!deletedQuery) {
      return res.status(404).json({ 
        success: false,
        message: 'Get in touch query not found' 
      });
    }
    return res.status(200).json({ 
      success: true,
      message: 'Get in touch query deleted successfully', 
      data: deletedQuery 
    });
  } catch (error) {
    console.error('Error deleting get in touch query:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

