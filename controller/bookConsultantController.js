import BookConsultantModel from '../model/bookconsultent.js';


export const getAllBookConsultants = async (req, res) => {
  try {
    const consultants = await BookConsultantModel.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: 'Book consultants fetched successfully',
      data: consultants
    });
  } catch (error) {
    console.error('Error fetching book consultants:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const getBookConsultantById = async (req, res) => {
  try {
    const { id } = req.params;
    const consultant = await BookConsultantModel.findById(id);
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Book consultant not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Book consultant fetched successfully',
      data: consultant
    });
  } catch (error) {
    console.error('Error fetching book consultant:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const createBookConsultant = async (req, res) => {
  try {
    const { fullname, email, phone, city, state, message } = req.body;

    if (!fullname || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'fullname, email, and phone are required'
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

  const findExisting = await BookConsultantModel.findOne({ email });
  if (findExisting) {
    return res.status(400).json({
      success: false,
      message: 'A book consultant with this email already exists'
    });
  }
    const newConsultant = new BookConsultantModel({
      fullname,
      email,
      phone,
      city,
      state,
      message
    });

    await newConsultant.save();
    return res.status(201).json({
      success: true,
      message: 'Book consultant created successfully',
      data: newConsultant
    });
  } catch (error) {
    console.error('Error creating book consultant:', error);
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


export const updateBookConsultant = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedConsultant = await BookConsultantModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updatedConsultant) {
      return res.status(404).json({
        success: false,
        message: 'Book consultant not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Book consultant updated successfully',
      data: updatedConsultant
    });
  } catch (error) {
    console.error('Error updating book consultant:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


export const deleteBookConsultant = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedConsultant = await BookConsultantModel.findByIdAndDelete(id);
    if (!deletedConsultant) {
      return res.status(404).json({
        success: false,
        message: 'Book consultant not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Book consultant deleted successfully',
      data: deletedConsultant
    });
  } catch (error) {
    console.error('Error deleting book consultant:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

