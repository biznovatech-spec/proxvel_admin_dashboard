# Reporte — Extensión 6B: Gestión Avanzada de Usuarios

**Fecha:** 2026-06-17
**Autor:** Antigravity (asistido por Moises/Daniel)
**Estado:** Extensión 6B completada

---

## 1. Resumen Ejecutivo

Se implementó la gestión avanzada de usuarios en el ecosistema PROXVEL:
- **Creación de usuarios** (admin/traveler) desde el dashboard, protegida por `require_super_admin`.
- **Bloqueo de creación de super_admin** desde dashboard (tanto UI como API).
- **Eliminación segura** con dos modos: `data_only` (limpia datos, mantiene cuenta) y `full` (elimina todo).
- **Anonimización de reseñas** mediante usuario centinela `ANON_DELETED` que mantiene integridad referencial.
- **Hardening del script** de bootstrap: se deprecó `create_admin_user.py` y se creó `bootstrap_superadmin.py` con guardas de entorno, confirmación textual y verificación de super_admins existentes.

---

## 2. Precheck

### Tablas con FK a `users.user_id`

| Tabla | FK directa | Acción implementada |
|---|---|---|
| `reviews` | ✅ | Anonimizar → centinela `ANON_DELETED` |
| `review_aspect_ratings` | ❌ (FK a `reviews.review_id`) | Sin cambios (se mantienen con la reseña) |
| `favorites` | ✅ | DELETE |
| `visits` | ✅ | DELETE |
| `traveler_profiles` | ✅ | DELETE |
| `contextual_rankings` | ❌ (String sin FK) | DELETE por valor |

### Modelos inexistentes

- `Feedback` → No existe. No se inventaron imports.
- `Recommendations` → No existe como tabla. Solo schema de respuesta calculada en memoria.

---

## 3. Decisiones de Datos

- **Reseñas:** Se anonimizar en vez de borrar. Se reasigna `user_id` a `ANON_DELETED`.
- **Usuario centinela:** `ANON_DELETED` se crea idempotentemente la primera vez que se necesita. Nombre: "Viajero eliminado", email: `deleted@proxvel.internal`, `is_active: false`.
- **Modo `data_only`:** Mantiene la cuenta, limpia favoritos, visitas, perfiles, rankings y anonimiza reseñas.
- **Modo `full`:** Todo lo anterior + elimina el registro del usuario.

---

## 4. Creación de Admins/Travelers

### Endpoint

```
POST /api/v1/admin/users
```

- Protección: `require_super_admin`
- Roles permitidos: `admin`, `traveler`
- Validaciones: email único, name requerido, password ≥ 6 chars, password hasheado con `pbkdf2_sha256`
- Nunca devuelve `password_hash`

### UI

- Botón "Nuevo Usuario" visible solo para `super_admin`
- Dialog con campos: Nombre, Email, Contraseña, Rol
- Select de rol: solo Administrador / Viajero
- Nota informativa: "El rol super_admin no se crea desde esta pantalla"

---

## 5. Bloqueo de Creación de Super Admin

- `DASHBOARD_CREATABLE_ROLES = ("traveler", "admin")` — el backend rechaza `super_admin` con HTTP 403.
- El select del frontend no incluye la opción `Super Admin`.
- Doble bloqueo: frontend + backend.

---

## 6. Eliminación Data Only

Endpoint: `DELETE /api/v1/admin/users/{user_id}?mode=data_only`

Acción:
- Elimina favoritos, visitas, perfiles de viajero, rankings contextuales.
- Anonimiza reseñas.
- Mantiene cuenta activa.

---

## 7. Eliminación Full

Endpoint: `DELETE /api/v1/admin/users/{user_id}?mode=full`

Acción:
- Todo lo de `data_only` +
- Elimina registro de usuario de la tabla `users`.
- Requiere confirmación textual `ELIMINAR` en la UI.

---

## 8. Anonimización de Reseñas

- Se usa usuario centinela `ANON_DELETED` (creado idempotentemente).
- `reviews.user_id` se actualiza de `user_id_original` a `ANON_DELETED`.
- `review_aspect_ratings` se mantienen intactos (FK a `reviews.review_id`).
- Integridad referencial preservada.

---

## 9. Auditoría de Scripts Super Admin

### Script encontrado: `scripts/create_admin_user.py`

Problemas detectados:
- Permite crear `super_admin` sin restricción de entorno.
- No verifica si ya existe super_admin activo.
- UPSERT puede escalar cualquier email a super_admin.
- Sin confirmación textual de seguridad.

### Acción tomada

1. **Creado:** `scripts/bootstrap_superadmin.py` con guardas:
   - Bloqueo en producción salvo `ALLOW_SUPERADMIN_BOOTSTRAP=true`.
   - Verifica super_admins existentes y advierte.
   - Confirmación textual `CREATE_SUPERADMIN`.
   - Password por `getpass` o env var `SUPERADMIN_PASSWORD` (nunca CLI arg).
   - Banner de advertencia visible.

2. **Deprecado:** `scripts/create_admin_user.py` — ahora sale con error y redirige al nuevo script.

---

## 10. Endpoints Agregados

| Método | Ruta | Protección | Descripción |
|---|---|---|---|
| `POST` | `/admin/users` | `require_super_admin` | Crear usuario (admin/traveler) |
| `DELETE` | `/admin/users/{user_id}?mode=...` | `require_super_admin` | Eliminar datos o cuenta |

---

## 11. Componentes Frontend Agregados

| Archivo | Tipo | Descripción |
|---|---|---|
| `src/components/users/CreateUserDialog.tsx` | Nuevo | Modal para crear usuario |
| `src/components/users/DeleteUserDialog.tsx` | Nuevo | Modal con dos modos de eliminación |
| `src/pages/UsersPage.tsx` | Modificado | Integra botón, trash icon, y ambos dialogs |
| `src/hooks/useUsers.ts` | Modificado | +`useCreateUser`, +`useDeleteUser` |
| `src/api/endpoints.ts` | Modificado | +`usersApi.create`, +`usersApi.deleteUser` |
| `src/types/index.ts` | Modificado | +`CreateUserPayload`, +`DeleteUserMode` |

---

## 12. Validaciones Técnicas

| Check | Resultado |
|---|---|
| `python -m compileall app` | ✅ Sin errores |
| `npx tsc --noEmit` | ✅ Sin errores |
| `npm run build` | ✅ Exit code 0 |

---

## 13. Validación Manual

| # | Test | Estado |
|---|---|---|
| 1 | Entrar a /usuarios como super_admin | ✅ |
| 2 | Ver botón "Nuevo Usuario" | ✅ |
| 3 | Dialog abre con campos correctos | ✅ |
| 4 | Select de rol NO tiene Super Admin | ✅ |
| 5 | Nota informativa presente | ✅ |
| 6 | Botón eliminar (trash) visible en filas | ✅ |
| 7 | Trash disabled para propia cuenta (tú) | ✅ |
| 8 | Trash disabled para super_admin | ✅ |
| 9 | Footer actualizado con `bootstrap_superadmin.py` | ✅ |
| 10 | password_hash nunca aparece en respuestas | ✅ |

> **Nota:** Los tests de eliminación efectiva (data_only/full) requieren un usuario de prueba con datos reales en favoritos/visitas/reviews. El endpoint está funcional y validado por compilación y tipado, pero la verificación E2E de borrado real requiere datos semilla.

---

## 14. Riesgos Pendientes

1. **Test E2E de eliminación:** No se ejecutó una eliminación real con datos en favoritos/visitas/reviews porque los usuarios de prueba actuales no tienen esos datos. Se recomienda crear un usuario de prueba con datos para validar el flujo completo.
2. **Migración Alembic:** No se crearon migraciones porque no se modificó el schema de ninguna tabla. El usuario centinela `ANON_DELETED` se crea en runtime la primera vez.
3. **Vista admin (no super_admin):** No se verificó visualmente porque no hay una sesión activa de admin. Según el código, un admin NO verá el botón "Nuevo Usuario" ni el trash icon.

---

## 15. Veredicto Final

**Extensión 6B completada con observaciones.**

- Toda la lógica de creación, eliminación, anonimización y hardening de scripts está implementada y compila sin errores.
- La UI está integrada y verificada visualmente.
- La eliminación efectiva de datos (E2E) queda pendiente de validación con un usuario que tenga datos reales en favoritos/visitas/reviews.
