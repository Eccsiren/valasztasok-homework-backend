import { Router, Request, Response, NextFunction } from "express";
import Controller from "../interfaces/controller.interface";
import partyModel from "../party/party.model";
import HttpException from "../exceptions/HttpException";
import candidateModel from "../candidate/candidate.model";

export default class ReportController implements Controller {
    public path = "/api/report/:keyword?";
    public router = Router();
    private partyM = partyModel;
    private candidateM = candidateModel;

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.generateReport);
    }

    private generateReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const candidate_count = await this.candidateM.find().count();
            let candidate_num_of_votes;
            const all_votes_stat = await this.candidateM.aggregate([{ $group: { _id: null, sum_val: { $sum: "$number_of_votes" } } }, { $project: { _id: 0, sum_val: 1, ratio: { $divide: ["$sum_val", 12345] } } }]);
            const party_votes_stat = await this.candidateM.aggregate([{ $group: { _id: "$party", num_of_votes: { $sum: "$number_of_votes" } } }, { $lookup: { from: "parties", localField: "_id", foreignField: "_id", as: "party_data" } }, { $project: { party_short_name: "$party_data.short_name", party_name: "$party_data.full_name", num_of_votes: 1, _id: 0 } }, { $unwind: { path: "$party_name" } }, { $unwind: { path: "$party_short_name" } }]);
            const elected_candidate = await this.candidateM.find().sort({ number_of_votes: -1 }).limit(1).populate("party", "-_id");
            const constituency_winners = await this.candidateM.aggregate([{ $group: { _id: "$constituency", greatest_vote: { $max: "$number_of_votes" }, name: { $max: "$name" }, party: { $max: "$party" } } }, { $lookup: { from: "parties", localField: "party", foreignField: "_id", as: "party_data" } }, { $project: { constituency: "$_id", name: 1, _id: 0, party_short_name: "$party_data.short_name", party_full_name: "$party_data.full_name" } }, { $unwind: { path: "$party_short_name" } }, { $unwind: { path: "$party_full_name" } }]);
            if (req.params.keyword) {
                const regex = new RegExp(req.params.keyword, "i");
                const candidate = await this.candidateM.findOne({ name: { $regex: regex } }, "-_id number_of_votes");
                if (candidate) {
                    candidate_num_of_votes = candidate.number_of_votes;
                } else {
                    candidate_num_of_votes = "Ilyen nevű képviselő nem szrepel a nyilvántartásban!";
                }
                res.send({ candidate_count, all_votes_stat, candidate_num_of_votes, party_votes_stat, elected_candidate, constituency_winners });
            } else {
                res.send({ candidate_count, all_votes_stat, party_votes_stat, elected_candidate, constituency_winners });
            }
        } catch (error) {
            next(new HttpException(400, error.message));
        }
    };
}
