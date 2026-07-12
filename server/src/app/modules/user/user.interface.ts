import { Document } from "mongoose";

export enum UserRole {
    user = 'user',
    admin = 'admin',
    owner = 'owner'
}
export interface IUser extends Document{
    name: string;
    email: string;
    password:string;
    phone: string;
    role: UserRole
}

