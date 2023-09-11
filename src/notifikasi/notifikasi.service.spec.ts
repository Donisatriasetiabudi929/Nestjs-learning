import { Test, TestingModule } from '@nestjs/testing';
import { NotifikasiService } from './notifikasi.service';

describe('NotifikasiService', () => {
  let service: NotifikasiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotifikasiService],
    }).compile();

    service = module.get<NotifikasiService>(NotifikasiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
