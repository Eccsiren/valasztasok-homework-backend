import { config } from "dotenv";
import App from "./app";
import AuthenticationController from "./authentication/authentication.controller";
import onesideController from "./party/party.controller";
import ReportController from "./report/report.controller";
import UserController from "./user/user.controller";
import nsideController from "./candidate/candidate.controller";
import validateEnv from "./utils/validateEnv";

config(); // Read and set variables from .env file.
validateEnv();

const app = new App([new onesideController(), new AuthenticationController(), new UserController(), new ReportController(), new nsideController()]);

app.listen();
