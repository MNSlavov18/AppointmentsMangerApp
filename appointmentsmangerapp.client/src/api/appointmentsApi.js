const API_URL = '/api/appointment';

function toClientAppointment(appointment) {
    return {
        id: appointment.id ?? appointment.ID ?? 0,
        title: appointment.title ?? appointment.Title ?? '',
        description: appointment.description ?? appointment.Description ?? '',
        createdDate: appointment.createdDate ?? appointment.CreatedDate ?? null,
        modifiedDate: appointment.modifiedDate ?? appointment.ModifiedDate ?? null,
        appointmentDate: appointment.appointmentDate ?? appointment.AppointmentDate ?? '',
        address: appointment.address ?? appointment.Address ?? '',
        time: appointment.time ?? appointment.Time ?? '',
        isDone: appointment.isDone ?? appointment.IsDone ?? false,
        deleted: appointment.deleted ?? appointment.Deleted ?? false,
        levelOfImportance: appointment.levelOfImportance ?? appointment.LevelOfImportance ?? 2,
    };
}

function toServerAppointment(appointment) {
    return {
        id: appointment.id ?? 0,
        title: appointment.title ?? '',
        description: appointment.description ?? '',
        appointmentDate: appointment.appointmentDate ?? '',
        address: appointment.address ?? '',
        time: appointment.time ?? '',
        isDone: appointment.isDone ?? false,
        deleted: appointment.deleted ?? false,
        levelOfImportance: Number(appointment.levelOfImportance ?? 2),
    };
}

async function readResponse(response) {
    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('json');
    const raw = isJson ? await response.json() : await response.text();
    let data = raw;

    if (!isJson && typeof raw === 'string') {
        try {
            data = JSON.parse(raw);
        }
        catch {
            data = raw;
        }
    }

    if (!response.ok) {
        const validationMessages = typeof data === 'object' && data !== null && data.errors
            ? Object.values(data.errors)
                .flat()
                .filter(Boolean)
            : [];

        const message = validationMessages.length > 0
            ? validationMessages.join(' ')
            : typeof data === 'string'
                ? data
                : data?.detail || data?.title || data?.message || 'Request failed.';

        throw new Error(message);
    }

    return data;
}

export async function listAppointments() {
    const response = await fetch(API_URL);
    const data = await readResponse(response);
    return Array.isArray(data) ? data.map(toClientAppointment) : [];
}

export async function createAppointment(appointment) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(toServerAppointment(appointment)),
    });

    const data = await readResponse(response);
    return typeof data === 'object' && data !== null ? toClientAppointment(data) : data;
}

export async function updateAppointment(id, appointment) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(toServerAppointment({ ...appointment, id })),
    });

    return readResponse(response);
}

export async function deleteAppointment(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });

    return readResponse(response);
}
