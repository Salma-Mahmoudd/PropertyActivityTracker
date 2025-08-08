import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  /**
   * Validate JWT payload and return user data
   * @param jwtPayload - JWT payload containing user information
   * @returns User data extracted from JWT payload
   */
  validate(jwtPayload: { sub: string | number; email: string; role: string }) {
    return {
      id: Number(jwtPayload.sub),
      email: jwtPayload.email,
      role: jwtPayload.role,
    };
  }
}
