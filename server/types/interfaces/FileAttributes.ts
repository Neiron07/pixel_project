export interface FileAttributes {
    id: number;
    userId: number;
    filename: string;
    fileData: Buffer;
    status: string;
    reason: string | null;
}