import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Public, Roles } from '../comum/autenticacao';
import { Role } from '../comum/perfil';
import { SchoolService } from './escola.service';
import {
  CountdownDto,
  EventDto,
  ScheduleDto,
  SuggestionDto,
  UpdateSuggestionStatusDto,
} from './escola.dto';

@Controller()
export class SchoolController {
  constructor(private school: SchoolService) {}

  @Public()
  @Get('events')
  events() {
    return this.school.listEvents();
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Post('events')
  createEvent(@Body() dto: EventDto) {
    return this.school.createEvent(dto);
  }

  @Roles(Role.TEACHER, Role.ADMIN)
  @Delete('events/:id')
  deleteEvent(@Param('id') id: string) {
    return this.school.deleteEvent(id);
  }

  @Public()
  @Get('schedules')
  schedules() {
    return this.school.listSchedules();
  }

  @Roles(Role.ADMIN)
  @Post('schedules')
  createSchedule(@Body() dto: ScheduleDto) {
    return this.school.createSchedule(dto);
  }

  @Roles(Role.ADMIN)
  @Delete('schedules/:id')
  deleteSchedule(@Param('id') id: string) {
    return this.school.deleteSchedule(id);
  }

  @Public()
  @Get('countdowns')
  countdowns() {
    return this.school.listCountdowns();
  }

  @Roles(Role.ADMIN)
  @Post('countdowns')
  createCountdown(@Body() dto: CountdownDto) {
    return this.school.createCountdown(dto);
  }

  @Roles(Role.ADMIN)
  @Delete('countdowns/:id')
  deleteCountdown(@Param('id') id: string) {
    return this.school.deleteCountdown(id);
  }

  @Roles(Role.ADMIN)
  @Get('suggestions')
  suggestions() {
    return this.school.listSuggestions();
  }

  @Roles(Role.STUDENT)
  @Post('suggestions')
  createSuggestion(@Body() dto: SuggestionDto) {
    return this.school.createSuggestion(dto);
  }

  @Roles(Role.ADMIN)
  @Patch('suggestions/:id/status')
  updateSuggestionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateSuggestionStatusDto,
  ) {
    return this.school.updateSuggestionStatus(id, dto.status);
  }

  @Roles(Role.ADMIN)
  @Delete('suggestions/:id')
  deleteSuggestion(@Param('id') id: string) {
    return this.school.deleteSuggestion(id);
  }

  @Public()
  @Get('academic/structure')
  academicStructure() {
    return this.school.getAcademicStructure();
  }

  @Public()
  @Get('courses')
  courses() {
    return this.school.listCourses();
  }

  @Public()
  @Get('grades')
  grades() {
    return this.school.listGrades();
  }

  @Public()
  @Get('classes')
  classes() {
    return this.school.listClassGroups();
  }
}
