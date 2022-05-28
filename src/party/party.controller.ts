import { Request, Response, Router } from "express";
import Controller from "../interfaces/controller.interface";
import partyModel from "./party.model";

export default class nsideController implements Controller {
    public path = "/api/party";
    public router = Router();
    private onesideM = partyModel;

    constructor() {
        this.router.get(this.path, this.getAll);
    }

    private getAll = async (req: Request, res: Response) => {
        try {
            const data = await this.onesideM.find();
            res.send(data);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };
}
