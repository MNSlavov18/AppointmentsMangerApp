using AppointmentsMangerApp.Server.Data.Models;
using AppointmentsMangerApp.Server.Data.Models.Auth;
using Microsoft.AspNetCore.Identity;

namespace AppointmentsMangerApp.Server.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<AuthResultModel> RegisterAsync(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName))
            {
                return new AuthResultModel
                {
                    Success = false,
                    Message = "Username is required."
                };
            }

            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return new AuthResultModel
                {
                    Success = false,
                    Message = "Email is required."
                };
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return new AuthResultModel
                {
                    Success = false,
                    Message = "Password is required."
                };
            }

            ApplicationUser user = new ApplicationUser
            {
                UserName = request.UserName,
                Email = request.Email
            };

            IdentityResult result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                string errors = string.Join(" ", result.Errors.Select(e => e.Description));

                return new AuthResultModel
                {
                    Success = false,
                    Message = errors
                };
            }

            await _signInManager.SignInAsync(user, isPersistent: false);

            return new AuthResultModel
            {
                Success = true,
                Message = "Registration successful.",
                UserName = user.UserName,
                Email = user.Email
            };
        }

        public async Task<AuthResultModel> LoginAsync(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.UserName))
            {
                return new AuthResultModel
                {
                    Success = false,
                    Message = "Username is required."
                };
            }

            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return new AuthResultModel
                {
                    Success = false,
                    Message = "Password is required."
                };
            }

            ApplicationUser? user = await _userManager.FindByNameAsync(request.UserName);

            if (user == null)
            {
                return new AuthResultModel
                {
                    Success = false,
                    Message = "Invalid username or password."
                };
            }

            SignInResult result = await _signInManager.PasswordSignInAsync(
                user,
                request.Password,
                isPersistent: false,
                lockoutOnFailure: false);

            if (!result.Succeeded)
            {
                return new AuthResultModel
                {
                    Success = false,
                    Message = "Invalid username or password."
                };
            }

            return new AuthResultModel
            {
                Success = true,
                Message = "Login successful.",
                UserName = user.UserName,
                Email = user.Email
            };
        }

        public async Task LogoutAsync()
        {
            await _signInManager.SignOutAsync();
        }
    }
}