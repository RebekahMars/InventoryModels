const domainName = 'https://mars-inventory.herokuapp.com/';

export const connectToDB = async (route: string, body?: RequestInit) => {
    try {
        return fetch(`${domainName}${route}`, {
            ...body
        })
    } catch (error) {
        throw new Error("Unable to connect to Inventory PostgreSQL Database");
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
            body: JSON.stringify({
                data: {
                    type: 'item',
                    attributes: body
                }
            })
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