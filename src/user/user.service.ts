import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "@app/user/dto/create-user.dto";
import { UserEntity } from "@app/user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "@app/config";
import { UserResponseInterface } from "@app/user/types/user-response.interface";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) 
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        console.log("newUser", newUser);
        return await this.userRepository.save(newUser);
    }

    buildUserResponse(user: UserEntity): UserResponseInterface {
        return {
            user: {
                ...user,
                token: this.generateJwtToken(user)
            }
        };
    }

    generateJwtToken(user: UserEntity): string {
        return sign(
            {
                id: user.id,
                username: user.username,
                email: user.email
            },
            JWT_SECRET
        );
    }
}