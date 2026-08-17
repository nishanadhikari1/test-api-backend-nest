import { Module } from '@nestjs/common';
import { CookieJarService } from './cookiejar.service';
import { CookieJarController } from './cookiejar.controller';

@Module({
  providers: [CookieJarService],
  controllers: [CookieJarController]
})
export class CookieJarModule {}
