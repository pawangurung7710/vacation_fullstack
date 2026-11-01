import * as sustainabilityVisionService from '../services/sustainabilityVision.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';

export const getSustainabilityVisions = async (req, res, next) => {
  try {
    const visions = await sustainabilityVisionService.getSustainabilityVisions();
    return sendSuccess(res, 'Sustainability visions retrieved successfully', visions);
  } catch (error) {
    next(error);
  }
};

export const getSustainabilityVisionById = async (req, res, next) => {
  try {
    const vision = await sustainabilityVisionService.getSustainabilityVisionById(req.params.id);
    return sendSuccess(res, 'Sustainability vision retrieved successfully', vision);
  } catch (error) {
    next(error);
  }
};

export const getSustainabilityVisionBySlug = async (req, res, next) => {
  try {
    const vision = await sustainabilityVisionService.getSustainabilityVisionBySlug(req.params.slug);
    return sendSuccess(res, 'Sustainability vision retrieved successfully', vision);
  } catch (error) {
    next(error);
  }
};

export const createSustainabilityVision = async (req, res, next) => {
  try {
    const vision = await sustainabilityVisionService.createSustainabilityVision(req.body);
    return sendCreated(res, 'Sustainability vision created successfully', vision);
  } catch (error) {
    next(error);
  }
};

export const updateSustainabilityVision = async (req, res, next) => {
  try {
    const vision = await sustainabilityVisionService.updateSustainabilityVision(req.params.id, req.body);
    return sendSuccess(res, 'Sustainability vision updated successfully', vision);
  } catch (error) {
    next(error);
  }
};

export const deleteSustainabilityVision = async (req, res, next) => {
  try {
    await sustainabilityVisionService.deleteSustainabilityVision(req.params.id);
    return sendSuccess(res, 'Sustainability vision deleted successfully');
  } catch (error) {
    next(error);
  }
};

