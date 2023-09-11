import { Test, TestingModule } from '@nestjs/testing';
import { NotifikasiController } from './notifikasi.controller';

describe('NotifikasiController', () => {
  let controller: NotifikasiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotifikasiController],
    }).compile();

    controller = module.get<NotifikasiController>(NotifikasiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
