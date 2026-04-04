using Microsoft.EntityFrameworkCore;

namespace AppointmentsMangerApp.Server.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Models.Appointment> Appointments { get; set; }
    }
}
