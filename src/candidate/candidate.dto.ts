import { IsNumber, IsString } from "class-validator";

export default class CreateCandidateDto {
    @IsNumber()
    public _id: number;

    @IsNumber()
    public party: number;

    @IsNumber()
    public constituency: number;

    @IsNumber()
    public number_of_votes: number;

    @IsString()
    public name: string;
}
