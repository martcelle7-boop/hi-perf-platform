import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface AuthResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
    clientId: number | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        client: {
          include: {
            clientNetworks: {
              include: {
                network: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Determine primary network (first one from client networks, or default to 1)
    const primaryNetworkId = user.client?.clientNetworks?.[0]?.networkId || 1;

    // Generate JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      networkId: primaryNetworkId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        clientId: user.clientId,
      },
    };
  }
}
