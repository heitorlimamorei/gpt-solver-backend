import { firebaseTimesStampType } from "./utils-types";

export interface ISubscriptionModel {
    tokens_limit: number;
    processImages: boolean;
    acessGoogle: boolean;
    price: number;
}

export interface ISubscriptionModelsMap {
    [name: string]: ISubscriptionModel;
}

export default interface ISubscription {
    id: string;
    subscriptionType: string;
    ownerId: string;
    endDate: firebaseTimesStampType;
    createdAt: firebaseTimesStampType;
}