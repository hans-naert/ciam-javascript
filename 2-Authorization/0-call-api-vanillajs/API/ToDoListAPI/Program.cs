using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Identity.Web;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Logging; 
using Microsoft.OpenApi.Models; 
using System.Collections.Generic;  
using System;
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

builder.Services.AddEndpointsApiExplorer();
// Add Swagger and Swagger UI
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.OAuth2,
        Flows = new OpenApiOAuthFlows
        {
            Implicit = new OpenApiOAuthFlow
            {
                AuthorizationUrl = new Uri("https://exthn2025.ciamlogin.com/2744ce4b-6c74-4383-9e49-d4efddb5fb18/oauth2/v2.0/authorize?prompt=login"),
                Scopes = new Dictionary<string, string>
                {
                    { "api://606234e3-a749-4618-8831-224aec13cff4/ToDoList.Read", "Read to-do items" },
                    { "api://606234e3-a749-4618-8831-224aec13cff4/ToDoList.ReadWrite", "Write to-do items" }
                }
            }
        }
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
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
            new string[] { "api://606234e3-a749-4618-8831-224aec13cff4/ToDoList.Read", "api://606234e3-a749-4618-8831-224aec13cff4/ToDoList.ReadWrite" }
        }
    });
});

// Register other services
builder.Services.AddControllers();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Since IdentityModel version 5.2.1 (or since Microsoft.AspNetCore.Authentication.JwtBearer version 2.2.0),
    // Personal Identifiable Information is not written to the logs by default, to be compliant with GDPR.
    // For debugging/development purposes, one can enable additional detail in exceptions by setting IdentityModelEventSource.ShowPII to true.
    // Microsoft.IdentityModel.Logging.IdentityModelEventSource.ShowPII = true;
    app.UseDeveloperExceptionPage();
    app.UseSwagger(); 
  app.UseSwaggerUI();
  app.UseSwaggerUI(options => // UseSwaggerUI is called only in Development.
  {
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
     options.OAuthClientId("3e68d9d1-19e2-4db8-a377-4f79d62e0e54"); // Important! Use SPA client ID
    options.OAuthUsePkce(); // Important! Use PKCE instead of implicit flow
    options.RoutePrefix = string.Empty;
  });

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

app.Run();
