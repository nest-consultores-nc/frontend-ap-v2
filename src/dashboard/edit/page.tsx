import { useEffect, useState } from 'react'
import {
  Alerts,
  
} from '../../components'
import { useNavigate } from 'react-router-dom'
import { checkTokenAndRedirect } from '../../functions/checkTokenAndRedirect'
import { TabsEditar } from '../../components/TabsEditar/TabsEditar'
import { OutlaysSectionEdit } from '../../components/OutlaysSectionEdit/OutlaysSectionEdit'
import { IncomeSectionEdit } from '../../components/IncomeSectionEdit/IncomeSectionEdit'
import { SalariesSectionEdit } from '../../components/SalariesSectionEdit/SalariesSectionEdit'
import { DedicationsSectionEdit } from '../../components/DedicationsSectionEdit/DedicationsSectionEdit'


export default function EditarPage() {
  const [activeTab, setActiveTab] = useState('desembolsos')
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
          message={ error.success === false ? 'Ha ocurrido un error: ' : 'Registro Exitoso:'}
          success={error.success}
          subtitle={error.msg}
          close={handleCloseAlert}
        />
      )}

      <TabsEditar
        active={activeTab}
        handleChangeActiveTab={handleChangeActiveTab}
      />

      {activeTab === 'desembolsos' && <OutlaysSectionEdit />}
      {activeTab === 'ingresos' && <IncomeSectionEdit />}
      {activeTab === 'salarios' && <SalariesSectionEdit />}
      {activeTab === 'dedicaciones' && <DedicationsSectionEdit />}

    </>
  )

}
