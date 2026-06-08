using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentsMangerApp.Server.Data.Models
{
    public class Appointment
    {
        [Key]
        public int ID { get; set; }

        [Required, MaxLength(150), Column(TypeName="nvarchar(150)")]
        public string Title { get; set; } = string.Empty;

        [MaxLength(300), Column(TypeName = "nvarchar(300)")]
        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "datetime")]
        public DateTime CreatedDate { get; set; } = DateTime.Now;

        [Column(TypeName = "datetime")]
        public DateTime ModifiedDate { get; set; } = DateTime.Now;

        [Column(TypeName = "datetime")]
        public DateTime AppointmentDate { get; set; } = DateTime.Now;

        [Required, MaxLength(100), Column(TypeName = "nvarchar(100)")]
        public string Address { get; set; } = string.Empty;

        [Required, MaxLength(10), Column(TypeName ="nvarchar(10)")]
        public string Time { get; set; } = string.Empty;

        public bool IsDone { get; set; } = false;

        public bool Deleted { get; set; } = false;

        [Range(1, 3)]
        public byte LevelOfImportance { get; set; } = 2;

        public string UserId { get; set; } = string.Empty;

        public ApplicationUser? User { get; set; }
    }
}
