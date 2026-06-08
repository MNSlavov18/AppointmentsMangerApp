using AppointmentsMangerApp.Server.Data.Models.Auth;

namespace AppointmentsMangerApp.Server.Services
{
    public interface IAuthService
    {
        Task<AuthResultModel> RegisterAsync(RegisterRequest request);

        Task<AuthResultModel> LoginAsync(LoginRequest request);

        Task LogoutAsync();
    }
}