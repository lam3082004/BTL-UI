import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/parent-dashboard?token=${token}`);
  }

  // Development helper: simulate Google callback without real Google OAuth
  // Usage: /auth/dev/google?email=test%40example.com&name=Test%20Parent
  @Get('dev/google')
  async devGoogleCallback(@Req() req: Request, @Res() res: Response) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).send('Not found');
    }

    const email = (req.query.email as string) || 'dev.parent@example.com';
    const name = (req.query.name as string) || 'Dev Parent';

    const mockProfile = {
      id: `dev-${email}`,
      displayName: name,
      emails: [{ value: email }],
    };

    const parent = await this.authService.validateOrCreateParent(mockProfile as any);
    const token = this.authService.generateJwt(parent);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';
    res.redirect(`${frontendUrl}/parent-dashboard?token=${token}`);
  }
}
