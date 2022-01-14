//const domainName = 'https://mars-inventory.herokuapp.com';
const domainName = 'http://127.0.0.1:5000/';

export const connectToDB = async (route: string, body?: RequestInit) => {
    try {
        return fetch(`${domainName}${route}`, {
            ...body
        })
    } catch (error) {
        throw new Error("Unable to connect to domain name");
    }
};


export const fetchPrediction = async (body: number) => {
    try{
        const response = await connectToDB(`/predictions`, {
            method: "POST",
            headers: {
                'Content-Type': 'applications/json'
            },
            body: JSON.stringify(body)
        })
        if(!response.ok){
            throw new Error("Error")
        }
        return response.json();

    } catch (error) {
        console.log(error);
        throw new Error("Unable to get MLModelData");
    }
};

export const fetchInventoryData = async (): Promise<Inventory[]> => {
    try {
        const response = await connectToDB(`/get-inventory`, {
            method: "GET",
            headers: {
                'Content-Type': 'applications/json'
            }
        })
        if(!response.ok){
            throw new Error("Error")
        }
        return response.json();

    } catch (error) {
        throw new Error("Unable to fetch Inventory Data from Database");
    }
};

export const addSingleItem = async (body: Inventory): Promise<Inventory> => {
    try {
        const response = await connectToDB(`/add`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
        if(!response.ok){
            throw new Error("Error")
        }
        return response.json();
          
           
    } catch (error) {
        console.log(error);
        throw new Error("Unable to add item to Inventory");
    }
};