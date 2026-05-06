import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';

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
      'http://localhost:5174';
    res.redirect(`${frontendUrl}/parent-dashboard?token=${token}`);
  }
}
