namespace AppointmentsMangerApp.Server.Data.Models.Auth
{
    public class AuthResultModel
    {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public string? UserName { get; set; }

        public string? Email { get; set; }
    }
}