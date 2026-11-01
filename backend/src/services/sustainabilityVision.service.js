import SustainabilityVision from '../models/SustainabilityVision.js';

const throwNotFound = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  throw error;
};

const throwBadRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
};

export const getSustainabilityVisions = async () => {
  return SustainabilityVision.find().sort({ createdAt: -1 });
};

export const getSustainabilityVisionById = async (id) => {
  const vision = await SustainabilityVision.findById(id);
  if (!vision) {
    throwNotFound('Sustainability vision not found');
  }
  return vision;
};

export const getSustainabilityVisionBySlug = async (slug) => {
  if (!slug || typeof slug !== 'string') {
    throwBadRequest('Sustainability vision slug is required');
  }
  const vision = await SustainabilityVision.findOne({ slug });
  if (!vision) {
    throwNotFound('Sustainability vision not found');
  }
  return vision;
};

export const createSustainabilityVision = async (data) => {
  const vision = new SustainabilityVision(data);
  await vision.save();
  return vision;
};

export const updateSustainabilityVision = async (id, updates) => {
  const vision = await SustainabilityVision.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!vision) {
    throwNotFound('Sustainability vision not found');
  }
  return vision;
};

export const deleteSustainabilityVision = async (id) => {
  const vision = await SustainabilityVision.findByIdAndDelete(id);
  if (!vision) {
    throwNotFound('Sustainability vision not found');
  }
  return vision;
};
