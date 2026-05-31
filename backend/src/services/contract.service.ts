import { getContractModel } from '../models/Contract';
import { getReservationModel } from '../models/Reservation';
import { generateContractPDF } from './pdf.service';
import { AppError } from '../utils/AppError';
import { generateSequentialId } from '../utils/generateId';
import { uploadPdfBuffer } from '../utils/pdfUpload';
import { APIFeatures } from '../utils/apiFeatures';

export async function generateContractForReservation(reservationId: string) {
  const Contract = getContractModel();
  const Reservation = getReservationModel();

  const existing = await Contract.findOne({ reservation: reservationId });
  if (existing) return existing;

  const reservation = await Reservation.findById(reservationId)
    .populate('vehicle', 'brand model year licensePlate category')
    .populate('client', 'firstName lastName idType idNumber phone address')
    .populate('agent', 'name');

  if (!reservation) {
    throw new AppError('Reservation not found', 404, 'RESERVATION_NOT_FOUND');
  }

  if (!['confirmed', 'active'].includes(reservation.status)) {
    throw new AppError(
      'Contract can only be generated for confirmed or active reservations',
      400,
      'INVALID_STATUS',
    );
  }

  const contractNumber = await generateSequentialId('CTR');
  const pdfBuffer = await generateContractPDF(
    reservation.toObject() as unknown as Parameters<typeof generateContractPDF>[0],
  );
  const pdfUrl = await uploadPdfBuffer(pdfBuffer, 'contracts', `${contractNumber}.pdf`);

  return Contract.create({
    contractNumber,
    reservation: reservation._id,
    pdfUrl,
    generatedAt: new Date(),
  });
}

export async function listContracts(query: Record<string, string | undefined>) {
  const Contract = getContractModel();
  const features = new APIFeatures(
    Contract.find().populate({
      path: 'reservation',
      select: 'reservationNumber status client',
      populate: { path: 'client', select: 'firstName lastName' },
    }),
    query,
  )
    .sort()
    .limitFields()
    .paginate();

  const contracts = await features.query;
  const total = await features.paginationResult!.totalCountPromise;
  const limit = features.paginationResult!.limit;
  const skip = features.paginationResult!.skip;

  return {
    contracts,
    results: contracts.length,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: Math.floor(skip / limit) + 1,
  };
}

export async function getContractById(id: string) {
  const Contract = getContractModel();
  const contract = await Contract.findById(id).populate({
    path: 'reservation',
    populate: [{ path: 'vehicle' }, { path: 'client' }, { path: 'agent', select: 'name email' }],
  });
  if (!contract) throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
  return contract;
}

export async function getContractByReservation(reservationId: string) {
  const Contract = getContractModel();
  const contract = await Contract.findOne({ reservation: reservationId }).populate({
    path: 'reservation',
    populate: [{ path: 'vehicle' }, { path: 'client' }],
  });
  if (!contract) throw new AppError('Contract not found', 404, 'CONTRACT_NOT_FOUND');
  return contract;
}
