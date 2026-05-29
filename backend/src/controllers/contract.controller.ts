import type { Request, Response } from 'express';

import * as contractService from '../services/contract.service';
import { catchAsync } from '../utils/catchAsync';

export const generateContract = catchAsync(async (req: Request, res: Response) => {
  const contract = await contractService.generateContractForReservation(req.params.reservationId);

  res.status(201).json({
    status: 'success',
    data: {
      contract: {
        contractNumber: contract.contractNumber,
        pdfUrl: contract.pdfUrl,
        generatedAt: contract.generatedAt,
        id: contract._id,
      },
    },
  });
});

export const getContracts = catchAsync(async (req: Request, res: Response) => {
  const result = await contractService.listContracts(req.query as Record<string, string | undefined>);

  res.status(200).json({
    status: 'success',
    results: result.results,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    data: { contracts: result.contracts },
  });
});

export const getContract = catchAsync(async (req: Request, res: Response) => {
  const contract = await contractService.getContractById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { contract },
  });
});

export const getContractByReservation = catchAsync(async (req: Request, res: Response) => {
  const contract = await contractService.getContractByReservation(req.params.reservationId);

  res.status(200).json({
    status: 'success',
    data: { contract },
  });
});
