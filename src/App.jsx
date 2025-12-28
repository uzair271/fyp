import { AppProvider } from './context/AppContext'
import AppRoutes from './AppRoutes'

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}

export default App

