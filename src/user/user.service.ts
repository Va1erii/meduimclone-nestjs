import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "@app/user/dto/create-user.dto";
import { UserEntity } from "@app/user/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "@app/config";
import { UserResponseInterface } from "@app/user/types/user-response.interface";
import { LoginUserDto } from "@app/user/dto/login-user.dto";
import { compare } from "bcrypt"

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

    async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
        const user = await this.userRepository.findOne(
            { email: loginUserDto.email},
            { select: ['id', 'username', 'email', 'bio', 'image', 'password'] }
        );
        if (user) {
            const isPasswordCorrect = await compare(loginUserDto.password, user.password);
            delete user.password;
            if (isPasswordCorrect) {
                return user;
            }
        }
        throw new HttpException(
           'Credentials are not valid',
            HttpStatus.UNPROCESSABLE_ENTITY
        );
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