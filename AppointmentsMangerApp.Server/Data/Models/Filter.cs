namespace AppointmentsMangerApp.Server.Data.Models
{
    public class Filter
    {
        public byte? LevelofImportance { get; set; }

        public string? SpecifiedTime { get; set; }

        public DateTime? SpecifiedDate { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool All { get; set; } = false;

        public bool Done { get; set; } = false;

        public bool Deleted { get; set; } = false;

       
    }
}
