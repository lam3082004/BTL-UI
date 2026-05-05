import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Child, MathOperation } from '../entities/child.entity';
import { Parent } from '../entities/parent.entity';
import { CreateChildDto, UpdateChildConfigDto } from './dto';

@Injectable()
export class ChildrenService implements OnModuleInit {
  constructor(
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
  ) {}

  async onModuleInit() {
    const childCount = await this.childRepository.count();
    if (childCount > 0) {
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
          allowedOperations: [MathOperation.ADDITION],
        },
        {
          name: 'Bé Hùng',
          avatar: '👦',
          parentId: savedParent.id,
          minNumber: 1,
          maxNumber: 20,
          allowedOperations: [MathOperation.ADDITION, MathOperation.SUBTRACTION],
        },
      ]),
    );
  }

  async createChild(parentId: string, createChildDto: CreateChildDto): Promise<Child> {
    const child = this.childRepository.create({
      ...createChildDto,
      parentId,
      allowedOperations: createChildDto.allowedOperations || [MathOperation.ADDITION],
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

  async updateChildConfig(
    childId: string,
    parentId: string,
    updateConfigDto: UpdateChildConfigDto,
  ): Promise<Child> {
    const child = await this.getChildById(childId);

    // Verify ownership
    if (child.parentId !== parentId) {
      throw new BadRequestException('Unauthorized to update this child');
    }

    Object.assign(child, updateConfigDto);
    return this.childRepository.save(child);
  }

  async deleteChild(childId: string, parentId: string): Promise<void> {
    const child = await this.getChildById(childId);

    // Verify ownership
    if (child.parentId !== parentId) {
      throw new BadRequestException('Unauthorized to delete this child');
    }

    await this.childRepository.remove(child);
  }
}
