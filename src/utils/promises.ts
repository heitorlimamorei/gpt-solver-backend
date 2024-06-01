import axios from "axios";
import FormData from "form-data";

export const PromiseScheduler = async <T>(promises: Promise<T>[]): Promise<T[]> => {
    return await Promise.all([...promises]);   
}

const generateRepositoryError = (message: string, status: number) => {
    throw new Error(`RESOURCE :${message}-${status}`);
};

export const GET = async <T>(url: string) => {
    const formdata = new FormData();
    const res = await axios.get<T>(url, {
        headers: {
            ...formdata.getHeaders(),
        }
    });

    return {
        data: res.data,
        status: res.status
    };
};