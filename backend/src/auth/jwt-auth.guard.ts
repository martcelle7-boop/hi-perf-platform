import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers?.authorization;
    if (!auth) throw new UnauthorizedException('Missing Authorization header');

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    const token = parts[1];
    try {
      const payload: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'supersecretkey',
      });

      // Attach user to request (lightweight)
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, role: true, clientId: true },
      });

      if (!user) throw new UnauthorizedException('User not found');

      req.user = { ...user, networkId: payload.networkId || null };
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
