using AppointmentsMangerApp.Server.Data.Models;
using AppointmentsMangerApp.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppointmentsMangerApp.Server.Controllers
{
    [Authorize]
    [Route("api/appointment")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            List<Appointment> appointments = await _appointmentService.GetAllAsync();

            return Ok(appointments);
        }

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

        [HttpPost("filters")]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointmentsByFilters(Filter filters)
        {
            List<Appointment> appointments = await _appointmentService.GetByFiltersAsync(filters);

            return Ok(appointments);
        }

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