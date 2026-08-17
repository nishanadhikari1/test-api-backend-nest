import { Test, TestingModule } from '@nestjs/testing';
import { CookiejarController } from './cookiejar.controller';

describe('CookiejarController', () => {
  let controller: CookiejarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CookiejarController],
    }).compile();

    controller = module.get<CookiejarController>(CookiejarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
