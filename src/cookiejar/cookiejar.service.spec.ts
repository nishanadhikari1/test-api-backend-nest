import { Test, TestingModule } from '@nestjs/testing';
import { CookiejarService } from './cookiejar.service';

describe('CookiejarService', () => {
  let service: CookiejarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CookiejarService],
    }).compile();

    service = module.get<CookiejarService>(CookiejarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
