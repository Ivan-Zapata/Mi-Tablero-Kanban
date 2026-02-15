# 📋 Mi Tablero Kanban

Una aplicación simple para organizar tus tareas con el método Kanban. Crea, mueve y gestiona tus tareas fácilmente.

## 🚀 ¿Qué hace?

- ✅ Crea tareas rápidamente
- 🖱️ Arrastra tareas entre columnas (Por Hacer, En Progreso, Completado)
- 💾 Guarda todo en base de datos PostgreSQL
- 🔄 Se actualiza automáticamente

## 🛠️ Tecnologías usadas

- Next.js 16
- React 19
- TypeScript
- PostgreSQL (Supabase)
- Tailwind CSS
- Drag & Drop con @dnd-kit

## 📦 Instalación

1. Clona el repo:
```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
```

2. Instala dependencias:
```bash
npm install
```

3. Configura tu base de datos en `.env.local`:

**Para desarrollo local:**
```env
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=next
```

**Para Vercel/Supabase:**
```env
POSTGRES_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres
```

4. Crea la tabla en tu base de datos:
```sql
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  inserted_at TIMESTAMP DEFAULT NOW()
);
```

5. Ejecuta el proyecto:
```bash
npm run dev
```

Visita: http://localhost:3000

## 🚀 Desplegar en Vercel

1. Sube a GitHub
2. Importa en [Vercel](https://vercel.com)
3. Agrega la variable `POSTGRES_URL` en Settings > Environment Variables
4. ¡Listo!

## 📂 Estructura

```
app/
  api/tasks/       # API para CRUD de tareas
  page.tsx         # Página principal
components/Board/  # Componentes del tablero
lib/db.ts         # Conexión a base de datos
store/            # Estado global con Zustand
```

## 👨‍💻 Autor

Desarrollado por Ivan Zapata

---

Hecho con ❤️ y ☕
