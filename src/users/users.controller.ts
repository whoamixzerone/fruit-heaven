import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JoinRequestDto } from './dto/join.request.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignInRequestDto } from './dto/sign-in.request.dto';
import { AuthService } from '../auth/auth.service';
import { UserDto } from './dto/user.dto';
import { User } from '../common/decorators/user.decorator';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access-auth.guard';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Post('join')
  async join(@Body() joinRequestDto: JoinRequestDto): Promise<string> {
    const existEmail = await this.usersService.findByEmail(
      joinRequestDto.email,
    );
    if (existEmail) {
      throw new ConflictException('사용중인 이메일입니다.');
    }

    const existCellPhone = await this.usersService.findByCellphone(
      joinRequestDto.cellPhone,
    );
    if (existCellPhone) {
      throw new ConflictException('사용중인 핸드폰입니다.');
    }

    const result = this.usersService.join(joinRequestDto);
    if (result) {
      return 'ok';
    } else {
      throw new ForbiddenException();
    }
  }

  @Post('login')
  async signIn(
    @Body() signInRequestDto: SignInRequestDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const user: UserDto = await this.authService.validateUser(
      signInRequestDto.email,
      signInRequestDto.password,
    );
    const accessToken: string = await this.authService.generateAccessToken(
      user,
    );
    const refreshToken: string = await this.authService.generateRefreshToken(
      user,
    );

    await this.cacheManager.set(`refresh_token:${user.id}`, refreshToken);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  @UseGuards(JwtAccessAuthGuard)
  @Get('profile')
  getProfile(@User() user: UserDto): UserDto {
    return user;
  }

  @Post('/logout')
  signOut() {
    // todo : redis refresh_token delete
    return '';
  }

  @Get()
  findAllUser() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOneUser(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Patch(':id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Post('address')
  create(@Body() createUserDto: JoinRequestDto) {
    return this.usersService.create(createUserDto);
  }
}
