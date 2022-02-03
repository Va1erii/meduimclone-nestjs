import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
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
        this.validateUserIsNotExist(createUserDto);
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

    validateUserIsNotExist(createUserDto: CreateUserDto) {
        const userByEmail = this.userRepository.findOne({
            email: createUserDto.email
        });
        const userByUsername = this.userRepository.findOne({
            username: createUserDto.username
        });
        if (userByEmail || userByUsername) {
            throw new HttpException(
                'Email or username are taken',
                HttpStatus.UNPROCESSABLE_ENTITY
            );
        }
    }
}