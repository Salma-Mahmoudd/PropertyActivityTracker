import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  /**
   * Validate user credentials for local authentication
   * @param userEmail - User's email address
   * @param userPassword - User's password
   * @returns User object without password
   * @throws UnauthorizedException if credentials are invalid
   */
  async validate(userEmail: string, userPassword: string) {
    const validatedUser = await this.authService.validateUserCredentials(
      userEmail,
      userPassword,
    );

    if (!validatedUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return validatedUser;
  }
}
