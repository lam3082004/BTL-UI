import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const normalizeUrl = (value: string) => value.trim().replace(/\/$/, '');

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const parent = await this.authService.validateOrCreateParent(req.user);
    const token = this.authService.generateJwt(parent);

    // Redirect to frontend with JWT token
    const frontendUrl =
      process.env.FRONTEND_PUBLIC_URL ||
      process.env.FRONTEND_URL ||
      process.env.FRONTEND_URLS?.split(',')?.[0]?.trim() ||
      'http://localhost:5173';
    res.redirect(`${normalizeUrl(frontendUrl)}/parent-dashboard?token=${encodeURIComponent(token)}`);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: any) {
    const { id, email, name, googleId, createdAt } = req.user;
    return { id, email, name, googleId, createdAt };
  }
}
