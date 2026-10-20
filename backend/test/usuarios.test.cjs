const { test } = require('node:test');
const assert = require('node:assert/strict');
require('reflect-metadata');
const bcrypt = require('bcryptjs');
const { validate } = require('class-validator');
const { AuthService } = require('../dist/autenticacao/autenticacao.service');
const { AuthGuard, RolesGuard } = require('../dist/comum/autenticacao');
const { UsuariosController } = require('../dist/autenticacao/usuarios.controller');
const { CriarUsuarioDto, EditarUsuarioDto } = require('../dist/autenticacao/usuarios.dto');
const { User } = require('../dist/autenticacao/usuario.entity');
const { ClassGroup } = require('../dist/escola/escola.entity');

function fixture() {
  const rows = [{ id: 'admin', name: 'Admin', email: 'admin@ete.com', role: 'admin' }];
  let resetsDeleted = false;
  const repo = {
    create: () => ({}),
    find: async () => rows,
    findOneBy: async (where) => rows.find((row) => Object.entries(where).every(([key, value]) => row[key] === value)) ?? null,
    findOneOrFail: async ({ where }) => repo.findOneBy(where),
    countBy: async ({ role }) => rows.filter((row) => row.role === role).length,
    save: async (row) => { if (!row.id) { row.id = 'new'; rows.push(row); } return row; },
    delete: async (id) => { rows.splice(rows.findIndex((row) => row.id === id), 1); },
    createQueryBuilder: () => ({ setLock() { return this; }, where() { return this; }, getMany: async () => rows.filter((row) => row.role === 'admin') }),
  };
  const manager = { getRepository: (entity) => entity === User ? repo : entity === ClassGroup ? { findOneBy: async ({ id }) => id === 'class' ? { id, courseId: 'course', gradeId: 'grade' } : null } : { delete: async () => { resetsDeleted = true; } } };
  repo.manager = { transaction: (callback) => callback(manager) };
  return { service: new AuthService(repo), repo, rows, resetsDeleted: () => resetsDeleted };
}

test('CRUD: criação, consulta segura, atualização de perfil e exclusão', async () => {
  const { service, rows, resetsDeleted } = fixture();
  const created = await service.salvarUsuario({ name: ' Aluno ', email: 'ALUNO@ete.com', role: 'aluno', password: '12345', classGroupId: 'class' });
  assert.equal(created.name, 'Aluno');
  assert.equal(created.email, 'aluno@ete.com');
  assert.equal(created.courseId, 'course');
  assert.equal(created.gradeId, 'grade');
  assert.ok(!('passwordHash' in created));
  assert.ok(await bcrypt.compare('12345', rows[1].passwordHash));
  assert.equal((await service.listarUsuarios()).length, 2);
  const updated = await service.salvarUsuario({ role: 'professor', password: '54321' }, created.id, 'admin');
  assert.equal(updated.classGroupId, null);
  assert.ok(resetsDeleted());
  await service.excluirUsuario(created.id, 'admin');
  assert.equal(rows.length, 1);
});

test('rejeita e-mail duplicado, turma inválida e usuário inexistente', async () => {
  const { service } = fixture();
  await assert.rejects(service.salvarUsuario({ email: 'admin@ete.com', role: 'aluno' }), /E-mail já cadastrado/);
  await assert.rejects(service.salvarUsuario({ email: 'novo@ete.com', role: 'aluno', classGroupId: 'missing' }), /Turma não encontrada/);
  await assert.rejects(service.salvarUsuario({}, 'missing', 'admin'), /Usuário não encontrado/);
  await assert.rejects(service.excluirUsuario('missing', 'admin'), /Usuário não encontrado/);
});

test('impede autoexclusão, rebaixamento próprio e remoção do último administrador', async () => {
  const { service } = fixture();
  await assert.rejects(service.excluirUsuario('admin', 'admin'), /própria conta/);
  await assert.rejects(service.salvarUsuario({ role: 'aluno' }, 'admin', 'admin'), /próprio perfil/);
  await assert.rejects(service.excluirUsuario('admin', 'other'), /pelo menos um administrador/);
  await assert.rejects(service.salvarUsuario({ role: 'professor' }, 'admin', 'other'), /pelo menos um administrador/);
});

test('todas as rotas CRUD exigem administrador; guard consulta o perfil atual', async () => {
  assert.deepEqual(Reflect.getMetadata('roles', UsuariosController), ['admin']);
  const request = { headers: { authorization: 'Bearer token' } };
  const context = { getHandler: () => UsuariosController.prototype.listar, getClass: () => UsuariosController, switchToHttp: () => ({ getRequest: () => request }) };
  const reflector = { getAllAndOverride: (key) => key === 'roles' ? ['admin'] : false };
  const repo = { findOneBy: async () => ({ id: 'user', role: 'professor' }) };
  const guard = new AuthGuard({ verify: () => ({ id: 'user', role: 'admin' }) }, reflector, repo);
  await guard.canActivate(context);
  assert.equal(new RolesGuard(reflector).canActivate(context), false);
  repo.findOneBy = async () => null;
  await assert.rejects(guard.canActivate(context), /Sessão inválida/);
  request.headers = {};
  await assert.rejects(guard.canActivate(context), /Faça login/);
});

test('DTOs rejeitam campos inválidos e aceitam remoção explícita do vínculo', async () => {
  const invalid = Object.assign(new CriarUsuarioDto(), { name: ' ', email: 'invalid', password: '12', role: 'invalid', classGroupId: 'invalid' });
  assert.equal((await validate(invalid)).length, 5);
  assert.equal((await validate(Object.assign(new EditarUsuarioDto(), { classGroupId: null }))).length, 0);
  assert.ok((await validate(Object.assign(new EditarUsuarioDto(), { role: null }))).length);
});
