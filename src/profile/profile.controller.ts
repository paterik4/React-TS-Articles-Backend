import { Get, Post, Delete, Param, Controller } from '@nestjs/common';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { ProfileRO } from './profile.interface';
import { User } from '../user/user.decorator';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('profiles')
@Controller('profiles')
export class ProfileController {

	constructor(private readonly profileService: ProfileService) {}

	@ApiOperation({ summary: 'Get profile info' })
	@ApiResponse({ status: 200, description: ''})
	@Get(':username')
	async getProfile(@User('id') userId: number, @Param('username') username: string): Promise<ProfileRO> {
		return await this.profileService.findProfile(userId, username);
	}

	@ApiOperation({ summary: 'Follow a user' })
	@ApiResponse({ status: 201, description: 'Follow has been successfully.'})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@Post(':username/follow')
	async follow(@User('email') email: string, @Param('username') username: string): Promise<ProfileRO> {
		return await this.profileService.follow(email, username);
	}

	@ApiOperation({ summary: 'UnFollow a user' })
	@ApiResponse({ status: 201, description: 'UnFollow has been successfully.'})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@Delete(':username/follow')
	async unFollow(@User('id') userId: number,  @Param('username') username: string): Promise<ProfileRO> {
		return await this.profileService.unFollow(userId, username);
	}

}
