

export async function getRequest(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error while getting data ${response.statusText}. URL = ${url}`);
        }
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error(
            `There was a problem with getting data: ${error}`
        );
        throw error;
    }
}


export async function patchRequest(url) {
    try {
        const response = await fetch(
            url,
            {
                method: 'PATCH',
            }
        );
        if (!response.ok) {
            throw new Error(`Error while makint PATCH request = ${response.statusText}. URL = ${url}`);
        }
        return response;
    } catch (error) {
        console.error(
            `There was a problem with PATCH request: ${error}`
        );
        throw error;
    }
}