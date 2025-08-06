import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from '@prisma/client';
// import { UserStatusEnum } from '../../common/enums/user.enum';
import { ActivitiesGateway } from '../user-activities/activities.gateway';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly activitiesGateway: ActivitiesGateway,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.accountStatus !== AccountStatus.ACTIVE) {
      return null;
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) return null;

    const safeUser: Record<string, any> = { ...user };
    delete safeUser.password;

    return safeUser;
  }

  login(user: {
    id: string | number;
    email: string;
    role: string;
    lastSeen: Date | null | undefined;
  }) {
    if (user.lastSeen) {
      setTimeout(() => {
        void this.activitiesGateway.sendReplay(Number(user.id), user.lastSeen!);
      }, 2000);
    }

    // await this.usersService.setStatus(Number(user.id), UserStatusEnum.ONLINE);

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}
