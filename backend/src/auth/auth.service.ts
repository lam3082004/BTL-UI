import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from '../entities/parent.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    private jwtService: JwtService,
  ) {}

  async validateOrCreateParent(googleProfile: any): Promise<Parent> {
    const { id, displayName, emails } = googleProfile;
    const email = emails[0].value;

    let parent = await this.parentRepository.findOne({
      where: { googleId: id },
    });

    if (!parent) {
      parent = this.parentRepository.create({
        googleId: id,
        email,
        name: displayName,
      });
      await this.parentRepository.save(parent);
    }

    return parent;
  }

  generateJwt(parent: Parent): string {
    const payload = { sub: parent.id, email: parent.email };
    return this.jwtService.sign(payload);
  }

  async validateJwt(payload: any): Promise<Parent | null> {
    return this.parentRepository.findOne({
      where: { id: payload.sub },
    });
  }
}
