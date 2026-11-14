import mongoose, { Schema, Model } from "mongoose";

export interface ISubscription {
    email: string;
    createdAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Subscription: Model<ISubscription> =
    mongoose.models.Subscription ||
    mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

export default Subscription;