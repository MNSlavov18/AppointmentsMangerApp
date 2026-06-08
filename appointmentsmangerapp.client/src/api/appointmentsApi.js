const APPOINTMENT_API_URL = '/api/appointment';

async function handleResponse(response) {
    if (response.status === 401) {
        throw new Error('Unauthorized. Please login again.');
    }

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Request failed.');
    }

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

export async function listAppointments() {
    const response = await fetch(APPOINTMENT_API_URL, {
        method: 'GET',
        credentials: 'include',
    });

    return handleResponse(response);
}

export async function createAppointment(appointment) {
    const response = await fetch(APPOINTMENT_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(appointment),
    });

    return handleResponse(response);
}

export async function updateAppointment(id, appointment) {
    const response = await fetch(`${APPOINTMENT_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(appointment),
    });

    return handleResponse(response);
}

export async function deleteAppointment(id) {
    const response = await fetch(`${APPOINTMENT_API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    return handleResponse(response);
}