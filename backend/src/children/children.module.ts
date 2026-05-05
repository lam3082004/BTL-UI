import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChildrenController } from './children.controller';
import { ChildrenService } from './children.service';
import { Child } from '../entities/child.entity';
import { Parent } from '../entities/parent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Child, Parent])],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
