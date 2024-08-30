import { Route, Routes } from 'react-router-dom'
import Projects from './dashboard/projects/page'
import Dedications from './dashboard/dedications/page'
import CreateClient from './dashboard/create-client/page'
import { HomeProvider } from './context/HomeContext'
import SideNav from './components/SideNav/Sidenav'
import Home from './dashboard/home/Home'
import CreateProject from './dashboard/create-project/page'
import FinishProject from './dashboard/finish-project/page'
import MonitoringPage from './dashboard/monitoring/page'
import CreateUser from './dashboard/create-user/page'
import EditProfile from './dashboard/edit-profile/page'
import OutlaysPage from './dashboard/outlays/page'
import IncomesPage from './dashboard/incomes/page'
import SalariesPage from './dashboard/salaries/page'
import Holidays from './dashboard/holidays/page'
import Login from './dashboard/login/Login'

const AppLayout = () => {
  return (
    <div className="flex">
      <SideNav />
      <div className="flex-grow m-10">
        <Routes>
          <Route path="/dashboard/proyectos" element={<Projects />} />
          <Route path="/dashboard/crear-cliente" element={<CreateClient />} />
          <Route path="/dashboard/agregar-horas" element={<Dedications />} />
          <Route path="/dashboard/inicio" element={<Home />} />
          <Route path="/dashboard/crear-proyecto" element={<CreateProject />} />
          <Route
            path="/dashboard/terminar-proyecto"
            element={<FinishProject />}
          />
          <Route path="/dashboard/monitoreo" element={<MonitoringPage />} />
          <Route path="/dashboard/crear-usuario" element={<CreateUser />} />
          <Route
            path="/dashboard/eliminar-usuario"
            element={<FinishProject />}
          />
          <Route path="/dashboard/editar-perfil" element={<EditProfile />} />
          <Route
            path="/dashboard/registrar-desembolsos"
            element={<OutlaysPage />}
          />
          <Route
            path="/dashboard/registrar-ingresos"
            element={<IncomesPage />}
          />
          <Route
            path="/dashboard/registrar-sueldos"
            element={<SalariesPage />}
          />
          <Route path="/dashboard/dia-libre" element={<Holidays />} />
        </Routes>
      </div>
    </div>
  )
}

const AppRouting = () => {
  return (
    <HomeProvider>
      <Routes>
        <Route path="/iniciar-sesion" element={<Login />} />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </HomeProvider>
  )
}

export default AppRouting
