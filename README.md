# Frontend — Pólux V2

El frontend está construido con **React + Vite** y proporciona la interfaz de usuario para interactuar con la API del backend. Permite a los usuarios ingresar, editar y visualizar dedicaciones, desembolsos, ingresos, sueldos y otros datos relevantes para el costeo. 

---

## Estructura del Directorio

```
frontend-ap-v2
├── node_modules
├── public
└── src
    ├── api
    │   ├── auth
    │   ├── clients
    │   ├── costeo
    │   ├── costeo_mensual
    │   ├── dashboards
    │   ├── dedications
    │   ├── holidays
    │   ├── income
    │   ├── income_mensual
    │   ├── outlay
    │   ├── projects
    │   ├── roles
    │   ├── salaries
    │   ├── users
    │   └── utilidad
    ├── assets
    ├── components
    │   ├── Alerts
    │   ├── ButtonsSubmits
    │   ├── Chat
    │   ├── ConsolidationDedicationsTable
    │   ├── CosteoMensualSection
    │   ├── DedicationsSectionEdit
    │   ├── EditableFormSection
    │   ├── HeaderPages
    │   ├── IncomeSection
    │   ├── IncomeSectionEdit
    │   ├── InputSelect
    │   ├── LoadingCosteo
    │   ├── LoadingSpinner
    │   ├── OutlaysSectionEdit
    │   ├── PaginationProjectsTable
    │   ├── ProjectsTable
    │   ├── SalariesSectionEdit
    │   ├── SideNav
    │   ├── SubmitButtonsCsv
    │   ├── TableBodyHistoryDedications
    │   ├── TableDedications
    │   ├── TableHistoryDedications
    │   ├── TableResultCosteoMensual
    │   ├── TableResultIngresos
    │   ├── TableResultIngresosEdit
    │   ├── TableResultUtilidad
    │   ├── TableRowHistoryDedications
    │   ├── TableUploadIncomes
    │   ├── TableUploadSalaries
    │   ├── Tabs
    │   ├── TabsCosteo
    │   ├── TabsEditar
    │   ├── TabsTableDedications
    │   ├── TabsViewMode
    │   └── UtilidadSection
    ├── context
    ├── dashboard
    │   ├── costeo
    │   ├── create-client
    │   ├── create-project
    │   ├── create-user
    │   ├── dedications
    │   ├── disable-user
    │   ├── edit
    │   ├── edit-profile
    │   ├── finish-project
    │   ├── holidays
    │   ├── home
    │   ├── incomes
    │   ├── login
    │   ├── monitoring
    │   ├── outlays
    │   ├── projects
    │   ├── reporte
    │   ├── salaries
    │   ├── soporte
    │   └── unauthorized
    ├── functions
    ├── hooks
    ├── interfaces
    │   ├── auth
    │   ├── clients
    │   ├── costeo
    │   ├── dashboards
    │   ├── dedications
    │   ├── income
    │   ├── outlay
    │   ├── projects
    │   ├── roles
    │   ├── salaries
    │   └── users
    ├── store
    ├── utils
    │   ├── date
    │   ├── outlays
    │   └── projects
    ├── AppRouting.tsx
    ├── index.css
    └── main.tsx
├── .env
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Requisitos Previos

- **Node.js** v18 o superior
- **npm** v9 o superior

---

## Instalación

1. Navega al directorio del frontend:

```bash
cd tu_proyecto/frontend-ap-v2
```

2. Instala las dependencias:

```bash
npm install
```

---

## Configuración

Crea un archivo `.env` en la raíz del directorio `frontend-ap-v2` y configura las variables de entorno necesarias:

```env
VITE_API_URL=http://localhost:3000/api
```

> **Nota:** A diferencia de Create React App, Vite requiere que las variables de entorno estén prefijadas con `VITE_` para ser accesibles desde el código.

---

## Uso

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

El servidor se ejecutará en **`http://localhost:5173`** por defecto.

Para generar el build de producción:

```bash
npm run build
```

Para previsualizar el build de producción localmente:

```bash
npm run preview
```

---

## Contribución

Si deseas contribuir al proyecto, por favor sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una nueva rama:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. Realiza tus cambios y haz commit:
   ```bash
   git commit -am 'Agrega nueva funcionalidad'
   ```
4. Envía tus cambios:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
5. Crea un **Pull Request** hacia la rama principal.

---

## Tecnologías Principales

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router DOM](https://reactrouter.com/)
- [SweetAlert2](https://sweetalert2.github.io/)
- [Day.js](https://day.js.org/)
- [Zustand](https://zustand-demo.pmnd.rs/)