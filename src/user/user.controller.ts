import { Body, Controller, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "@app/user/user.service";
import { CreateUserDto } from "@app/user/dto/create-user.dto";
import { UserResponseInterface } from "@app/user/types/user-response.interface";

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('users')
    @UsePipes(new ValidationPipe())
    async createUser(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseInterface> {
        const newUser = await this.userService.createUser(createUserDto);
        return this.userService.buildUserResponse(newUser);
    }
}