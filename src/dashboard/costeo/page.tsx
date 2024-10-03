import { useEffect, useState } from 'react'
import {
  Alerts,
  CosteoMensualSection,
  IncomeSection,
  TabsCosteo,
  UtilidadSection,
} from '../../components'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'

export default function CosteoPage() {
  const [activeTab, setActiveTab] = useState('utilidad')
  const [alert, setAlert] = useState(false)
  const [error] = useState({
    success: false,
    msg: '',
  })

  const navigate = useNavigate()
  useEffect(() => {
    checkTokenAndRedirect(navigate)
  }, [navigate])

  const handleChangeActiveTab = (tab: string) => {
    setActiveTab(tab)
  }

  const handleCloseAlert = () => {
    setAlert(false)
  }

  return (
    <>
      {alert && (
        <Alerts
          message={
            error.success === false
              ? 'Ha ocurrido un error: '
              : 'Registro Exitoso:'
          }
          success={error.success}
          subtitle={error.msg}
          close={handleCloseAlert}
        />
      )}
      <TabsCosteo
        active={activeTab}
        handleChangeActiveTab={handleChangeActiveTab}
      />

      {activeTab === 'utilidad' && <UtilidadSection />}

      {activeTab === 'ingresos' && <IncomeSection />}

      {activeTab === 'costeo-mensual' && <CosteoMensualSection />}
    </>
  )
}
