import express from "express";
import * as jwt from "jsonwebtoken";
import Logging from "@functions/logging";
import { SECRET_KEY } from "./../config/config";

import _settings from "@functions/files/settings";
const settings = _settings();

interface IPermissions {
    canCreateFolder: boolean;
    canUpload: boolean;
    canDownload: boolean;
    canNavigate: boolean;
    canDeleteFile: boolean;
    canDeleteFolder: boolean;
}

function setPermissions(isAdmin: boolean, userAccount: any): IPermissions {
    if (isAdmin) {
        return {
            canCreateFolder: true,
            canUpload: true,
            canDownload: true,
            canNavigate: true,
            canDeleteFile: true,
            canDeleteFolder: true,
        };
    } else {
        return {
            canCreateFolder: userAccount.permissions.createFolder ?? false,
            canUpload: userAccount.permissions.upload ?? false,
            canDownload: userAccount.permissions.download ?? false,
            canNavigate: userAccount.permissions.navigate ?? false,
            canDeleteFile: userAccount.permissions.delete ?? false,
            canDeleteFolder: userAccount.permissions.delete ?? false,
        };
    }
}

async function jwtauthenticator(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) {
    Logging.attempting(req);
    const accountsExist = (await settings).accounts;
    // check if the settings include accounts
    if (!accountsExist) {
        // if there are no accounts, continue
        next();
    } else {
        // if there are accounts, check for authorisation
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        // if there is no token, return 401
        if (token == null) return res.sendStatus(401);

        // verify the token
        const secretKey = SECRET_KEY;
        jwt.verify(token, secretKey, async (err: any, user: any) => {
            console.log(err);
            // if there is an error, return 403
            if (err) return res.sendStatus(403);
            // if the token is verified, continue
            (req as any).user = user;
        });
        next();
    }
}

export default jwtauthenticator;
