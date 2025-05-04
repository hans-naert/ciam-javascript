using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Web;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;

using ToDoListAPI.Context;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddMicrosoftIdentityWebApi(options =>
            {
                builder.Configuration.Bind("AzureAd", options);
                options.Events = new JwtBearerEvents();

                /// <summary>
                /// Below you can do extended token validation and check for additional claims, such as:
                ///
                /// - check if the caller's tenant is in the allowed tenants list via the 'tid' claim (for multi-tenant applications)
                /// - check if the caller's account is homed or guest via the 'acct' optional claim
                /// - check if the caller belongs to right roles or groups via the 'roles' or 'groups' claim, respectively
                ///
                /// Bear in mind that you can do any of the above checks within the individual routes and/or controllers as well.
                /// For more information, visit: https://docs.microsoft.com/azure/active-directory/develop/access-tokens#validate-the-user-has-permission-to-access-this-data
                /// </summary>

                //options.Events.OnTokenValidated = async context =>
                //{
                //    string[] allowedClientApps = { /* list of client ids to allow */ };

                //    string clientappId = context?.Principal?.Claims
                //        .FirstOrDefault(x => x.Type == "azp" || x.Type == "appid")?.Value;

                //    if (!allowedClientApps.Contains(clientappId))
                //    {
                //        throw new System.Exception("This client is not authorized");
                //    }
                //};
            }, options => { builder.Configuration.Bind("AzureAd", options); });

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "My API", Version = "v1" });

    c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Flows = new OpenApiOAuthFlows
        {
            AuthorizationCode = new OpenApiOAuthFlow
            {
                AuthorizationUrl = new Uri("https://exthn2025.ciamlogin.com/2744ce4b-6c74-4383-9e49-d4efddb5fb18/oauth2/v2.0/authorize?p=userflow-quickstart-angular"),
                TokenUrl = new Uri("https://exthn2025.ciamlogin.com/2744ce4b-6c74-4383-9e49-d4efddb5fb18/oauth2/v2.0/token?p=userflow-quickstart-angular"),
                Scopes = new Dictionary<string, string>
                {
                    { "api://606234e3-a749-4618-8831-224aec13cff4/ToDolist.ReadWrite", "Read and write access" },
                    { "openid", "Sign in" },
                    { "profile", "User profile" }
                }
            }
        }
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "oauth2"
                }
            },
            new[] { "api://606234e3-a749-4618-8831-224aec13cff4/ToDolist.ReadWrite", "openid", "profile" }
        }
    });
});


builder.Services.AddDbContext<ToDoContext>(options =>
{
    options.UseInMemoryDatabase("ToDos");
});

builder.Services.AddControllers();

// Allowing CORS for all domains and HTTP methods for the purpose of the sample
// In production, modify this with the actual domains and HTTP methods you want to allow
builder.Services.AddCors(o => o.AddPolicy("default", builder =>
{
    builder.AllowAnyOrigin()
           .AllowAnyMethod()
           .AllowAnyHeader();
}));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Since IdentityModel version 5.2.1 (or since Microsoft.AspNetCore.Authentication.JwtBearer version 2.2.0),
    // Personal Identifiable Information is not written to the logs by default, to be compliant with GDPR.
    // For debugging/development purposes, one can enable additional detail in exceptions by setting IdentityModelEventSource.ShowPII to true.
    // Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
    app.UseDeveloperExceptionPage();
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseCors("default");
app.UseHttpsRedirection();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API V1");
    c.OAuthClientId("3e68d9d1-19e2-4db8-a377-4f79d62e0e54");
    c.OAuthUsePkce(); // Enables PKCE
    c.OAuthAppName("My Swagger UI with CIAM");
    c.OAuthScopeSeparator(" ");
});

app.Run();
