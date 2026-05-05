import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateChildDto, UpdateChildConfigDto } from './dto';
import { Child } from '../entities/child.entity';

@Controller('children')
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createChild(@Req() req: any, @Body() createChildDto: CreateChildDto): Promise<Child> {
    return this.childrenService.createChild(req.user.id, createChildDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getChildren(@Req() req: any): Promise<Child[]> {
    return this.childrenService.getChildrenByParentId(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getChildById(@Param('id') childId: string): Promise<Child> {
    return this.childrenService.getChildById(childId);
  }

  @Put(':id/config')
  @UseGuards(JwtAuthGuard)
  async updateChildConfig(
    @Param('id') childId: string,
    @Req() req: any,
    @Body() updateConfigDto: UpdateChildConfigDto,
  ): Promise<Child> {
    return this.childrenService.updateChildConfig(childId, req.user.id, updateConfigDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteChild(@Param('id') childId: string, @Req() req: any): Promise<void> {
    return this.childrenService.deleteChild(childId, req.user.id);
  }
}
