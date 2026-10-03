using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AuthenticationAndCoursesSqlServer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeOnly>(
                name: "AccessEndTime",
                table: "MembershipPlans",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AccessMode",
                table: "MembershipPlans",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<TimeOnly>(
                name: "AccessStartTime",
                table: "MembershipPlans",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CatalogCode",
                table: "MembershipPlans",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationMonths",
                table: "MembershipPlans",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SessionLimit",
                table: "MembershipPlans",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "UserAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    MustChangePassword = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SessionVersion = table.Column<int>(type: "int", nullable: false),
                    FailedLoginAttempts = table.Column<int>(type: "int", nullable: false),
                    LockedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    MemberId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StaffUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserAccounts", x => x.Id);
                    table.CheckConstraint("CK_UserAccounts_RoleProfile", "(\"Role\" = 'MEMBER' AND \"MemberId\" IS NOT NULL AND \"StaffUserId\" IS NULL) OR (\"Role\" IN ('ADMIN', 'EMPLOYEE') AND \"StaffUserId\" IS NOT NULL AND \"MemberId\" IS NULL)");
                    table.ForeignKey(
                        name: "FK_UserAccounts_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserAccounts_StaffUsers_StaffUserId",
                        column: x => x.StaffUserId,
                        principalTable: "StaffUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserAccounts_UserAccounts_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserAccounts_UserAccounts_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AuthSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserAccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuthSessions_UserAccounts_UserAccountId",
                        column: x => x.UserAccountId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CoachName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    DefaultCapacity = table.Column<int>(type: "int", nullable: false),
                    ReservationRequired = table.Column<bool>(type: "bit", nullable: false),
                    WomenOnly = table.Column<bool>(type: "bit", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    PubliclyVisible = table.Column<bool>(type: "bit", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Courses_UserAccounts_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Courses_UserAccounts_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassSeries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    AppliesFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    Recurrence = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Weekdays = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassSeries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassSeries_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassSeries_UserAccounts_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassSeries_UserAccounts_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CourseId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SeriesId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OccurrenceDate = table.Column<DateOnly>(type: "date", nullable: false),
                    StartsAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndsAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    BookedCount = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CoachOverride = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NotesOverride = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsOverride = table.Column<bool>(type: "bit", nullable: false),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassSessions", x => x.Id);
                    table.CheckConstraint("CK_ClassSession_Capacity", "\"Capacity\" > 0 AND \"BookedCount\" >= 0 AND \"BookedCount\" <= \"Capacity\"");
                    table.ForeignKey(
                        name: "FK_ClassSessions_ClassSeries_SeriesId",
                        column: x => x.SeriesId,
                        principalTable: "ClassSeries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassSessions_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassSessions_UserAccounts_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassSessions_UserAccounts_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ClassReservations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ClassSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MemberId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CancelledAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClassReservations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClassReservations_ClassSessions_ClassSessionId",
                        column: x => x.ClassSessionId,
                        principalTable: "ClassSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassReservations_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassReservations_UserAccounts_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClassReservations_UserAccounts_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "UserAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MembershipPlans_CatalogCode",
                table: "MembershipPlans",
                column: "CatalogCode",
                unique: true,
                filter: "\"CatalogCode\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AuthSessions_ExpiresAt",
                table: "AuthSessions",
                column: "ExpiresAt");

            migrationBuilder.CreateIndex(
                name: "IX_AuthSessions_UserAccountId",
                table: "AuthSessions",
                column: "UserAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassReservations_ClassSessionId_MemberId",
                table: "ClassReservations",
                columns: new[] { "ClassSessionId", "MemberId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassReservations_CreatedByUserId",
                table: "ClassReservations",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassReservations_MemberId",
                table: "ClassReservations",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassReservations_UpdatedByUserId",
                table: "ClassReservations",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSeries_CourseId",
                table: "ClassSeries",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSeries_CreatedByUserId",
                table: "ClassSeries",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSeries_UpdatedByUserId",
                table: "ClassSeries",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_CourseId",
                table: "ClassSessions",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_CreatedByUserId",
                table: "ClassSessions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_SeriesId_OccurrenceDate",
                table: "ClassSessions",
                columns: new[] { "SeriesId", "OccurrenceDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_StartsAt",
                table: "ClassSessions",
                column: "StartsAt");

            migrationBuilder.CreateIndex(
                name: "IX_ClassSessions_UpdatedByUserId",
                table: "ClassSessions",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_CreatedByUserId",
                table: "Courses",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_UpdatedByUserId",
                table: "Courses",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_CreatedByUserId",
                table: "UserAccounts",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_MemberId",
                table: "UserAccounts",
                column: "MemberId",
                unique: true,
                filter: "\"MemberId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_NormalizedEmail",
                table: "UserAccounts",
                column: "NormalizedEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_Role",
                table: "UserAccounts",
                column: "Role",
                unique: true,
                filter: "\"Role\" = 'ADMIN'");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_StaffUserId",
                table: "UserAccounts",
                column: "StaffUserId",
                unique: true,
                filter: "\"StaffUserId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_UserAccounts_UpdatedByUserId",
                table: "UserAccounts",
                column: "UpdatedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuthSessions");

            migrationBuilder.DropTable(
                name: "ClassReservations");

            migrationBuilder.DropTable(
                name: "ClassSessions");

            migrationBuilder.DropTable(
                name: "ClassSeries");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "UserAccounts");

            migrationBuilder.DropIndex(
                name: "IX_MembershipPlans_CatalogCode",
                table: "MembershipPlans");

            migrationBuilder.DropColumn(
                name: "AccessEndTime",
                table: "MembershipPlans");

            migrationBuilder.DropColumn(
                name: "AccessMode",
                table: "MembershipPlans");

            migrationBuilder.DropColumn(
                name: "AccessStartTime",
                table: "MembershipPlans");

            migrationBuilder.DropColumn(
                name: "CatalogCode",
                table: "MembershipPlans");

            migrationBuilder.DropColumn(
                name: "DurationMonths",
                table: "MembershipPlans");

            migrationBuilder.DropColumn(
                name: "SessionLimit",
                table: "MembershipPlans");
        }
    }
}
