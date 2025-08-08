import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials
   * @param userEmail - User's email address
   * @param userPassword - User's password
   * @returns User object without password or null if invalid
   */
  async validateUserCredentials(userEmail: string, userPassword: string) {
    const foundUser = await this.usersService.findUserByEmail(userEmail);

    if (!foundUser || foundUser.accountStatus !== AccountStatus.ACTIVE) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      userPassword,
      foundUser.password,
    );
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = foundUser;

    return userWithoutPassword;
  }

  /**
   * Login user and generate JWT token
   * @param userData - User data for login
   * @returns Access token and user information
   */
  loginUser(userData: { id: string | number; email: string; role: string }) {
    const jwtPayload = {
      sub: userData.id,
      email: userData.email,
      role: userData.role,
    };

    const accessToken = this.jwtService.sign(jwtPayload);

    return {
      access_token: accessToken,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      },
    };
  }
}
