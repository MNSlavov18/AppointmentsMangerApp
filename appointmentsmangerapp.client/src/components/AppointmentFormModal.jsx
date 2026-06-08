import { useEffect, useState } from 'react';

const emptyForm = {
    title: '',
    description: '',
    appointmentDate: '',
    time: '',
    address: '',
    levelOfImportance: '2',
    isDone: false,
};

function getTodayDate() {
    return new Date().toISOString().slice(0, 10);
}

function toInputDate(value) {
    if (!value) {
        return getTodayDate();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return getTodayDate();
    }

    return date.toISOString().slice(0, 10);
}

export default function AppointmentFormModal({ appointment, onClose, onSave }) {
    const [form, setForm] = useState({
        ...emptyForm,
        appointmentDate: getTodayDate(),
    });

    const [errorMessage, setErrorMessage] = useState('');

    const isEditing = appointment !== null;

    useEffect(() => {
        if (appointment) {
            setForm({
                title: appointment.title || '',
                description: appointment.description || '',
                appointmentDate: toInputDate(appointment.appointmentDate),
                time: appointment.time || '',
                address: appointment.address || '',
                levelOfImportance: String(appointment.levelOfImportance || 2),
                isDone: appointment.isDone || false,
            });
        } else {
            setForm({
                ...emptyForm,
                appointmentDate: getTodayDate(),
            });
        }
    }, [appointment]);

    function handleInputChange(event) {
        const name = event.target.name;
        const value = event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value;

        setForm({
            ...form,
            [name]: value,
        });
    }

    function validateForm() {
        if (!form.title.trim()) {
            return 'Title is required.';
        }

        if (!form.description.trim()) {
            return 'Description is required.';
        }

        if (!form.appointmentDate) {
            return 'Date is required.';
        }

        if (!form.time) {
            return 'Time is required.';
        }

        if (!form.address.trim()) {
            return 'Address is required.';
        }

        return '';
    }

    function handleSubmit(event) {
        event.preventDefault();

        const validationMessage = validateForm();

        if (validationMessage) {
            setErrorMessage(validationMessage);
            return;
        }

        const appointmentToSave = {
            id: appointment?.id ?? 0,
            title: form.title.trim(),
            description: form.description.trim(),
            appointmentDate: form.appointmentDate,
            time: form.time,
            address: form.address.trim(),
            levelOfImportance: Number(form.levelOfImportance),
            isDone: form.isDone,
            deleted: appointment?.deleted ?? false,
        };

        onSave(appointmentToSave);
    }

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <div className="modal-header">
                    <h2>{isEditing ? 'Edit appointment' : 'New appointment'}</h2>

                    <button type="button" className="close-button" onClick={onClose}>
                        X
                    </button>
                </div>

                {errorMessage ? <p className="message">{errorMessage}</p> : null}

                <form className="form" onSubmit={handleSubmit}>
                    <label>
                        Title
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleInputChange}
                            placeholder="Doctor's office"
                        />
                    </label>

                    <label>
                        Description
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleInputChange}
                            placeholder="Short description"
                        />
                    </label>

                    <div className="form-row">
                        <label>
                            Date
                            <input
                                type="date"
                                name="appointmentDate"
                                value={form.appointmentDate}
                                onChange={handleInputChange}
                            />
                        </label>

                        <label>
                            Time
                            <input
                                type="time"
                                name="time"
                                value={form.time}
                                onChange={handleInputChange}
                            />
                        </label>
                    </div>

                    <label>
                        Address
                        <input
                            name="address"
                            value={form.address}
                            onChange={handleInputChange}
                            placeholder="Sofia, Mladost 1"
                        />
                    </label>

                    <label>
                        Priority
                        <select
                            name="levelOfImportance"
                            value={form.levelOfImportance}
                            onChange={handleInputChange}
                        >
                            <option value="1">Low</option>
                            <option value="2">Medium</option>
                            <option value="3">High</option>
                        </select>
                    </label>

                    {isEditing ? (
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isDone"
                                checked={form.isDone}
                                onChange={handleInputChange}
                            />
                            Mark this appointment as done
                        </label>
                    ) : null}

                    <div className="form-buttons">
                        <button type="submit" className="button">
                            {isEditing ? 'Save changes' : 'Create'}
                        </button>

                        <button type="button" className="button secondary" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}