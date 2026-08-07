import {
  Post,
  Res,
  Body,
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import type { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setAuthCookies(res: Response, token: string) {
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
      maxAge: 86400000,
    };
    res.cookie('token', token, cookieOptions);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.registerUser(dto);
    this.setAuthCookies(res, result.token);
    res.status(201).json(result.user);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authService.loginUser(dto);
    this.setAuthCookies(res, result.token);
    res.status(200).json(result.user);
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    const clearOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
    };
    res.clearCookie('token', clearOptions);
    res.status(200).json({ message: 'Logged out' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any, @Res() res: Response) {
    const userId = (req.user as any).userId;
    const user = await this.authService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user });
  }
}
