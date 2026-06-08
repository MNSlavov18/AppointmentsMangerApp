using AppointmentsMangerApp.Server.Data.Models;

namespace AppointmentsMangerApp.Server.Services
{
    public interface IAppointmentService
    {
        Task<List<Appointment>> GetAllAsync();

        Task<Appointment?> GetByIdAsync(int id);

        Task<List<Appointment>> GetByFiltersAsync(Filter filters);

        Task<Appointment> CreateAsync(Appointment appointment);

        Task UpdateAsync(int id, Appointment appointment);

        Task SoftDeleteAsync(int id);
    }
}