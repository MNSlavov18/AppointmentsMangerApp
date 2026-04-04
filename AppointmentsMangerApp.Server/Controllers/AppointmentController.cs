using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AppointmentsMangerApp.Server.Data;
using AppointmentsMangerApp.Server.Data.Models;

namespace AppointmentsMangerApp.Server.Controllers
{
    [Route("api/appointment")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/appointment - default
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            if (_context.Appointments == null)
            {
                return NotFound("No Data Found!");
            }

            return await _context.Appointments
                .OrderBy(e => e.AppointmentDate)
                .ThenBy(e => e.Time)
                .ToListAsync();
        }

        // GET: api/Appointment/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            if (_context.Appointments == null)
            {
                return NotFound("No Data Found!");
            }

            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound("No Data Found!");
            }

            return appointment;
        }

        [HttpPost("filters")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointmentsByFilters(Filter filters)
        {
            if (_context.Appointments == null)
            {
                return NotFound("No Data Found!");
            }
            
            List<Appointment> allData = await _context.Appointments.ToListAsync();

            if (filters.All)
            {
                return allData;
            }

            if (filters.LevelofImportance != null)
            {
                allData = allData.Where(e => e.LevelOfImportance == filters.LevelofImportance).ToList();
            }

            if (filters.SpecifiedDate != null)
            {
                allData = allData
                    .Where(e => e.AppointmentDate.Date == filters.SpecifiedDate.Value.Date)
                    .ToList();
            }

            if (filters.StartDate != null && filters.EndDate != null)
            {
                allData = allData
                    .Where(e => e.AppointmentDate.Date >= filters.StartDate.Value.Date &&
                                e.AppointmentDate.Date <= filters.EndDate.Value.Date)
                    .ToList();
            }

            if (filters.SpecifiedTime != null)
            {
                allData = allData.Where(e => e.Time == filters.SpecifiedTime).ToList();
            }

            allData = allData.Where(e => e.IsDone == filters.Done && e.Deleted == filters.Deleted).ToList();

            return allData;
        }


        // PUT: api/Appointment/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAppointment(int id, Appointment appointment)
        {
            if (id != appointment.ID)
            {
                return BadRequest("You are tying to modify the wrong appointment!");
            }

            Appointment? entry_ = await _context.Appointments.FirstOrDefaultAsync(e => e.ID == appointment.ID);
            if (entry_ == null)
            {
                return NotFound("The appointment with ID" + " " + id + " ,does not exist!");
            }

            NormalizeAppointment(appointment);

            bool validatePastDate = entry_.AppointmentDate.Date != appointment.AppointmentDate.Date
                || entry_.AppointmentDate.Date >= DateTime.Today;

            List<string> validationErrors = ValidateAppointment(appointment, validatePastDate);
            if (validationErrors.Count > 0)
            {
                return BadRequest(string.Join(" ", validationErrors));
            }

            try
            {
                if (entry_.Title != appointment.Title)
                { 
                    entry_.Title = appointment.Title;
                }

                if (entry_.Description != appointment.Description)
                {
                    entry_.Description = appointment.Description;
                }

                if (entry_.Address != appointment.Address)
                {
                    entry_.Address = appointment.Address;
                }

                if (entry_.LevelOfImportance != appointment.LevelOfImportance)
                {
                    entry_.LevelOfImportance = appointment.LevelOfImportance;
                }

                if (entry_.IsDone != appointment.IsDone)
                {
                    entry_.IsDone = appointment.IsDone;
                }

                if (entry_.Deleted != appointment.Deleted)
                {
                    entry_.Deleted = appointment.Deleted;
                }

                if (entry_.AppointmentDate != appointment.AppointmentDate)
                {
                    entry_.AppointmentDate = appointment.AppointmentDate;
                }

                if (entry_.Time != appointment.Time)
                {
                    entry_.Time = appointment.Time;
                }

                entry_.ModifiedDate = DateTime.Now;

                await _context.SaveChangesAsync();
            }

            catch (DbUpdateConcurrencyException)
            {
                throw;
            }

            return Ok("Appointmet updated successfully!");
        }

        // POST: api/Appointment
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Appointment>> PostAppointment(Appointment appointment)
        {
            if (_context.Appointments == null)
            {
                return Problem("Entity set 'Appointments'  is null.");
            }

            NormalizeAppointment(appointment);

            List<string> validationErrors = ValidateAppointment(appointment, validatePastDate: true);
            if (validationErrors.Count > 0)
            {
                return BadRequest(string.Join(" ", validationErrors));
            }

            try
            {
                appointment.CreatedDate = DateTime.Now;
                appointment.ModifiedDate = DateTime.Now;
                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException e)
            {
                return BadRequest("Could not create new Appointment: " + e.Message);
            }

            return CreatedAtAction("GetAppointment", new { id = appointment.ID }, appointment);
        }

        // DELETE: api/Appointment/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            if (_context.Appointments == null)
            {
                return NotFound("No Data Fount!");
            }

            var appointment = await _context.Appointments.FirstOrDefaultAsync(e => e.ID == id);
            if (appointment == null)
            {
                return NotFound("No appointment with the ID " + id);
            }
            
            appointment.ModifiedDate = DateTime.Now;
            appointment.Deleted = true;
            await _context.SaveChangesAsync();

            return Ok("Appoinment deleted successfully");
        }

        private bool AppointmentExists(int id)
        {
            return _context.Appointments.Any(e => e.ID == id);
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
                errors.Add("Priority is required.");
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
