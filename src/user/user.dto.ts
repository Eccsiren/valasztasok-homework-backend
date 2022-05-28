import { IsString } from "class-validator";

export default class CreateUserDto {
    @IsString()
    public user_name: string;

    @IsString()
    public email: string;

    @IsString()
    public password: string;
}
