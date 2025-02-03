import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common'
import { Public } from 'src/auth/decorator/public.decorator'
import { RBAC } from 'src/auth/decorator/rbac.decorator'
import { Role } from 'src/users/entities/user.entity'
import { DirectorService } from './director.service'
import { CreateDirectorDto } from './dto/create-director.dto'
import { UpdateDirectorDto } from './dto/update-director.dto'

@Controller('director')
export class DirectorController {
  constructor(private readonly directorService: DirectorService) {}

  @Get()
  @Public()
  findAll() {
    return this.directorService.findAll()
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.directorService.findOne(+id)
  }

  @Post()
  @RBAC(Role.ADMIN)
  create(@Body() createDirectorDto: CreateDirectorDto) {
    return this.directorService.create(createDirectorDto)
  }

  @Patch(':id')
  @RBAC(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateDirectorDto: UpdateDirectorDto) {
    return this.directorService.update(+id, updateDirectorDto)
  }

  @Delete(':id')
  @RBAC(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.directorService.remove(+id)
  }
}
