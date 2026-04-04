import { useEffect, useState } from 'react';
import {
    createAppointment,
    deleteAppointment,
    listAppointments,
    updateAppointment,
} from '../api/appointmentsApi';
import './Home.css';

const importanceOptions = [
    { value: '', label: 'All priorities' },
    { value: '1', label: 'Low' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'High' },
];

const periodOptions = [
    { value: 'all', label: 'Any period' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
];

const emptyForm = {
    id: null,
    title: '',
    description: '',
    appointmentDate: '',
    time: '',
    address: '',
    isDone: false,
    deleted: false,
    levelOfImportance: '2',
};

function toInputDate(value) {
    if (!value) {
        return '';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    return parsed.toISOString().slice(0, 10);
}

function formatDate(value) {
    if (!value) {
        return 'No date';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatImportance(value) {
    if (String(value) === '3') {
        return 'High';
    }

    if (String(value) === '1') {
        return 'Low';
    }

    return 'Medium';
}

function buildPayload(form) {
    return {
        id: form.id ?? 0,
        title: form.title.trim(),
        description: form.description.trim(),
        appointmentDate: form.appointmentDate,
        time: form.time,
        address: form.address.trim(),
        isDone: form.isDone,
        deleted: form.deleted,
        levelOfImportance: Number(form.levelOfImportance),
    };
}

function validateForm(form) {
    const missingFields = [];

    if (!form.title.trim()) {
        missingFields.push('title');
    }

    if (!form.description.trim()) {
        missingFields.push('description');
    }

    if (!form.appointmentDate) {
        missingFields.push('date');
    }

    if (!form.time) {
        missingFields.push('time');
    }

    if (!form.address.trim()) {
        missingFields.push('address');
    }

    if (missingFields.length === 0) {
        return '';
    }

    return `Required: ${missingFields.join(', ')}.`;
}

function getPeriodMatch(appointmentDate, period) {
    if (period === 'all' || !appointmentDate) {
        return true;
    }

    const current = new Date();
    const itemDate = new Date(appointmentDate);

    if (Number.isNaN(itemDate.getTime())) {
        return false;
    }

    const today = new Date(current.getFullYear(), current.getMonth(), current.getDate());
    const value = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());

    if (period === 'today') {
        return value.getTime() === today.getTime();
    }

    if (period === 'week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return value >= today && value < weekEnd;
    }

    if (period === 'month') {
        return value.getMonth() === today.getMonth() && value.getFullYear() === today.getFullYear();
    }

    return true;
}

function isUpdatedAppointment(appointment) {
    if (appointment.deleted || appointment.isDone || !appointment.createdDate || !appointment.modifiedDate) {
        return false;
    }

    const created = new Date(appointment.createdDate);
    const modified = new Date(appointment.modifiedDate);

    if (Number.isNaN(created.getTime()) || Number.isNaN(modified.getTime())) {
        return false;
    }

    return modified.getTime() > created.getTime();
}

export default function Home() {
    const [appointments, setAppointments] = useState([]);
    const [titleSearch, setTitleSearch] = useState('');
    const [addressSearch, setAddressSearch] = useState('');
    const [descriptionSearch, setDescriptionSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');
    const [periodFilter, setPeriodFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');
    const [importanceFilter, setImportanceFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formMode, setFormMode] = useState('create');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [form, setForm] = useState({
        ...emptyForm,
        appointmentDate: toInputDate(new Date()),
    });

    async function loadAppointments() {
        setLoading(true);
        setError('');

        try {
            const result = await listAppointments();
            setAppointments(result);
        }
        catch (requestError) {
            setError(requestError.message || 'Failed to load appointments.');
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadAppointments();
    }, []);

    function resetForm() {
        setFormMode('create');
        setError('');
        setForm({
            ...emptyForm,
            appointmentDate: toInputDate(new Date()),
        });
    }

    function closeCreateModal() {
        setIsCreateModalOpen(false);
        resetForm();
    }

    function startCreate() {
        resetForm();
        setIsCreateModalOpen(true);
    }

    function startEdit(appointment) {
        setError('');
        setFormMode('edit');
        setForm({
            id: appointment.id,
            title: appointment.title,
            description: appointment.description,
            appointmentDate: toInputDate(appointment.appointmentDate),
            time: appointment.time ?? '',
            address: appointment.address,
            isDone: appointment.isDone,
            deleted: appointment.deleted,
            levelOfImportance: String(appointment.levelOfImportance),
        });
        setIsCreateModalOpen(true);
    }

    function clearFilters() {
        setTitleSearch('');
        setAddressSearch('');
        setDescriptionSearch('');
        setStatusFilter('active');
        setPeriodFilter('all');
        setDateFilter('');
        setImportanceFilter('');
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationError = validateForm(form);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError('');

        const payload = buildPayload(form);

        try {
            if (formMode === 'edit') {
                await updateAppointment(form.id, payload);
            }
            else {
                await createAppointment(payload);
            }

            await loadAppointments();
            setIsCreateModalOpen(false);
            resetForm();
        }
        catch (requestError) {
            setError(requestError.message || 'Unable to save appointment.');
        }
        finally {
            setSaving(false);
        }
    }

    async function handleDelete(appointment) {
        const shouldDelete = window.confirm(`Delete "${appointment.title}"?`);
        if (!shouldDelete) {
            return;
        }

        setError('');

        try {
            await deleteAppointment(appointment.id);

            await loadAppointments();

            if (form.id === appointment.id) {
                setIsCreateModalOpen(false);
                resetForm();
            }
        }
        catch (requestError) {
            setError(requestError.message || 'Unable to delete appointment.');
        }
    }

    async function toggleDone(appointment) {
        setError('');

        try {
            await updateAppointment(appointment.id, {
                id: appointment.id,
                title: appointment.title,
                description: appointment.description,
                appointmentDate: appointment.appointmentDate,
                time: appointment.time,
                address: appointment.address,
                isDone: !appointment.isDone,
                deleted: appointment.deleted,
                levelOfImportance: Number(appointment.levelOfImportance),
            });

            await loadAppointments();
        }
        catch (requestError) {
            setError(requestError.message || 'Unable to update status.');
        }
    }

    function renderAppointmentForm() {
        return (
            <form className="editor-form" onSubmit={handleSubmit}>
                {error ? <div className="message-strip error-strip">{error}</div> : null}

                <label className="field">
                    <span>Title</span>
                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={(event) => setForm({ ...form, title: event.target.value })}
                        placeholder="Project sync"
                    />
                </label>

                <label className="field">
                    <span>Description</span>
                    <textarea
                        rows="4"
                        required
                        value={form.description}
                        onChange={(event) => setForm({ ...form, description: event.target.value })}
                        placeholder="Short notes about the appointment"
                    />
                </label>

                <div className="field-split">
                    <label className="field">
                        <span>Date</span>
                        <input
                            type="date"
                            required
                            value={form.appointmentDate}
                            onChange={(event) => setForm({ ...form, appointmentDate: event.target.value })}
                        />
                    </label>

                    <label className="field">
                        <span>Time</span>
                        <input
                            type="time"
                            required
                            value={form.time}
                            onChange={(event) => setForm({ ...form, time: event.target.value })}
                        />
                    </label>
                </div>

                <label className="field">
                    <span>Address</span>
                    <input
                        type="text"
                        required
                        value={form.address}
                        onChange={(event) => setForm({ ...form, address: event.target.value })}
                        placeholder="Office, clinic, or meeting link"
                    />
                </label>

                <label className="field">
                    <span>Importance</span>
                    <select
                        value={form.levelOfImportance}
                        onChange={(event) => setForm({ ...form, levelOfImportance: event.target.value })}
                    >
                        {importanceOptions
                            .filter((option) => option.value)
                            .map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                    </select>
                </label>

                <button className="primary-button" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : formMode === 'edit' ? 'Save changes' : 'Create appointment'}
                </button>
            </form>
        );
    }

    const visibleAppointments = appointments
        .filter((appointment) => {
            if (statusFilter === 'all') {
                return true;
            }

            if (statusFilter === 'active') {
                return !appointment.deleted && !appointment.isDone;
            }

             if (statusFilter === 'updated') {
                return isUpdatedAppointment(appointment);
            }

            if (statusFilter === 'done') {
                return appointment.isDone && !appointment.deleted;
            }

            return appointment.deleted;
        })
        .filter((appointment) => {
            if (!titleSearch.trim()) {
                return true;
            }

            return appointment.title.toLowerCase().includes(titleSearch.trim().toLowerCase());
        })
        .filter((appointment) => {
            if (!addressSearch.trim()) {
                return true;
            }

            return appointment.address.toLowerCase().includes(addressSearch.trim().toLowerCase());
        })
        .filter((appointment) => {
            if (!descriptionSearch.trim()) {
                return true;
            }

            return appointment.description.toLowerCase().includes(descriptionSearch.trim().toLowerCase());
        })
        .filter((appointment) => {
            if (!importanceFilter) {
                return true;
            }

            return String(appointment.levelOfImportance) === importanceFilter;
        })
        .filter((appointment) => {
            if (!dateFilter) {
                return true;
            }

            return toInputDate(appointment.appointmentDate) === dateFilter;
        })
        .filter((appointment) => getPeriodMatch(appointment.appointmentDate, periodFilter))
        .sort((first, second) => new Date(first.appointmentDate) - new Date(second.appointmentDate));

    const totalCount = appointments.length;
    const activeCount = appointments.filter((appointment) => !appointment.deleted && !appointment.isDone).length;
    const updatedCount = appointments.filter((appointment) => isUpdatedAppointment(appointment)).length;
    const doneCount = appointments.filter((appointment) => appointment.isDone && !appointment.deleted).length;
    const deletedCount = appointments.filter((appointment) => appointment.deleted).length;

    return (
        <div className="dashboard-shell">
            <div className="dashboard-orb dashboard-orb-left" />
            <div className="dashboard-orb dashboard-orb-right" />

            <main className="dashboard-page">
                <section className="hero-panel">
                    <div className="hero-copy">
                        <span className="eyebrow">Appointments Manager</span>
                        <h1>Plan every meeting from one modern workspace.</h1>
                    </div>

                    <div className="hero-actions">
                        <button className="primary-button hero-button" type="button" onClick={startCreate}>
                            New appointment
                        </button>
                        <div className="mini-note">
                            <span>app by</span>
                            <strong>Mario Slavov</strong>
                        </div>
                    </div>
                </section>

                <section className="stats-grid">
                    <article className="stat-card">
                        <span className="stat-label">Total</span>
                        <strong>{totalCount}</strong>
                        <p>All stored appointments</p>
                    </article>
                    <article className="stat-card">
                        <span className="stat-label">Active</span>
                        <strong>{activeCount}</strong>
                        <p>Pending and upcoming</p>
                    </article>
                    <article className="stat-card">
                        <span className="stat-label">Done</span>
                        <strong>{doneCount}</strong>
                        <p>Completed appointments</p>
                    </article>
                    <article className="stat-card">
                        <span className="stat-label">Deleted</span>
                        <strong>{deletedCount}</strong>
                        <p>Soft deleted items</p>
                    </article>
                </section>

                <section className="workspace-grid">
                    <div className="board-card board-card-large">
                        <div className="toolbar-row">
                            <div>
                                <span className="section-kicker">Overview</span>
                                <h2>Appointment board</h2>
                            </div>

                            <button className="ghost-button" type="button" onClick={clearFilters}>
                                Clear filters
                            </button>
                        </div>

                        <div className="filter-grid">
                            <label className="field">
                                <span>Title</span>
                                <input
                                    type="text"
                                    value={titleSearch}
                                    onChange={(event) => setTitleSearch(event.target.value)}
                                    placeholder="Search title"
                                />
                            </label>

                            <label className="field">
                                <span>Address</span>
                                <input
                                    type="text"
                                    value={addressSearch}
                                    onChange={(event) => setAddressSearch(event.target.value)}
                                    placeholder="Search address"
                                />
                            </label>

                            <label className="field">
                                <span>Description</span>
                                <input
                                    type="text"
                                    value={descriptionSearch}
                                    onChange={(event) => setDescriptionSearch(event.target.value)}
                                    placeholder="Search description"
                                />
                            </label>

                            <label className="field">
                                <span>Priority</span>
                                <select
                                    value={importanceFilter}
                                    onChange={(event) => setImportanceFilter(event.target.value)}
                                >
                                    {importanceOptions.map((option) => (
                                        <option key={option.value || 'all'} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="field">
                                <span>Period</span>
                                <select
                                    value={periodFilter}
                                    onChange={(event) => setPeriodFilter(event.target.value)}
                                >
                                    {periodOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="field">
                                <span>Specified date</span>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(event) => setDateFilter(event.target.value)}
                                />
                            </label>
                        </div>

                        <div className="status-pills">
                            <button
                                type="button"
                                className={statusFilter === 'active' ? 'status-pill active' : 'status-pill'}
                                onClick={() => setStatusFilter('active')}
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                className={statusFilter === 'done' ? 'status-pill active' : 'status-pill'}
                                onClick={() => setStatusFilter('done')}
                                >
                                Done
                            </button>
                            <button
                                type="button"
                                className={statusFilter === 'deleted' ? 'status-pill active' : 'status-pill'}
                                onClick={() => setStatusFilter('deleted')}
                            >
                                Deleted
                            </button>
                             <button
                                type="button"
                                className={statusFilter === 'updated' ? 'status-pill active' : 'status-pill'}
                                onClick={() => setStatusFilter('updated')}
                            >
                                Updated
                            </button>
                            <button
                                type="button"
                                className={statusFilter === 'all' ? 'status-pill active' : 'status-pill'}
                                onClick={() => setStatusFilter('all')}
                            >
                                All
                            </button>
                        </div>

                        {error ? <div className="message-strip error-strip">{error}</div> : null}

                        {loading ? (
                            <div className="empty-state">
                                <strong>Loading appointments...</strong>
                                <p>The dashboard is pulling data from your ASP.NET API.</p>
                            </div>
                        ) : visibleAppointments.length === 0 ? (
                            <div className="empty-state">
                                <strong>No appointments match the current filters.</strong>
                                <p>Clear the filters or create a new appointment from the popup form.</p>
                            </div>
                        ) : (
                            <div className="table-wrap">
                                <table className="appointments-table">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Priority</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Address</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleAppointments.map((appointment) => (
                                            <tr key={appointment.id}>
                                                <td>
                                                    <strong>{appointment.title}</strong>
                                                </td>
                                                <td>{appointment.description}</td>
                                                <td>
                                                    <span className={`priority-badge priority-${appointment.levelOfImportance}`}>
                                                        {formatImportance(appointment.levelOfImportance)}
                                                    </span>
                                                </td>
                                                <td>{formatDate(appointment.appointmentDate)}</td>
                                                <td>{appointment.time}</td>
                                                <td>{appointment.address}</td>
                                                <td>
                                                    <span className={appointment.deleted ? 'status-tag deleted' : appointment.isDone ? 'status-tag done' : isUpdatedAppointment(appointment) ? 'status-tag updated' : 'status-tag planned'}>
                                                        {appointment.deleted ? 'Deleted' : appointment.isDone ? 'Done' : isUpdatedAppointment(appointment) ? 'Updated' : 'Planned'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="row-actions">
                                                        <button type="button" onClick={() => startEdit(appointment)}>
                                                            Edit
                                                        </button>
                                                        {!appointment.deleted ? (
                                                            <button type="button" onClick={() => toggleDone(appointment)}>
                                                                {appointment.isDone ? 'Reopen' : 'Done'}
                                                            </button>
                                                        ) : null}
                                                        {!appointment.deleted ? (
                                                            <button
                                                                type="button"
                                                                className="danger-text"
                                                                onClick={() => handleDelete(appointment)}
                                                            >
                                                                Delete
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {isCreateModalOpen ? (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="toolbar-row modal-heading">
                            <div>
                                <h2>{formMode === 'edit' ? 'Edit appointment' : 'Create appointment'}</h2>
                                <p className="modal-copy">
                                    {formMode === 'edit'
                                        ? 'Update the selected appointment and save your changes.'
                                        : 'Fill in the details below to add a new appointment.'}
                                </p>
                            </div>

                            <button className="ghost-button" type="button" onClick={closeCreateModal}>
                                Close
                            </button>
                        </div>

                        {renderAppointmentForm()}
                    </div>
                </div>
            ) : null}

            
        </div>

        
    );
}
