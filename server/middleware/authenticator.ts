import express, { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import Logging from "@functions/logging";
import { SECRET_KEY } from "../config/config";
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
    }

    return {
        canCreateFolder: userAccount.permissions.createFolder ?? false,
        canUpload: userAccount.permissions.upload ?? false,
        canDownload: userAccount.permissions.download ?? false,
        canNavigate: userAccount.permissions.navigate ?? false,
        canDeleteFile: userAccount.permissions.delete ?? false,
        canDeleteFolder: userAccount.permissions.delete ?? false,
    };
}

async function jwtauthenticator(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    Logging.attempting(req);
    const accountsExist = (await settings).accounts;

    if (!accountsExist) {
        return next();
    }

    const authHeader: any = req.headers["authorization"];
    if (!authHeader) {
        res.status(401).send("Authorization header is missing. Please provide a valid token.");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        res.status(401).send("Token is missing. Please provide a valid token.");
    }

    try {
        const decoded = await verifyToken(token);
        (req as any).user = decoded;
        return next();
    } catch (err) {
        res.status(403).send("Invalid token. Access denied.");
    }
}

function verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}

export default jwtauthenticator;
