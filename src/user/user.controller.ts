import { Get, Post, Body, Put, Delete, Param, Controller, UsePipes, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRO } from './user.interface';
import { CreateUserDto, UpdateUserDto, LoginUserDto } from './dto';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { User } from './user.decorator';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { ApiBody, ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('user')
@Controller()
export class UserController {

	constructor(private readonly userService: UserService) {}

	@ApiOperation({ summary: 'Get info about you' })
	@ApiResponse({ status: 200, description: ''})
	@ApiResponse({ status: 401, description: 'Unauthorized.'})
	@Get('user')
	async findMe(@User('email') email: string): Promise<UserRO> {
		return await this.userService.findByEmail(email);
	}

	@ApiOperation({ summary: 'Update your user info' })
	@ApiBody({ type: UpdateUserDto })
	@ApiResponse({ status: 200, description: 'Update is successful.'})
	@ApiResponse({ status: 401, description: 'Unauthorized.'})
	@Put('user')
	async update(@User('id') userId: number, @Body() userData: UpdateUserDto) {
		return await this.userService.update(userId, userData);
	}

	@ApiOperation({ summary: 'Get all users' })
	@ApiResponse({ status: 200, description: ''})
	@ApiResponse({ status: 401, description: 'Unauthorized.'})
	@Get('users')
	async findAll() {
		return await this.userService.findAll();
	}

	@ApiOperation({ summary: 'Register a new User' })
	@ApiResponse({ status: 201, description: 'The user has been successfully created.'})
	@ApiResponse({ status: 400, description: 'Input data validation failed.'})
	@ApiBody({ type: CreateUserDto })
	@UsePipes(new ValidationPipe())
	@Post('users')
	async create(@Body() userData: CreateUserDto) {
		return this.userService.create(userData);
	}

	@ApiOperation({ summary: 'Delete user by email' })
	@ApiResponse({ status: 200, description: 'The user has been successfully deleted.'})
	@ApiResponse({ status: 400, description: 'The user can\'t delete itself.'})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiParam({ name: "email", required: true })
	@Delete('users/:email')
	async delete(@User('email') userEmail: string, @Param() params) {
		if (userEmail === params.email) {
			throw new HttpException('You can\'t delete yourself', HttpStatus.BAD_REQUEST);
		}
		return await this.userService.delete(params.email);
	}

	@ApiOperation({ summary: 'Log in with email and password credentials' })
	@ApiResponse({ status: 201, description: 'The user has been successfully logged in, JWT token sent back'})
	@ApiResponse({ status: 401, description: 'User not found.'})
	@ApiBody({ type: LoginUserDto })
	@UsePipes(new ValidationPipe())
	@Post('login')
	async login(@Body() loginUserDto: LoginUserDto): Promise<UserRO> {
		const _user = await this.userService.findOne(loginUserDto);

		const errors = {User: ' not found'};
		if (!_user) throw new HttpException({errors}, 401);

		const token = await this.userService.generateJWT(_user);
		const {id, email, username, bio, image} = _user;
		const user = {id, email, token, username, bio, image};
		return {user};
	}
}
