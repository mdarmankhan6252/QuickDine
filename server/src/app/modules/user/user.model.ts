import { model, Schema } from "mongoose";
import { IUser, UserRole } from "./user.interface.js";

const userSchema = new Schema<IUser>({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.user },
    phone: { type: String, trim: true },
}, { timestamps: true })

//removed password when converting to json
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        const transformed = ret as any;
        delete transformed.password;
        return transformed;
    }
})

const User = model<IUser>('User', userSchema);
export default User;