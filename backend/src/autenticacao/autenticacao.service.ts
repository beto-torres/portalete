import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { In, Repository } from 'typeorm';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User } from './usuario.entity';
import {
  AtualizarPerfilDto,
  LoginDto,
  RedefinirSenhaComCodigoDto,
  RegisterDto,
  SolicitarRedefinicaoDto,
} from './autenticacao.dto';
import { Role } from '../comum/perfil';
import { SolicitacaoRedefinicaoSenha, StatusSolicitacaoSenha } from './recuperacao-senha.entity';
import { ClassGroup, Course, SchoolGrade } from '../escola/escola.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(SolicitacaoRedefinicaoSenha) private solicitacoes: Repository<SolicitacaoRedefinicaoSenha>,
    @InjectRepository(Course) private courses: Repository<Course>,
    @InjectRepository(SchoolGrade) private grades: Repository<SchoolGrade>,
    @InjectRepository(ClassGroup) private classGroups: Repository<ClassGroup>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    // 1. Garantir cursos padrão
    const cursosPadrao = [
      { name: 'Desenvolvimento de Sistemas', acronym: 'DS' },
      { name: 'Nutrição e Dietética', acronym: 'NUT' },
    ];
    for (const c of cursosPadrao) {
      const existe = await this.courses.findOneBy({ acronym: c.acronym });
      if (!existe) await this.courses.save(this.courses.create(c));
    }

    // 2. Garantir séries padrão
    const seriesPadrao = [
      { name: '1º Ano', number: 1, acronym: '1º' },
      { name: '2º Ano', number: 2, acronym: '2º' },
      { name: '3º Ano', number: 3, acronym: '3º' },
    ];
    for (const s of seriesPadrao) {
      const existe = await this.grades.findOneBy({ acronym: s.acronym });
      if (!existe) await this.grades.save(this.grades.create(s));
    }

    // 3. Garantir turmas padrão
    const todosCursos = await this.courses.find();
    const todasSeries = await this.grades.find();
    for (const curso of todosCursos) {
      for (const serie of todasSeries) {
        for (const letra of ['A', 'B']) {
          const nomeTurma = `${serie.acronym} ${curso.acronym} ${letra}`;
          const existe = await this.classGroups.findOneBy({
            courseId: curso.id,
            gradeId: serie.id,
            letter: letra,
          });
          if (!existe) {
            await this.classGroups.save(
              this.classGroups.create({
                name: nomeTurma,
                letter: letra,
                courseId: curso.id,
                gradeId: serie.id,
              }),
            );
          }
        }
      }
    }

    // 4. Usuários de demonstração
    if (this.config.get<string>('NODE_ENV') === 'production') return;
    const turmaAlunoDemo = await this.classGroups.findOne({
      where: { name: '1º DS A' },
      relations: ['course', 'grade'],
    });

    const demos: {
      name: string;
      email: string;
      role: Role;
      courseId?: string;
      gradeId?: string;
      classGroupId?: string;
    }[] = [
      {
        name: 'João da Silva',
        email: 'aluno@etelimoeiro.com.br',
        role: Role.STUDENT,
        courseId: turmaAlunoDemo?.courseId,
        gradeId: turmaAlunoDemo?.gradeId,
        classGroupId: turmaAlunoDemo?.id,
      },
      {
        name: 'Maria Oliveira',
        email: 'professor@etelimoeiro.com.br',
        role: Role.TEACHER,
      },
      {
        name: 'Administrador do Portal',
        email: 'admin@etelimoeiro.com.br',
        role: Role.ADMIN,
      },
    ];

    for (const item of demos) {
      const existingUser = await this.users.findOneBy({ email: item.email });
      if (existingUser) {
        await this.users.update(existingUser.id, {
          name: item.name,
          role: item.role,
          ...(item.courseId ? { courseId: item.courseId, gradeId: item.gradeId, classGroupId: item.classGroupId } : {}),
        });
      } else {
        await this.users.save(
          this.users.create({
            name: item.name,
            email: item.email,
            role: item.role,
            courseId: item.courseId,
            gradeId: item.gradeId,
            classGroupId: item.classGroupId,
            passwordHash: await bcrypt.hash('12345', 8),
          }),
        );
      }
    }
  }

  async resolveAcademicLinks(dto: {
    courseId?: string;
    gradeId?: string;
    classGroupId?: string;
    curso?: string;
    serie?: string;
    turma?: string;
  }) {
    let classGroupId = dto.classGroupId;
    let courseId = dto.courseId;
    let gradeId = dto.gradeId;

    if (classGroupId) {
      const group = await this.classGroups.findOne({ where: { id: classGroupId }, relations: ['course', 'grade'] });
      if (group) {
        return { courseId: group.courseId, gradeId: group.gradeId, classGroupId: group.id };
      }
    }

    if (dto.curso && dto.serie && dto.turma) {
      const curso = await this.courses.findOne({
        where: [{ acronym: dto.curso }, { name: dto.curso }],
      });
      const serie = await this.grades.findOne({
        where: [{ acronym: dto.serie }, { name: dto.serie }],
      });
      if (curso && serie) {
        const letra = dto.turma.trim().slice(-1);
        const group = await this.classGroups.findOne({
          where: [
            { courseId: curso.id, gradeId: serie.id, letter: letra },
            { courseId: curso.id, gradeId: serie.id, name: dto.turma },
          ],
        });
        if (group) {
          return { courseId: curso.id, gradeId: serie.id, classGroupId: group.id };
        }
        return { courseId: curso.id, gradeId: serie.id, classGroupId: undefined };
      }
    }

    return { courseId, gradeId, classGroupId };
  }

  async register(dto: RegisterDto) {
    if (await this.users.findOneBy({ email: dto.email.toLowerCase() })) {
      throw new ConflictException('E-mail já cadastrado.');
    }
    if (dto.role === Role.TEACHER && dto.authorizationCode !== this.config.get('TEACHER_REGISTRATION_CODE', '@ProfAcesso10')) {
      throw new ForbiddenException('Código de professor inválido.');
    }
    if (dto.role === Role.ADMIN && dto.authorizationCode !== this.config.get('ADMIN_REGISTRATION_CODE', '@AdmAcesso10')) {
      throw new ForbiddenException('Código de administrador inválido.');
    }

    const role = dto.role ?? Role.STUDENT;
    let academic = { courseId: undefined as string | undefined, gradeId: undefined as string | undefined, classGroupId: undefined as string | undefined };
    if (role === Role.STUDENT) {
      academic = await this.resolveAcademicLinks(dto);
    }

    const user = await this.users.save(
      this.users.create({
        name: dto.name,
        email: dto.email.toLowerCase(),
        role,
        courseId: academic.courseId,
        gradeId: academic.gradeId,
        classGroupId: academic.classGroupId,
        passwordHash: await bcrypt.hash(dto.password, 8),
      }),
    );
    return this.session(user.id);
  }

  async getMe(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ['course', 'grade', 'classGroup'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return this.buildSafeUser(user);
  }

  async atualizarPerfil(userId: string, dto: AtualizarPerfilDto) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ['course', 'grade', 'classGroup'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    if (dto.name?.trim()) {
      user.name = dto.name.trim();
    }

    if (user.role === Role.STUDENT) {
      const academic = await this.resolveAcademicLinks(dto);
      if (academic.courseId !== undefined) user.courseId = academic.courseId;
      if (academic.gradeId !== undefined) user.gradeId = academic.gradeId;
      if (academic.classGroupId !== undefined) user.classGroupId = academic.classGroupId;
    }

    await this.users.save(user);
    return this.getMe(user.id);
  }

  async solicitarRedefinicao(dto: SolicitarRedefinicaoDto) {
    const user = await this.users.findOneBy({ email: dto.email.toLowerCase() });
    if (user) {
      const active = await this.solicitacoes.findOneBy({
        usuarioId: user.id,
        status: In([StatusSolicitacaoSenha.PENDENTE, StatusSolicitacaoSenha.APROVADA]),
      });
      if (!active) {
        await this.solicitacoes.save(
          this.solicitacoes.create({ usuarioId: user.id, motivo: dto.reason?.trim() || undefined }),
        );
      }
    }
    return { success: true, message: 'Se o e-mail estiver cadastrado, a solicitação foi enviada ao administrador.' };
  }

  async listarSolicitacoes() {
    const requests = await this.solicitacoes.find({
      where: { status: StatusSolicitacaoSenha.PENDENTE },
      relations: { usuario: true },
      order: { criadoEm: 'ASC' },
    });
    return requests.map((item) => ({
      id: item.id,
      reason: item.motivo,
      createdAt: item.criadoEm,
      user: {
        id: item.usuario.id,
        name: item.usuario.name,
        email: item.usuario.email,
        role: item.usuario.role,
      },
    }));
  }

  async aprovarSolicitacao(id: string) {
    const request = await this.solicitacoes.findOne({
      where: { id, status: StatusSolicitacaoSenha.PENDENTE },
      relations: { usuario: true },
    });
    if (!request) throw new NotFoundException('Solicitação pendente não encontrada.');
    const code = randomInt(100000, 1000000).toString();
    request.codigoHash = await bcrypt.hash(code, 8);
    request.codigoExpiraEm = new Date(Date.now() + 30 * 60 * 1000);
    request.aprovadoEm = new Date();
    request.status = StatusSolicitacaoSenha.APROVADA;
    await this.solicitacoes.save(request);
    return {
      success: true,
      code,
      expiresAt: request.codigoExpiraEm,
      user: { name: request.usuario.name, email: request.usuario.email },
    };
  }

  async redefinirSenhaComCodigo(dto: RedefinirSenhaComCodigoDto) {
    const user = await this.users.findOneBy({ email: dto.email.toLowerCase() });
    const request = user
      ? await this.solicitacoes.findOne({
          where: { usuarioId: user.id, status: StatusSolicitacaoSenha.APROVADA },
          order: { aprovadoEm: 'DESC' },
        })
      : null;
    if (!user || !request || !request.codigoHash) {
      throw new UnauthorizedException('Código temporário inválido ou já utilizado.');
    }
    if (!request.codigoExpiraEm || request.codigoExpiraEm.getTime() <= Date.now()) {
      request.status = StatusSolicitacaoSenha.PENDENTE;
      request.codigoHash = null;
      request.codigoExpiraEm = null;
      await this.solicitacoes.save(request);
      throw new BadRequestException('O código expirou. A solicitação voltou para aprovação do administrador.');
    }
    if (!(await bcrypt.compare(dto.code.trim(), request.codigoHash))) {
      throw new UnauthorizedException('Código temporário inválido ou já utilizado.');
    }
    user.passwordHash = await bcrypt.hash(dto.newPassword, 8);
    request.status = StatusSolicitacaoSenha.CONCLUIDA;
    request.codigoHash = null;
    request.codigoExpiraEm = null;
    request.concluidoEm = new Date();
    await this.users.save(user);
    await this.solicitacoes.save(request);
    return { success: true, message: 'Senha redefinida com sucesso. O código temporário foi invalidado.' };
  }

  async login(dto: LoginDto) {
    const user = await this.users.findOneBy({ email: dto.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }
    return this.session(user.id);
  }

  private buildSafeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      courseId: user.courseId ?? null,
      gradeId: user.gradeId ?? null,
      classGroupId: user.classGroupId ?? null,
      course: user.course
        ? { id: user.course.id, name: user.course.name, acronym: user.course.acronym }
        : null,
      grade: user.grade
        ? { id: user.grade.id, name: user.grade.name, acronym: user.grade.acronym, number: user.grade.number }
        : null,
      classGroup: user.classGroup
        ? { id: user.classGroup.id, name: user.classGroup.name, letter: user.classGroup.letter }
        : null,
      className: user.classGroup?.name ?? null,
    };
  }

  private async session(userId: string) {
    const user = await this.users.findOne({
      where: { id: userId },
      relations: ['course', 'grade', 'classGroup'],
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    const safeUser = this.buildSafeUser(user);
    return { accessToken: this.jwt.sign(safeUser), user: safeUser };
  }
}
