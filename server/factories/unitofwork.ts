import { prisma } from 'server/lib/prisma';
import { UnitOfWork } from 'server/repositories/unitofwork';

export function getUnitOfWork() {
  return new UnitOfWork(prisma);
}
