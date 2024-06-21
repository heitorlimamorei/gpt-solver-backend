import { ISubscriptionRepo } from "../repositories/subscription.repository";
import subscriptionsModels from "../data/subscription.json";

import ISubscription, { INewSubscription, ISubscriptionModelsMap } from "../types/subscription";

export interface ISubscriptionService {
    Create(ownerId: string, type: string): Promise<string>;
    Delete(id: string): Promise<void>;
    Show(id: string): Promise<ISubscription>;
    Plans(): Promise<ISubscriptionModelsMap>;
    ShowByOwnerId(ownerId: string): Promise<ISubscription[]>;
}

const generateServiceError = (message: string, status: number) => {
    throw new Error(`SERVICE:${message}-${status}`);
};

const getSubscriptionModels = () => {
    const models = JSON.parse(JSON.stringify(subscriptionsModels));
    return models as ISubscriptionModelsMap;
};

const getNewSubscription = (ownerId: string, type: string): INewSubscription => {
    let endDate = new Date();

    endDate.setDate(endDate.getDate() + 30);

    const model  = getSubscriptionModels()[type];

    if (!model) generateServiceError(`INVALID TYPE: ${type}`, 400);

    return {
        subscriptionType: type,
        ownerId: ownerId,
        price: model.price,
        endDate: endDate,
        createdAt: new Date(),
    }
};

export default function getSubscriptionService(repo: ISubscriptionRepo): ISubscriptionService {
    async function Create(ownerId: string, type: string): Promise<string> {
        const subscription = getNewSubscription(ownerId, type);
        return await repo.Create(subscription);
    }

    async function Delete(id: string): Promise<void> {
        return await repo.Delete(id);
    }

    async function Show(id: string): Promise<ISubscription> {
        return await repo.Show(id);
    }

    async function ShowByOwnerId(ownerId: string): Promise<ISubscription[]>{
        return await repo.ShowByUserId(ownerId);
    }

    async function Plans(): Promise<ISubscriptionModelsMap> {
        return getSubscriptionModels();
    }
    return {
        Create,
        Delete,
        Show,
        ShowByOwnerId,
        Plans
    }
};