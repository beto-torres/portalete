import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ClassGroup,
  Countdown,
  Course,
  ScheduleItem,
  SchoolEvent,
  SchoolGrade,
  Suggestion,
} from './escola.entity';
import {
  CountdownDto,
  EventDto,
  ScheduleDto,
  StatusSuggestion,
  SuggestionDto,
} from './escola.dto';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(SchoolEvent) private events: Repository<SchoolEvent>,
    @InjectRepository(ScheduleItem) private schedules: Repository<ScheduleItem>,
    @InjectRepository(Countdown) private countdowns: Repository<Countdown>,
    @InjectRepository(Suggestion) private suggestions: Repository<Suggestion>,
    @InjectRepository(Course) private courses: Repository<Course>,
    @InjectRepository(SchoolGrade) private grades: Repository<SchoolGrade>,
    @InjectRepository(ClassGroup) private classGroups: Repository<ClassGroup>,
    private readonly notifications: NotificacoesService,
  ) {}

  listEvents() {
    return this.events.find({ order: { date: 'ASC' } });
  }

  async createEvent(dto: EventDto) {
    const event = await this.events.save(this.events.create(dto));
    await this.notifications.createForEvent(event);
    return event;
  }

  async deleteEvent(id: string) {
    if (!(await this.events.delete(id)).affected) {
      throw new NotFoundException('Evento não encontrado.');
    }
    return { success: true };
  }

  listSchedules() {
    return this.schedules.find({
      order: { className: 'ASC', day: 'ASC', lesson: 'ASC' },
    });
  }

  async createSchedule(dto: ScheduleDto) {
    if (
      await this.schedules.findOneBy({
        className: dto.className,
        day: dto.day,
        lesson: dto.lesson,
      })
    ) {
      throw new ConflictException('Já existe uma aula nesse horário.');
    }
    const schedule = await this.schedules.save(this.schedules.create(dto));
    await this.notifications.createForSchedule(schedule);
    return schedule;
  }

  async deleteSchedule(id: string) {
    await this.schedules.delete(id);
    return { success: true };
  }

  listCountdowns() {
    return this.countdowns.find({ order: { date: 'ASC' } });
  }

  createCountdown(dto: CountdownDto) {
    return this.countdowns.save(
      this.countdowns.create({ ...dto, active: dto.active ?? true }),
    );
  }

  async deleteCountdown(id: string) {
    await this.countdowns.delete(id);
    return { success: true };
  }

  listSuggestions() {
    return this.suggestions.find({ order: { createdAt: 'DESC' } });
  }

  createSuggestion(dto: SuggestionDto) {
    return this.suggestions.save(this.suggestions.create(dto));
  }

  async updateSuggestionStatus(id: string, status: StatusSuggestion) {
    const suggestion = await this.suggestions.findOneBy({ id });
    if (!suggestion) throw new NotFoundException('Sugestão não encontrada.');
    suggestion.status = status;
    return this.suggestions.save(suggestion);
  }

  async deleteSuggestion(id: string) {
    if (!(await this.suggestions.delete(id)).affected) {
      throw new NotFoundException('Sugestão não encontrada.');
    }
    return { success: true };
  }

  async getAcademicStructure() {
    const [courses, grades, classGroups] = await Promise.all([
      this.courses.find({ order: { name: 'ASC' } }),
      this.grades.find({ order: { number: 'ASC' } }),
      this.classGroups.find({
        relations: ['course', 'grade'],
        order: { name: 'ASC' },
      }),
    ]);
    return { courses, grades, classGroups };
  }

  listCourses() {
    return this.courses.find({ order: { name: 'ASC' } });
  }

  listGrades() {
    return this.grades.find({ order: { number: 'ASC' } });
  }

  listClassGroups() {
    return this.classGroups.find({
      relations: ['course', 'grade'],
      order: { name: 'ASC' },
    });
  }
}
