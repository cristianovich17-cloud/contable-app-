# ⚡ QUICK REFERENCE — TARJETA DE BOLSILLO

## 🎯 ESTADO AHORA
```
Proyecto:   Sistema Contable Integral
Progreso:   85% ✅
Build:      Exitoso (0 TS errors)
Siguiente:  Staging deployment
Tiempo:     1 semana a producción 🚀
```

---

## 🚀 3 COMANDOS MÁS IMPORTANTES

### 1️⃣ LEVANTAR SERVIDOR
```bash
npm run dev
# → http://localhost:3000
```

### 2️⃣ VALIDAR BUILD
```bash
npm run build && npx tsc --noEmit
# → Expect: ✓ Compiled successfully, 0 errors
```

### 3️⃣ EJECUTAR E2E TEST
```bash
bash scripts/e2e-test.sh
# → Expect: ✅ E2E Test Complete!
```

---

## 🔑 CREDENCIALES DEMO

```
Email:    admin@example.com
Password: AdminPassword123!
Role:     Admin

Otros:
contador@example.com / AdminPassword123! (Contador)
visor@example.com / AdminPassword123! (Visor)
```

---

## 📚 DOCUMENTOS POR NECESIDAD

| Necesidad | Archivo |
|-----------|---------|
| "¿Qué debo hacer?" | `PROXIMOS_PASOS.md` |
| "¿Dónde estamos?" | `ESTADO_FINAL.md` |
| "Línea de tiempo?" | `ROADMAP_VISUAL.md` |
| "Verificar todo?" | `CHECKLIST_ACTUAL.md` |
| "Resumen sesión?" | `RESUMEN_SESION_19NOV.md` |

---

## ⏰ PRÓXIMOS PASOS (Hoy/Esta Semana)

| # | Tarea | Tiempo | Status |
|---|-------|--------|--------|
| 1 | E2E Tests | 20 min | ⏳ |
| 2 | JWT_SECRET | 5 min | ⏳ |
| 3 | Migraciones | 5 min | ⏳ |
| 4 | Build Check | 10 min | ⏳ |
| 5 | Vercel Setup | 10 min | ⏳ |
| 6 | Deploy Stage | 10 min | ⏳ |
| 7 | Validar Stage | 15 min | ⏳ |

**Total:** ~75 min → STAGING LIVE

---

## 🔧 COMANDOS ÚTILES

```bash
# Desarrollo
npm run dev                    # Servidor local
npm run build                  # Build producción
npx tsc --noEmit              # TypeScript check

# Base de datos
node scripts/seed-runner.js   # Crear usuarios demo
npx prisma migrate dev        # Nuevas migraciones
npx prisma db push           # Actualizar BD

# Testing
bash scripts/e2e-test.sh      # E2E tests

# Deployment
git push origin main          # → Auto-deploy a Vercel
```

---

## 🎯 META ESTA SEMANA

✅ Completar E2E tests  
✅ Deploy a staging Vercel  
✅ Validar en staging  
✅ Agregar rate limiting  

**Resultado:** Production-ready

---

## ⚠️ COSAS A RECORDAR

1. **JWT_SECRET** — Cambiar antes de producción (usar crypto.randomBytes)
2. **PostgreSQL** — Configurar DB producción la próxima semana
3. **Redis** — Opcional para dev, crítico para prod
4. **GitHub Secrets** — VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
5. **Rate Limiting** — Agregar al endpoint /api/auth/login

---

## 🔗 URLS IMPORTANTES

```
LOCAL:      http://localhost:3000
STAGING:    https://contable-app-staging.vercel.app (pronto)
PROD:       https://contable-app.vercel.app (2 semanas)

ADMIN:
  GitHub:   https://github.com/usuario/contable-app
  Vercel:   https://vercel.com/dashboard
  Prisma:   https://prisma.io/studio
```

---

## 📞 EN CASO DE ERROR

| Error | Solución |
|-------|----------|
| Build error | `npm run build` completo |
| TS error | `npx tsc --noEmit` |
| Seed failed | `node scripts/seed-runner.js` |
| API no responde | `curl http://localhost:3000/api/health` |
| Terminal crash | Usar scripts/e2e-test.sh (no heredoc) |

---

## ✨ ÚLTIMA ACTUALIZACIÓN

**Fecha:** 19 NOV 2025  
**Cambios:** +8 archivos, +3 actualizados  
**Documentación:** +1,350 líneas  
**Estado:** 85% → 100% en 1 semana  

---

*Sistema Contable — Quick Reference*  
*Guía rápida para desarrollo diario*
