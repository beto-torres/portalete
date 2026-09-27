import {
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../autenticacao/usuario.entity';
import { Role } from '../comum/perfil';
import {
  ClassGroup,
  Course,
  ScheduleItem,
  SchoolEvent,
  SchoolGrade,
} from '../escola/escola.entity';
import {
  GrupoNotificacao,
  LeituraNotificacao,
  Notificacao,
  NotificacaoGrupo,
  TipoNotificacao,
} from './notificacao.entity';

type TurmaComRelacoes = ClassGroup & { course: Course; grade: SchoolGrade };

@Injectable()
export class NotificacoesService implements OnModuleInit {
  constructor(
    @InjectRepository(Notificacao)
    private readonly notifications: Repository<Notificacao>,
    @InjectRepository(GrupoNotificacao)
    private readonly groups: Repository<GrupoNotificacao>,
    @InjectRepository(NotificacaoGrupo)
    private readonly notificationGroups: Repository<NotificacaoGrupo>,
    @InjectRepository(LeituraNotificacao)
    private readonly reads: Repository<LeituraNotificacao>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(ClassGroup)
    private readonly classGroups: Repository<ClassGroup>,
    @InjectRepository(SchoolEvent)
    private readonly events: Repository<SchoolEvent>,
    @InjectRepository(ScheduleItem)
    private readonly schedules: Repository<ScheduleItem>,
  ) {}

  async onModuleInit() {
    await this.ensureAcademicGroups();

    for (const event of await this.events.find()) {
      await this.createForEvent(event);
    }
    for (const schedule of await this.schedules.find()) {
      await this.createForSchedule(schedule);
    }
  }

  private normalize(value: string) {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[º°]/g, '')
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private classCode(value: string) {
    return this.normalize(value).replace(/[^A-Z0-9]/g, '');
  }

  private async ensureGroup(code: string, name: string) {
    const normalizedCode = this.classCode(code);
    let group = await this.groups.findOneBy({ code: normalizedCode });
    if (!group) {
      group = await this.groups.save(
        this.groups.create({ code: normalizedCode, name }),
      );
    }
    return group;
  }

  private async ensureAcademicGroups() {
    await this.ensureGroup('ALUNOS', 'Todos os alunos');
    await this.ensureGroup('PROFESSORES', 'Professores');
    await this.ensureGroup('ADMIN', 'Administradores');

    const classes = await this.classGroups.find({
      relations: { course: true, grade: true },
    });
    for (const item of classes) {
      await this.ensureGroup(item.course.acronym, item.course.name);
      await this.ensureGroup(
        `${item.grade.number}${item.course.acronym}`,
        `${item.grade.name} - ${item.course.name}`,
      );
      await this.ensureGroup(this.classCode(item.name), item.name);
    }
  }

  private audienceAllows(event: SchoolEvent, item: TurmaComRelacoes) {
    const audience = this.normalize(event.audience || '');
    if (!audience || audience.includes('GERAL')) return true;

    const allCourses = audience.includes('TODOS OS CURSOS');
    const hasDS =
      /(^|\s|-)DS(\s|-|$)/.test(audience) ||
      audience.includes('DESENVOLVIMENTO DE SISTEMAS');
    const hasNUT =
      /(^|\s|-)NUT(\s|-|$)/.test(audience) ||
      audience.includes('NUTRICAO');
    if (!allCourses) {
      if (hasDS && !hasNUT && item.course.acronym !== 'DS') return false;
      if (hasNUT && !hasDS && item.course.acronym !== 'NUT') return false;
    }

    const allGrades =
      audience.includes('TODAS AS SERIES') ||
      audience.includes('TODOS OS ANOS');
    if (!allGrades) {
      const grades = [1, 2, 3].filter((number) =>
        new RegExp(`(^|\\s|-)${number}(\\s*ANO|\\s|-|$)`).test(audience),
      );
      if (grades.length && !grades.includes(item.grade.number)) return false;
    }

    const allClasses = audience.includes('TODAS AS TURMAS');
    if (!allClasses) {
      const hasA = audience.includes('TURMA A') || audience.includes('LETRA A');
      const hasB = audience.includes('TURMA B') || audience.includes('LETRA B');
      if (hasA && !hasB && item.letter !== 'A') return false;
      if (hasB && !hasA && item.letter !== 'B') return false;
    }
    return true;
  }

  private compressClassGroups(classes: TurmaComRelacoes[]) {
    const selected = new Map(classes.map((item) => [this.classCode(item.name), item]));
    const codes = new Set<string>();

    if (classes.length === 12) return ['ALUNOS'];

    for (const course of ['DS', 'NUT']) {
      const courseClasses = classes.filter((item) => item.course.acronym === course);
      if (courseClasses.length === 6) {
        codes.add(course);
        courseClasses.forEach((item) => selected.delete(this.classCode(item.name)));
      }
    }

    for (const course of ['DS', 'NUT']) {
      for (const grade of [1, 2, 3]) {
        const gradeClasses = [...selected.values()].filter(
          (item) =>
            item.course.acronym === course && item.grade.number === grade,
        );
        if (gradeClasses.length === 2) {
          codes.add(`${grade}${course}`);
          gradeClasses.forEach((item) =>
            selected.delete(this.classCode(item.name)),
          );
        }
      }
    }

    selected.forEach((_, code) => codes.add(code));
    return [...codes];
  }

  private async eventGroupCodes(event: SchoolEvent) {
    const classes = (await this.classGroups.find({
      relations: { course: true, grade: true },
    })) as TurmaComRelacoes[];
    return this.compressClassGroups(
      classes.filter((item) => this.audienceAllows(event, item)),
    );
  }

  private async attachGroups(notificationId: string, codes: string[]) {
    const uniqueCodes = [...new Set([...codes, 'ADMIN', 'PROFESSORES'])];
    const groups = await this.groups.findBy({ code: In(uniqueCodes) });
    await this.notificationGroups.upsert(
      groups.map((group) => ({ notificationId, groupId: group.id })),
      ['notificationId', 'groupId'],
    );
  }

  async createForEvent(event: SchoolEvent) {
    let notification = await this.notifications.findOneBy({ eventId: event.id });
    if (!notification) {
      const [year, month, day] = event.date.split('-');
      notification = await this.notifications.save(
        this.notifications.create({
          tipo: TipoNotificacao.EVENTO,
          title: event.title,
          message: `${day}/${month}/${year} às ${event.time.slice(0, 5)} - ${event.location} - ${event.audience}`,
          eventId: event.id,
          expiresAt: new Date(`${event.date}T23:59:59`),
        }),
      );
    }
    await this.attachGroups(notification.id, await this.eventGroupCodes(event));
  }

  async createForSchedule(schedule: ScheduleItem) {
    let notification = await this.notifications.findOneBy({ scheduleId: schedule.id });
    if (!notification) {
      notification = await this.notifications.save(
        this.notifications.create({
          tipo: TipoNotificacao.HORARIO,
          title: `Horário: ${schedule.subject}`,
          message: `${schedule.className} - ${schedule.lesson}ª aula - ${schedule.teacher}`,
          scheduleId: schedule.id,
        }),
      );
    }
    await this.attachGroups(notification.id, [this.classCode(schedule.className)]);
  }

  private async userGroupCodes(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: { course: true, grade: true, classGroup: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    if (user.role === Role.ADMIN) return ['ADMIN'];
    if (user.role === Role.TEACHER) return ['PROFESSORES'];

    const codes = ['ALUNOS'];
    if (user.course?.acronym) codes.push(user.course.acronym);
    if (user.course?.acronym && user.grade?.number) {
      codes.push(`${user.grade.number}${user.course.acronym}`);
    }
    if (user.classGroup?.name) codes.push(this.classCode(user.classGroup.name));
    return [...new Set(codes)];
  }

  async listForUser(userId: string) {
    const codes = await this.userGroupCodes(userId);
    return this.notifications
      .createQueryBuilder('notification')
      .innerJoin(NotificacaoGrupo, 'target', 'target.notificacao_id = notification.id')
      .innerJoin(GrupoNotificacao, 'group', 'group.id = target.grupo_id')
      .leftJoin(
        LeituraNotificacao,
        'reading',
        'reading.notificacao_id = notification.id AND reading.usuario_id = :userId',
        { userId },
      )
      .where('group.codigo IN (:...codes)', { codes })
      .andWhere('(notification.expira_em IS NULL OR notification.expira_em >= NOW())')
      .select([
        'notification.id AS id',
        'notification.tipo AS type',
        'notification.titulo AS title',
        'notification.mensagem AS message',
        'notification.evento_id AS "eventId"',
        'notification.horario_id AS "scheduleId"',
        'notification.criado_em AS "createdAt"',
        'reading.lida_em AS "readAt"',
      ])
      .distinct(true)
      .orderBy('notification.criado_em', 'DESC')
      .getRawMany();
  }

  async unreadCount(userId: string) {
    const notifications = await this.listForUser(userId);
    return notifications.filter((item) => !item.readAt).length;
  }

  async markAsRead(notificationId: string, userId: string) {
    const allowed = (await this.listForUser(userId)).some(
      (item) => item.id === notificationId,
    );
    if (!allowed) throw new NotFoundException('Notificação não encontrada.');
    await this.reads.upsert({ notificationId, userId }, ['notificationId', 'userId']);
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    const notifications = await this.listForUser(userId);
    const unread = notifications.filter((item) => !item.readAt);
    if (unread.length) {
      await this.reads.upsert(
        unread.map((item) => ({ notificationId: item.id, userId })),
        ['notificationId', 'userId'],
      );
    }
    return { success: true, count: unread.length };
  }
}
