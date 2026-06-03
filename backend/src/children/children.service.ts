import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child, MathOperation } from '../entities/child.entity';
import { Parent } from '../entities/parent.entity';
import { CreateChildDto, UpdateChildConfigDto, UpdateChildDto } from './dto';

@Injectable()
export class ChildrenService implements OnModuleInit {
  private readonly currentConfigVersion = 2;

  constructor(
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
  ) {}

  async onModuleInit() {
    const allowDemoSeed =
      process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_DATA === 'true';
    if (!allowDemoSeed) {
      return;
    }

    const childCount = await this.childRepository.count();
    if (childCount > 0) {
      await this.migrateExistingChildConfigs();
      return;
    }

    const demoParent = this.parentRepository.create({
      googleId: 'demo-parent',
      email: 'demo@numsense.local',
      name: 'Demo Parent',
    });
    const savedParent = await this.parentRepository.save(demoParent);

    await this.childRepository.save(
      this.childRepository.create([
        {
          name: 'Bé Minh',
          avatar: '👧',
          parentId: savedParent.id,
          minNumber: 1,
          maxNumber: 10,
          allowedOperations: ['COUNTING', 'ADDITION'],
          configVersion: this.currentConfigVersion,
        },
        {
          name: 'Bé Hùng',
          avatar: '👦',
          parentId: savedParent.id,
          minNumber: 1,
          maxNumber: 12,
          allowedOperations: ['COUNTING', 'ADDITION', 'SUBTRACTION'],
          configVersion: this.currentConfigVersion,
        },
      ]),
    );
  }

  private async migrateExistingChildConfigs() {
    const children = await this.childRepository.find();
    const outdatedChildren = children.filter((child) => (child.configVersion || 1) < this.currentConfigVersion);

    if (!outdatedChildren.length) {
      return;
    }

    await this.childRepository.save(
      outdatedChildren.map((child) => {
        const numberConfig = this.normalizeNumberConfig(child.minNumber, child.maxNumber);
        return {
          ...child,
          ...numberConfig,
          allowedOperations: this.normalizeAllowedOperations([
            'COUNTING',
            ...(child.allowedOperations || []),
          ]),
          configVersion: this.currentConfigVersion,
        };
      }),
    );
  }

  private normalizeAllowedOperations(allowedOperations?: string[]): string[] {
    const normalized = (allowedOperations || ['COUNTING', 'ADDITION']).filter(op => typeof op === 'string' && op.length > 0);
    return normalized.length ? Array.from(new Set(normalized)) : ['COUNTING', 'ADDITION'];
  }

  private normalizeNumberConfig(minNumber?: number, maxNumber?: number) {
    const rawMin = Number.isFinite(minNumber) ? Number(minNumber) : 1;
    const rawMax = Number.isFinite(maxNumber) ? Number(maxNumber) : 10;
    const min = Math.max(1, Math.min(12, Math.floor(Math.min(rawMin, rawMax))));
    const max = Math.max(min, Math.min(12, Math.floor(Math.max(rawMin, rawMax))));
    return { minNumber: min, maxNumber: max };
  }

  async createChild(parentId: string, createChildDto: CreateChildDto): Promise<Child> {
    const numberConfig = this.normalizeNumberConfig(createChildDto.minNumber, createChildDto.maxNumber);
    const name = createChildDto.name.trim();
    if (!name) {
      throw new BadRequestException('Child name cannot be empty');
    }

    const child = this.childRepository.create({
      name,
      avatar: createChildDto.avatar,
      ...numberConfig,
      parentId,
      allowedOperations: this.normalizeAllowedOperations(createChildDto.allowedOperations),
      configVersion: this.currentConfigVersion,
    });
    return this.childRepository.save(child);
  }

  async getChildrenByParentId(parentId: string): Promise<Child[]> {
    return this.childRepository.find({
      where: { parentId },
      order: { createdAt: 'DESC' },
    });
  }

  async getDemoChildren(): Promise<Child[]> {
    return this.childRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async getChildById(childId: string): Promise<Child> {
    const child = await this.childRepository.findOne({ where: { id: childId } });
    if (!child) {
      throw new NotFoundException(`Child with ID ${childId} not found`);
    }
    return child;
  }

  async getChildByIdForParent(childId: string, parentId: string): Promise<Child> {
    const child = await this.getChildById(childId);
    this.verifyOwnership(child, parentId);
    return child;
  }

  async updateChild(childId: string, parentId: string, updateChildDto: UpdateChildDto): Promise<Child> {
    const child = await this.getChildById(childId);
    this.verifyOwnership(child, parentId);

    if (updateChildDto.name !== undefined) {
      const nextName = updateChildDto.name.trim();
      if (!nextName) {
        throw new BadRequestException('Child name cannot be empty');
      }
      child.name = nextName;
    }

    if (updateChildDto.avatar !== undefined) {
      child.avatar = updateChildDto.avatar;
    }

    return this.childRepository.save(child);
  }

  async updateChildConfig(
    childId: string,
    parentId: string,
    updateConfigDto: UpdateChildConfigDto,
  ): Promise<Child> {
    const child = await this.getChildById(childId);

    this.verifyOwnership(child, parentId);

    const nextNumberConfig = this.normalizeNumberConfig(
      updateConfigDto.minNumber ?? child.minNumber,
      updateConfigDto.maxNumber ?? child.maxNumber,
    );

    Object.assign(child, {
      ...updateConfigDto,
      ...nextNumberConfig,
      allowedOperations: this.normalizeAllowedOperations(updateConfigDto.allowedOperations ?? child.allowedOperations),
      configVersion: this.currentConfigVersion,
    });
    return this.childRepository.save(child);
  }

  async deleteChild(childId: string, parentId: string): Promise<void> {
    const child = await this.getChildById(childId);

    this.verifyOwnership(child, parentId);

    await this.childRepository.remove(child);
  }

  private verifyOwnership(child: Child, parentId: string) {
    if (child.parentId !== parentId) {
      throw new BadRequestException('Unauthorized to access this child');
    }
  }
}
