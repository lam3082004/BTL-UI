import { BadRequestException, Injectable } from '@nestjs/common';
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
    const googleId = googleProfile?.id;
    const email = googleProfile?.emails?.[0]?.value;
    const displayName = googleProfile?.displayName || email;
    const avatarUrl = googleProfile?.photos?.[0]?.value;

    if (!googleId || !email) {
      throw new BadRequestException('Google account did not provide the required profile information');
    }

    let parent = await this.parentRepository.findOne({
      where: [{ googleId }, { email }],
    });

    if (!parent) {
      parent = this.parentRepository.create({
        googleId,
        email,
        name: displayName,
        avatarUrl,
      });
      await this.parentRepository.save(parent);
    } else {
      parent.googleId = googleId;
      parent.email = email;
      parent.name = displayName;
      parent.avatarUrl = avatarUrl || parent.avatarUrl;
      await this.parentRepository.save(parent);
    }

    return parent;
  }

  generateJwt(parent: Parent): string {
    const payload = {
      sub: parent.id,
      email: parent.email,
      name: parent.name,
      googleId: parent.googleId,
      avatarUrl: parent.avatarUrl,
    };
    return this.jwtService.sign(payload);
  }

  async validateJwt(payload: any): Promise<Parent | null> {
    return this.parentRepository.findOne({
      where: { id: payload.sub },
    });
  }

  async updateSettings(
    parentId: string,
    settings: { soundEnabled?: boolean; animationsEnabled?: boolean; questionsPerLesson?: number },
  ): Promise<Parent> {
    const parent = await this.parentRepository.findOne({ where: { id: parentId } });
    if (!parent) {
      throw new BadRequestException('Parent not found');
    }
    if (settings.soundEnabled !== undefined) {
      parent.soundEnabled = settings.soundEnabled;
    }
    if (settings.animationsEnabled !== undefined) {
      parent.animationsEnabled = settings.animationsEnabled;
    }
    if (settings.questionsPerLesson !== undefined) {
      parent.questionsPerLesson = settings.questionsPerLesson;
    }
    return this.parentRepository.save(parent);
  }
}
