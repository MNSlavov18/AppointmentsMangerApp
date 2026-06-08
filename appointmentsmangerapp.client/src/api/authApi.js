const AUTH_API_URL = '/api/auth';

async function readError(response) {
    const text = await response.text();

    if (!text) {
        return 'Request failed.';
    }

    try {
        const json = JSON.parse(text);
        return json.message || text;
    } catch {
        return text;
    }
}

export async function register(userName, email, password) {
    const response = await fetch(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            userName,
            email,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
}

export async function login(userName, password) {
    const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
            userName,
            password,
        }),
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
}

export async function logout() {
    const response = await fetch(`${AUTH_API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error(await readError(response));
    }
}

export async function getCurrentUser() {
    const response = await fetch(`${AUTH_API_URL}/me`, {
        method: 'GET',
        credentials: 'include',
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(await readError(response));
    }

    return response.json();
}