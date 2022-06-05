import HttpException from "../exceptions/HttpException";
import { NextFunction, Request, Response, Router } from "express";
import Controller from "../interfaces/controller.interface";
import authMiddleware from "../middleware/auth.middleware";
import candidateModel from "./candidate.model";
import validationMiddleware from "../middleware/validation.middleware";
import CreateCandidateDto from "./candidate.dto";

export default class nsideController implements Controller {
    public path = "/api/candidate";
    public router = Router();
    private nsideM = candidateModel;

    constructor() {
        this.router.get(this.path, this.getAll);
        this.router.get(`${this.path}/:id`, this.getById);
        this.router.get(`${this.path}/:offset/:limit/:order/:sort/:keyword?`, authMiddleware, this.getPaginatedCandidates);
        this.router.post(this.path, [authMiddleware, validationMiddleware(CreateCandidateDto, false)], this.create);
        this.router.patch(`${this.path}/:id`, authMiddleware, this.modifyPATCH);
        this.router.put(`${this.path}/:id`, authMiddleware, this.modifyPUT);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.delete);
    }

    private getAll = async (req: Request, res: Response) => {
        try {
            const data = await this.nsideM.find().populate("party", "-_id");
            res.send(data);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    private getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const document = await this.nsideM.findById(id).populate("party", "-_id");
            if (document) {
                res.send(document);
            } else {
                res.status(404).send({ message: `Document with id ${id} not found!` });
            }
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    private create = async (req: Request, res: Response) => {
        try {
            const body = req.body;
            const createdDocument = new this.nsideM({
                ...body,
            });
            const savedDocument = await createdDocument.save();
            res.send(savedDocument);
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    private modifyPATCH = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const body = req.body;
            const updatedDoc = await this.nsideM.findByIdAndUpdate(id, body, { new: true, runValidators: true }).populate("party", "-_id");
            if (updatedDoc) {
                res.send(updatedDoc);
            } else {
                res.status(404).send({ message: `Document with id ${id} not found!` });
            }
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    private modifyPUT = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const body = req.body;
            const modificationResult = await this.nsideM.replaceOne({ _id: id }, body, { runValidators: true });
            if (modificationResult.modifiedCount) {
                const updatedDoc = await this.nsideM.findById(id).populate("party", "-_id");
                res.send(updatedDoc);
            } else {
                res.status(404).send({ message: `Document with id ${id} not found!` });
            }
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    private delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const successResponse = await this.nsideM.findByIdAndDelete(id);
            if (successResponse) {
                res.sendStatus(200);
            } else {
                res.status(404).send({ message: `Document with id ${id} not found!` });
            }
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    };

    private getPaginatedCandidates = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const offset = parseInt(req.params.offset);
            const limit = parseInt(req.params.limit);
            const order = req.params.order;
            const sort = parseInt(req.params.sort); // desc: -1  asc: 1
            let candidates = [];
            let count = 0;
            if (req.params.keyword) {
                const regex = new RegExp(req.params.keyword, "i"); // i for case insensitive
                count = await this.nsideM.find({ $or: [{ utca: { $regex: regex } }, { hazszam: { $regex: regex } }] }).count();
                candidates = await this.nsideM
                    .find({ $or: [{ name: { $regex: regex } }, { constituency: { $regex: regex } }] })
                    .populate("party", "-_id")
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            } else {
                count = await this.nsideM.countDocuments();
                candidates = await this.nsideM
                    .find({})
                    .populate("party", "-_id")
                    .sort(`${sort == -1 ? "-" : ""}${order}`)
                    .skip(offset)
                    .limit(limit);
            }
            res.send({ count: count, candidates: candidates });
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
