import DonutSegment from '../models/DonutSegment.js';

export const getDonutSegments = async () => {
  return DonutSegment.find().sort({ ring: 1, order: 1, createdAt: 1 });
};

export const getDonutSegmentById = async (id) => {
  const segment = await DonutSegment.findById(id);
  if (!segment) {
    throw new Error('Donut segment not found');
  }
  return segment;
};

export const createDonutSegment = async (data) => {
  const segment = new DonutSegment(data);
  await segment.save();
  return segment;
};

export const updateDonutSegment = async (id, updates) => {
  const segment = await DonutSegment.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!segment) {
    throw new Error('Donut segment not found');
  }
  return segment;
};

export const deleteDonutSegment = async (id) => {
  const segment = await DonutSegment.findByIdAndDelete(id);
  if (!segment) {
    throw new Error('Donut segment not found');
  }
  return segment;
};
