import mongoose, { Schema, Model } from "mongoose";

export interface IEarlyAccess {
    name: string;
    email: string;
    phone: string;
    createdAt: Date;
}

const EarlyAccessSchema = new Schema<IEarlyAccess>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true,
        },
        phone: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const EarlyAccess: Model<IEarlyAccess> =
    mongoose.models.EarlyAccess ||
    mongoose.model<IEarlyAccess>("EarlyAccess", EarlyAccessSchema);

export default EarlyAccess;