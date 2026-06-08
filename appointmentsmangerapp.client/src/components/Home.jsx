import { useEffect, useState } from 'react';
import {
    createAppointment,
    deleteAppointment,
    listAppointments,
    updateAppointment,
} from '../api/appointmentsApi';
import AppointmentFormModal from './AppointmentFormModal';
import './Home.css';

function formatDate(value) {
    if (!value) {
        return 'No date';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString('en-GB');
}

function getPriorityName(priority) {
    if (String(priority) === '1') {
        return 'Low';
    }

    if (String(priority) === '3') {
        return 'High';
    }

    return 'Medium';
}

function getStatusName(appointment) {
    if (appointment.deleted) {
        return 'Deleted';
    }

    if (appointment.isDone) {
        return 'Done';
    }

    return 'Active';
}

export default function Home() {
    const [appointments, setAppointments] = useState([]);

    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('active');
    const [priorityFilter, setPriorityFilter] = useState('all');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    async function loadAppointments() {
        setLoading(true);

        try {
            const data = await listAppointments();
            setAppointments(data);
        } catch (error) {
            if (String(error.message).toLowerCase().includes('no data')) {
                setAppointments([]);
            } else {
                setMessage(error.message || 'Could not load appointments.');
            }
        } finally {
            setLoading(false);
        }
    }

    function openCreateModal() {
        setSelectedAppointment(null);
        setIsModalOpen(true);
        setMessage('');
    }

    function openEditModal(appointment) {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
        setMessage('');
    }

    function closeModal() {
        setIsModalOpen(false);
        setSelectedAppointment(null);
    }

    async function saveAppointment(appointmentToSave) {
        try {
            if (appointmentToSave.id && appointmentToSave.id !== 0) {
                await updateAppointment(appointmentToSave.id, appointmentToSave);
                setMessage('Appointment updated successfully.');
            } else {
                await createAppointment(appointmentToSave);
                setMessage('Appointment created successfully.');
            }

            closeModal();
            await loadAppointments();
        } catch (error) {
            setMessage(error.message || 'Could not save appointment.');
        }
    }

    async function markAsDone(appointment) {
        try {
            await updateAppointment(appointment.id, {
                ...appointment,
                isDone: true,
            });

            await loadAppointments();
            setMessage('Appointment marked as done.');
        } catch (error) {
            setMessage(error.message || 'Could not update appointment.');
        }
    }

    async function handleDelete(appointment) {
        const confirmed = window.confirm(`Delete "${appointment.title}"?`);

        if (!confirmed) {
            return;
        }

        try {
            await deleteAppointment(appointment.id);
            await loadAppointments();
            setMessage('Appointment deleted successfully.');
        } catch (error) {
            setMessage(error.message || 'Could not delete appointment.');
        }
    }

    const visibleAppointments = appointments
        .filter((appointment) => {
            if (statusFilter === 'all') {
                return true;
            }

            if (statusFilter === 'active') {
                return !appointment.deleted && !appointment.isDone;
            }

            if (statusFilter === 'done') {
                return appointment.isDone && !appointment.deleted;
            }

            if (statusFilter === 'deleted') {
                return appointment.deleted;
            }

            return true;
        })
        .filter((appointment) => {
            if (priorityFilter === 'all') {
                return true;
            }

            return String(appointment.levelOfImportance) === priorityFilter;
        })
        .filter((appointment) => {
            const text = searchText.toLowerCase().trim();

            if (!text) {
                return true;
            }

            return (
                appointment.title.toLowerCase().includes(text) ||
                appointment.description.toLowerCase().includes(text) ||
                appointment.address.toLowerCase().includes(text)
            );
        })
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    const totalCount = appointments.length;
    const activeCount = appointments.filter((item) => !item.deleted && !item.isDone).length;
    const doneCount = appointments.filter((item) => item.isDone && !item.deleted).length;
    const deletedCount = appointments.filter((item) => item.deleted).length;

    return (
        <main className="page">
            <header className="header">
                <div>
                    <p className="small-title">Appointments Manager</p>
                    <h1>My appointments</h1>
                    <p className="subtitle">
                        Create, edit, complete and delete your appointments.
                    </p>
                </div>

                <button type="button" className="button" onClick={openCreateModal}>
                    New appointment
                </button>
            </header>

            <section className="stats">
                <div className="stat-card">
                    <span>Total</span>
                    <strong>{totalCount}</strong>
                </div>

                <div className="stat-card">
                    <span>Active</span>
                    <strong>{activeCount}</strong>
                </div>

                <div className="stat-card">
                    <span>Done</span>
                    <strong>{doneCount}</strong>
                </div>

                <div className="stat-card">
                    <span>Deleted</span>
                    <strong>{deletedCount}</strong>
                </div>
            </section>

            <section className="card">
                <div className="list-header">
                    <h2>Appointment list</h2>

                    <button type="button" className="button secondary" onClick={loadAppointments}>
                        Refresh
                    </button>
                </div>

                {message ? <p className="message">{message}</p> : null}

                <div className="filters">
                    <input
                        value={searchText}
                        onChange={(event) => setSearchText(event.target.value)}
                        placeholder="Search title, description or address"
                    />

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="active">Active</option>
                        <option value="done">Done</option>
                        <option value="deleted">Deleted</option>
                        <option value="all">All</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(event) => setPriorityFilter(event.target.value)}
                    >
                        <option value="all">All priorities</option>
                        <option value="1">Low</option>
                        <option value="2">Medium</option>
                        <option value="3">High</option>
                    </select>
                </div>

                {loading ? <p>Loading...</p> : null}

                {!loading && visibleAppointments.length === 0 ? (
                    <p className="empty">No appointments found.</p>
                ) : null}

                {!loading && visibleAppointments.length > 0 ? (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Description</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Address</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleAppointments.map((appointment) => (
                                    <tr key={appointment.id}>
                                        <td>{appointment.title}</td>
                                        <td>{appointment.description}</td>
                                        <td>{formatDate(appointment.appointmentDate)}</td>
                                        <td>{appointment.time}</td>
                                        <td>{appointment.address}</td>
                                        <td>{getPriorityName(appointment.levelOfImportance)}</td>
                                        <td>{getStatusName(appointment)}</td>
                                        <td className="actions">
                                            {!appointment.deleted ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(appointment)}
                                                    >
                                                        Edit
                                                    </button>

                                                    {!appointment.isDone ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => markAsDone(appointment)}
                                                        >
                                                            Done
                                                        </button>
                                                    ) : null}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(appointment)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            ) : (
                                                <span>No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : null}
            </section>

            {isModalOpen ? (
                <AppointmentFormModal
                    appointment={selectedAppointment}
                    onClose={closeModal}
                    onSave={saveAppointment}
                />
            ) : null}
        </main>
    );
}