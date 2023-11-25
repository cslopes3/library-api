import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@shared/utils/user-role';
import { ROLE_KEY } from './role';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext) {
        const requiredRole = this.reflector.getAllAndOverride<UserRole>(
            ROLE_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRole) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        return user.role === requiredRole;
    }
}
