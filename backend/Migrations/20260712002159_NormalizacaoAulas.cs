using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class NormalizacaoAulas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Data",
                table: "RegistrosFrequencia");

            migrationBuilder.DropColumn(
                name: "Observacao",
                table: "RegistrosFrequencia");

            migrationBuilder.AddColumn<Guid>(
                name: "AulaId",
                table: "RegistrosFrequencia",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Aulas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DisciplinaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    Horario = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Conteudo = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Aulas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Aulas_Disciplinas_DisciplinaId",
                        column: x => x.DisciplinaId,
                        principalTable: "Disciplinas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosFrequencia_AulaId_AlunoId",
                table: "RegistrosFrequencia",
                columns: new[] { "AulaId", "AlunoId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Aulas_DisciplinaId",
                table: "Aulas",
                column: "DisciplinaId");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistrosFrequencia_Aulas_AulaId",
                table: "RegistrosFrequencia",
                column: "AulaId",
                principalTable: "Aulas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistrosFrequencia_Aulas_AulaId",
                table: "RegistrosFrequencia");

            migrationBuilder.DropTable(
                name: "Aulas");

            migrationBuilder.DropIndex(
                name: "IX_RegistrosFrequencia_AulaId_AlunoId",
                table: "RegistrosFrequencia");

            migrationBuilder.DropColumn(
                name: "AulaId",
                table: "RegistrosFrequencia");

            migrationBuilder.AddColumn<DateOnly>(
                name: "Data",
                table: "RegistrosFrequencia",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<string>(
                name: "Observacao",
                table: "RegistrosFrequencia",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
