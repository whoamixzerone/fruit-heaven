import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Redirect,
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
import { ConfigService } from '@nestjs/config';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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

  @Get('profile')
  @UseGuards(JwtAccessAuthGuard)
  getProfile(@User() user: UserDto): UserDto {
    return user;
  }

  @Get('logout')
  @UseGuards(JwtAccessAuthGuard)
  @Redirect()
  async signOut(
    @User() user: UserDto,
  ): Promise<{ url: string; statusCode: HttpStatus }> {
    const url = `${this.configService.get<string>(
      'DOMAIN_URL',
    )}:${this.configService.get<string>('PORT')}`;

    const isToken = this.cacheManager.get(`refresh_token:${user.id}`);
    if (isToken) {
      try {
        await this.cacheManager.del(`refresh_token:${user.id}`);
      } catch (err: unknown) {
        console.error(err);
        throw err;
      }
    }

    return { url, statusCode: HttpStatus.MOVED_PERMANENTLY };
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
