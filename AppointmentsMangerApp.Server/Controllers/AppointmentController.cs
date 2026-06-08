using AppointmentsMangerApp.Server.Data.Models;
using AppointmentsMangerApp.Server.Services;
using Microsoft.AspNetCore.Mvc;

namespace AppointmentsMangerApp.Server.Controllers
{
    [Route("api/appointment")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        // GET: api/appointment
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            List<Appointment> appointments = await _appointmentService.GetAllAsync();

            if (appointments.Count == 0)
            {
                return NotFound("No data found.");
            }

            return Ok(appointments);
        }

        // GET: api/appointment/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Appointment>> GetAppointment(int id)
        {
            Appointment? appointment = await _appointmentService.GetByIdAsync(id);

            if (appointment == null)
            {
                return NotFound($"No appointment with ID {id}.");
            }

            return Ok(appointment);
        }

        // POST: api/appointment/filters
        [HttpPost("filters")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointmentsByFilters(Filter filters)
        {
            List<Appointment> appointments = await _appointmentService.GetByFiltersAsync(filters);

            return Ok(appointments);
        }

        // POST: api/appointment
        [HttpPost]
        public async Task<ActionResult<Appointment>> PostAppointment(Appointment appointment)
        {
            try
            {
                Appointment createdAppointment = await _appointmentService.CreateAsync(appointment);

                return CreatedAtAction(
                    nameof(GetAppointment),
                    new { id = createdAppointment.ID },
                    createdAppointment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // PUT: api/appointment/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAppointment(int id, Appointment appointment)
        {
            try
            {
                await _appointmentService.UpdateAsync(id, appointment);

                return Ok("Appointment updated successfully.");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        // DELETE: api/appointment/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            try
            {
                await _appointmentService.SoftDeleteAsync(id);

                return Ok("Appointment deleted successfully.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}