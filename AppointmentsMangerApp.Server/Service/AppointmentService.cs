using System.Security.Claims;
using AppointmentsMangerApp.Server.Data;
using AppointmentsMangerApp.Server.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace AppointmentsMangerApp.Server.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AppointmentService(
            AppDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<Appointment>> GetAllAsync()
        {
            string userId = GetCurrentUserId();

            return await _context.Appointments
                .Where(a => a.UserId == userId)
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.Time)
                .ToListAsync();
        }

        public async Task<Appointment?> GetByIdAsync(int id)
        {
            string userId = GetCurrentUserId();

            return await _context.Appointments
                .FirstOrDefaultAsync(a => a.ID == id && a.UserId == userId);
        }

        public async Task<List<Appointment>> GetByFiltersAsync(Filter filters)
        {
            string userId = GetCurrentUserId();

            IQueryable<Appointment> query = _context.Appointments
                .Where(a => a.UserId == userId);

            if (filters.All)
            {
                return await query
                    .OrderBy(a => a.AppointmentDate)
                    .ThenBy(a => a.Time)
                    .ToListAsync();
            }

            if (filters.LevelofImportance != null)
            {
                query = query.Where(a => a.LevelOfImportance == filters.LevelofImportance);
            }

            if (filters.SpecifiedDate != null)
            {
                query = query.Where(a => a.AppointmentDate.Date == filters.SpecifiedDate.Value.Date);
            }

            if (filters.StartDate != null)
            {
                query = query.Where(a => a.AppointmentDate.Date >= filters.StartDate.Value.Date);
            }

            if (filters.EndDate != null)
            {
                query = query.Where(a => a.AppointmentDate.Date <= filters.EndDate.Value.Date);
            }

            if (!string.IsNullOrWhiteSpace(filters.SpecifiedTime))
            {
                string specifiedTime = filters.SpecifiedTime.Trim();
                query = query.Where(a => a.Time == specifiedTime);
            }

            query = query.Where(a =>
                a.IsDone == filters.Done &&
                a.Deleted == filters.Deleted);

            return await query
                .OrderBy(a => a.AppointmentDate)
                .ThenBy(a => a.Time)
                .ToListAsync();
        }

        public async Task<Appointment> CreateAsync(Appointment appointment)
        {
            string userId = GetCurrentUserId();

            NormalizeAppointment(appointment);

            List<string> validationErrors = ValidateAppointment(appointment, validatePastDate: true);

            if (validationErrors.Count > 0)
            {
                throw new ArgumentException(string.Join(" ", validationErrors));
            }

            appointment.ID = 0;
            appointment.UserId = userId;
            appointment.CreatedDate = DateTime.Now;
            appointment.ModifiedDate = DateTime.Now;
            appointment.Deleted = false;

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            return appointment;
        }

        public async Task UpdateAsync(int id, Appointment appointment)
        {
            string userId = GetCurrentUserId();

            if (id != appointment.ID)
            {
                throw new ArgumentException("You are trying to modify the wrong appointment.");
            }

            Appointment? existingAppointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.ID == id && a.UserId == userId);

            if (existingAppointment == null)
            {
                throw new KeyNotFoundException($"The appointment with ID {id} does not exist.");
            }

            NormalizeAppointment(appointment);

            bool dateWasChanged =
                existingAppointment.AppointmentDate.Date != appointment.AppointmentDate.Date;

            List<string> validationErrors = ValidateAppointment(
                appointment,
                validatePastDate: dateWasChanged);

            if (validationErrors.Count > 0)
            {
                throw new ArgumentException(string.Join(" ", validationErrors));
            }

            existingAppointment.Title = appointment.Title;
            existingAppointment.Description = appointment.Description;
            existingAppointment.Address = appointment.Address;
            existingAppointment.LevelOfImportance = appointment.LevelOfImportance;
            existingAppointment.IsDone = appointment.IsDone;
            existingAppointment.Deleted = appointment.Deleted;
            existingAppointment.AppointmentDate = appointment.AppointmentDate;
            existingAppointment.Time = appointment.Time;
            existingAppointment.ModifiedDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            string userId = GetCurrentUserId();

            Appointment? appointment = await _context.Appointments
                .FirstOrDefaultAsync(a => a.ID == id && a.UserId == userId);

            if (appointment == null)
            {
                throw new KeyNotFoundException($"No appointment with ID {id}.");
            }

            appointment.Deleted = true;
            appointment.ModifiedDate = DateTime.Now;

            await _context.SaveChangesAsync();
        }

        private string GetCurrentUserId()
        {
            string? userId = _httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
            {
                throw new UnauthorizedAccessException("User is not logged in.");
            }

            return userId;
        }

        private static List<string> ValidateAppointment(Appointment appointment, bool validatePastDate)
        {
            List<string> errors = new();

            if (string.IsNullOrWhiteSpace(appointment.Title))
            {
                errors.Add("Title is required.");
            }

            if (string.IsNullOrWhiteSpace(appointment.Address))
            {
                errors.Add("Address is required.");
            }

            if (appointment.AppointmentDate == default)
            {
                errors.Add("Date is required.");
            }

            if (string.IsNullOrWhiteSpace(appointment.Time))
            {
                errors.Add("Time is required.");
            }

            if (appointment.LevelOfImportance is < 1 or > 3)
            {
                errors.Add("Priority must be between 1 and 3.");
            }

            if (validatePastDate && appointment.AppointmentDate.Date < DateTime.Today)
            {
                errors.Add("You cannot create an appointment with a previous date.");
            }

            return errors;
        }

        private static void NormalizeAppointment(Appointment appointment)
        {
            appointment.Title = appointment.Title?.Trim() ?? string.Empty;
            appointment.Description = appointment.Description?.Trim() ?? string.Empty;
            appointment.Address = appointment.Address?.Trim() ?? string.Empty;
            appointment.Time = appointment.Time?.Trim() ?? string.Empty;
        }
    }
}